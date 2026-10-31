import { createOwnerOAuthClient, createOAuthDriveRequest, DriveError, type DriveRequest, type OwnerOAuthConfig } from './oauth.js';
export { DriveError } from './oauth.js';
export type { DriveRequest } from './oauth.js';
import { createHash } from 'node:crypto';
import type { ParticipantDrive } from '../participant-folders.js';

export const defaultParentId = '16PGOXHpM1WBmD9XVqbqxAQ27zpu7bGWJ';
export const defaultTemplateId = '1eYJvxcDL-3BuzuaMWaC3pRWl5htz9X_rA0C-sLQj9DY';
interface DriveFile {
  id: string;
  mimeType: string;
  trashed?: boolean;
  driveId?: string;
  parents?: string[];
  owners?: { emailAddress?: string }[];
  appProperties?: Record<string, string>;
  capabilities?: { canAddChildren?: boolean; canCopy?: boolean; canShare?: boolean };
}
interface Permission { id?: string; type: string; emailAddress?: string; role: string; }
const folderType = 'application/vnd.google-apps.folder';
const docType = 'application/vnd.google-apps.document';
const fileFields = 'id,mimeType,trashed,driveId,owners(emailAddress),parents,appProperties';
function parameters(values: Record<string, string>) { return new URLSearchParams({ supportsAllDrives: 'true', ...values }).toString(); }
function safeId(id: string) {
  if (!/^[\w-]+$/.test(id)) throw new Error('Invalid Google resource ID');
  return id;
}
export function createParticipantDrive(config: { parentId: string; templateId: string; staffEmails: string[]; ownerEmail: string }, request: DriveRequest): ParticipantDrive {
  const parent = safeId(config.parentId), template = safeId(config.templateId);
  const ownerEmail = config.ownerEmail.trim().toLowerCase();
  let checked = false;
  function owned(resource: DriveFile) {
    return !resource.driveId && resource.owners?.length === 1 && resource.owners[0].emailAddress?.toLowerCase() === ownerEmail;
  }
  function validFolder(resource: DriveFile, marker: string) {
    return owned(resource) && !resource.trashed && resource.mimeType === folderType && resource.parents?.includes(parent) && resource.appProperties?.ebsParticipant === marker;
  }
  const file = (id: string) => request<DriveFile>(`files/${safeId(id)}?${parameters({ fields: fileFields })}`);
  async function permissions(id: string) {
    const all: Permission[] = [];
    let pageToken = '';
    do {
      const page = await request<{ permissions?: Permission[]; nextPageToken?: string }>(`files/${safeId(id)}/permissions?${parameters({ fields: 'permissions(id,type,emailAddress,role),nextPageToken', pageSize: '100', ...(pageToken ? { pageToken } : {}) })}`);
      all.push(...page.permissions || []);
      pageToken = page.nextPageToken || '';
    } while (pageToken);
    return all;
  }
  return {
    async preflight() {
      checked = false;
      const identity = await request<{ user?: { emailAddress?: string } }>('about?fields=user(emailAddress)');
      if (identity.user?.emailAddress?.toLowerCase() !== ownerEmail) throw new Error('EBS owner identity mismatch');
      const destination = await request<DriveFile>(`files/${parent}?${parameters({ fields: 'id,mimeType,trashed,driveId,owners(emailAddress),capabilities(canAddChildren,canShare)' })}`);
      if (!owned(destination) || destination.trashed || destination.mimeType !== folderType || !destination.capabilities?.canAddChildren || !destination.capabilities?.canShare) throw new Error('Personal EBS destination unavailable');
      const allowed = new Set([ownerEmail, ...config.staffEmails.map(email => email.toLowerCase())]);
      const inherited = await permissions(parent);
      // This explicit allowlist prevents accidental creation under a parent shared
      // with participants, a whole domain, or anyone with a link. Group membership
      // must be checked by EBS staff before enabling the feature.
      if (!inherited.length || inherited.some(permission => !['user', 'group'].includes(permission.type) || !permission.emailAddress || !allowed.has(permission.emailAddress.toLowerCase()))) throw new Error('Destination access requires staff review');
      const source = await request<DriveFile>(`files/${template}?${parameters({ fields: 'id,mimeType,trashed,capabilities(canCopy)' })}`);
      if (source.trashed || source.mimeType !== docType || !source.capabilities?.canCopy) throw new Error('Document template unavailable');
      checked = true;
    },
    async generateFolderId() {
      if (!checked) throw new Error('Drive preflight required');
      const response = await request<{ ids: string[] }>('files/generateIds?count=1&space=drive&type=files');
      return safeId(response.ids[0]);
    },
    async ensureFolder(id, userId, email) {
      if (!checked) throw new Error('Drive preflight required');
      const marker = createHash('sha256').update(userId).digest('hex');
      try {
        const existing = await file(id);
        if (!validFolder(existing, marker)) throw new Error('Folder moved or does not belong to this participant');
        return;
      } catch (error) {
        if (!(error instanceof DriveError) || error.status !== 404) throw error;
      }
      try {
        await request(`files?${parameters({ fields: 'id', ignoreDefaultVisibility: 'true' })}`, 'POST', {
          id: safeId(id), name: `EBS research — ${email}`, mimeType: folderType, parents: [parent], appProperties: { ebsParticipant: marker },
        });
      } catch (error) {
        if (!(error instanceof DriveError) || error.status !== 409) throw error;
        const existing = await file(id);
        if (!validFolder(existing, marker)) throw new Error('Conflicting folder');
      }
      if (!validFolder(await file(id), marker)) throw new Error('Created folder ownership unavailable');
    },
    async findDocument(folderId) {
      if (!checked) throw new Error('Drive preflight required');
      const query = new URLSearchParams({
        q: `'${safeId(folderId)}' in parents and trashed = false and appProperties has { key='ebsParticipantDoc' and value='${safeId(folderId)}' }`,
        corpora: 'user', spaces: 'drive', fields: 'files(id),nextPageToken,incompleteSearch', pageSize: '100',
      });
      const page = await request<{ files?: { id: string }[]; nextPageToken?: string; incompleteSearch?: boolean }>(`files?${query}`);
      if (page.incompleteSearch || page.nextPageToken || (page.files?.length || 0) > 1) throw new Error('Document copies require staff review');
      return page.files?.[0]?.id || null;
    },
    async copyDocument(folderId) {
      if (!checked) throw new Error('Drive preflight required');
      const created = await request<{ id: string }>(`files/${template}/copy?${parameters({ fields: 'id', ignoreDefaultVisibility: 'true' })}`, 'POST', {
        name: 'EBS research document', parents: [safeId(folderId)], appProperties: { ebsParticipantDoc: folderId },
      });
      return safeId(created.id);
    },
    async validateDocument(folderId, documentId) {
      const document = await file(documentId);
      if (!owned(document) || document.trashed || document.mimeType !== docType || !document.parents?.includes(folderId) || document.appProperties?.ebsParticipantDoc !== folderId) throw new Error('Document moved or does not belong to this folder');
    },
    async shareFolder(folderId, email) {
      if (!checked) throw new Error('Drive preflight required');
      const current = await permissions(folderId);
      const match = current.find(permission => permission.type === 'user' && permission.emailAddress?.toLowerCase() === email);
      if (match && ['writer', 'fileOrganizer', 'organizer', 'owner'].includes(match.role)) return;
      if (match?.id) {
        await request(`files/${safeId(folderId)}/permissions/${safeId(match.id)}?${parameters({ fields: 'id' })}`, 'PATCH', { role: 'writer' });
      } else {
        // The participant receives the link in the site; creating a folder does not send email.
        await request(`files/${safeId(folderId)}/permissions?${parameters({ fields: 'id', sendNotificationEmail: 'false' })}`, 'POST', { type: 'user', role: 'writer', emailAddress: email });
      }
    },
  };
}
export function ownerAccountDrive(config: { parentId: string; templateId: string; staffEmails: string[] } & OwnerOAuthConfig): ParticipantDrive {
  return createParticipantDrive(config, createOAuthDriveRequest(createOwnerOAuthClient(config)));
}
