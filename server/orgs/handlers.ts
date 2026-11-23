import { privateHeaders } from '../access.js';
import { OrganizationProblem, type Destination, type Result } from './types.js';
import type { OrganizationService } from './service.js';
import { provisionFolder, type FolderDependencies, type FolderResult } from '../participant-folders.js';
import { validFolderLink } from '../../src/folder-link.js';

export function adminResponse(status: number, value: object) {
  return Response.json(value, { status, headers: { ...privateHeaders, 'X-Content-Type-Options': 'nosniff', ...(status === 202 || status === 429 ? { 'Retry-After': '5' } : {}) } });
}
export async function readBody(request: Request): Promise<Record<string, unknown>> {
  if (Number(request.headers.get('content-length')) > 4096) throw new OrganizationProblem('invalid-request', 413);
  const reader = request.body?.getReader(); if (!reader) throw new OrganizationProblem('invalid-request', 400);
  const decoder = new TextDecoder(); let text = '', size = 0;
  try {
    for (;;) {
      const next = await reader.read(); if (next.done) break;
      size += next.value.byteLength;
      if (size > 4096) { await reader.cancel(); throw new OrganizationProblem('invalid-request', 413); }
      text += decoder.decode(next.value, { stream: true });
    }
    text += decoder.decode();
  } finally { reader.releaseLock(); }
  let body: unknown;
  try { body = JSON.parse(text); } catch { throw new OrganizationProblem('invalid-request', 400); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new OrganizationProblem('invalid-request', 400);
  return body as Record<string, unknown>;
}
export const exact = (body: object, fields: string) => Object.keys(body).sort().join(',') === fields;
export const emailValue = (email: unknown): email is string => typeof email === 'string' && email.trim().length <= 254 && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email.trim());
const userValue = (id: unknown): id is string => typeof id === 'string' && /^user_[a-zA-Z0-9]{1,128}$/.test(id);
const destinationValue = (value: unknown): value is Destination => value === 'pending' || value === 'accepted';
type FolderState = FolderResult['state'];
export type ParticipantAdminResult = Result & { folderState?: FolderState };

export function createAdminHandlers({ authenticate, service, teamId, folderLinks, researchFolders }: {
  authenticate(request: Request): Promise<string | null>;
  service: OrganizationService;
  teamId: string;
  folderLinks: { get(userId: string): Promise<string | null>; set(userId: string, folderUrl: string | null): Promise<void> };
  researchFolders: FolderDependencies;
}) {
  async function requireAccepted(userId: string) {
    if (await service.membership(userId) !== 'accepted') throw new OrganizationProblem('not-accepted', 409);
  }
  async function createResearchFolder(userId: string): Promise<FolderState> {
    await requireAccepted(userId);
    const { customUrl, googleEmail } = await researchFolders.participant(userId);
    if (customUrl) return 'custom';
    if (!googleEmail) return 'link-google';
    const { store, drive } = researchFolders.googleFolder();
    return (await provisionFolder(userId, googleEmail, store, drive)).state;
  }
  async function approvalResponse(userId: string, result: Result): Promise<Response> {
    let folderState: FolderState;
    try {
      folderState = await createResearchFolder(userId);
    } catch {
      // Membership is already committed. Return a separate, private folder outcome.
      folderState = 'unavailable';
    }
    return adminResponse(200, { ...result, folderState } satisfies ParticipantAdminResult);
  }
  return { async fetch(request: Request): Promise<Response> {
    if (!['GET', 'POST'].includes(request.method)) return adminResponse(405, { state: 'method-not-allowed' });
    if (request.method === 'POST') {
      if (request.headers.get('origin') !== new URL(request.url).origin) return adminResponse(403, { state: 'forbidden' });
      if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') return adminResponse(415, { state: 'invalid-request' });
    }
    try {
      const actor = await authenticate(request);
      if (!actor) return adminResponse(401, { state: 'signed-out' });
      if (!await service.isTeam(actor)) return adminResponse(403, { state: 'forbidden' });
      if (request.method === 'GET') {
        const query = new URL(request.url).searchParams;
        if (query.get('action') === 'folder-link') {
          const userId = query.get('userId');
          if ([...query.keys()].sort().join(',') !== 'action,userId' || !userValue(userId)) throw new OrganizationProblem('invalid-request', 400);
          await requireAccepted(userId);
          return adminResponse(200, { folderUrl: await folderLinks.get(userId) });
        }
        if (query.get('action') === 'folder-roster') {
          if ([...query.keys()].join(',') !== 'action') throw new OrganizationProblem('invalid-request', 400);
          return adminResponse(200, { participants: await service.folderRoster() });
        }
        if ([...query.keys()].some(key => !['action', 'group', 'cursor'].includes(key))) throw new OrganizationProblem('invalid-request', 400);
        switch (query.get('action')) {
          case 'status': return adminResponse(200, { state: 'allowed', teamOrganizationId: teamId });
          case 'availability': return adminResponse(200, await service.availability());
          case 'invitations': return adminResponse(200, await service.listInvitations(query.get('cursor')));
          case 'members': {
            const group = query.get('group');
            if (destinationValue(group)) return adminResponse(200, await service.listMembers(group, query.get('cursor')));
          }
        }
        throw new OrganizationProblem('invalid-request', 400);
      }
      const body = await readBody(request);
      if (body.action === 'folder-link' && exact(body, 'action,folderUrl,userId') && userValue(body.userId)) {
        const folderUrl = validFolderLink(body.folderUrl);
        if (body.folderUrl !== null && !folderUrl) throw new OrganizationProblem('invalid-folder-link', 400);
        await requireAccepted(body.userId);
        await folderLinks.set(body.userId, folderUrl);
        return adminResponse(200, { folderUrl });
      }
      if (body.action === 'create-folder' && exact(body, 'action,userId') && userValue(body.userId)) {
        const state = await createResearchFolder(body.userId);
        const status = state === 'ready' || state === 'custom' ? 200 : state === 'processing' ? 202 : 409;
        return adminResponse(status, { state });
      }
      if (body.action === 'lookup' && exact(body, 'action,email') && emailValue(body.email)) return adminResponse(200, await service.lookup(body.email.trim()));
      if (body.action === 'invite' && exact(body, 'action,destination,email') && emailValue(body.email) && destinationValue(body.destination)) return adminResponse(200, await service.invite(body.email.trim(), body.destination, actor));
      if (body.action === 'add' && exact(body, 'action,destination,email,userId') && userValue(body.userId) && emailValue(body.email) && destinationValue(body.destination)) {
        const result = await service.add(body.userId, body.email.trim(), body.destination, actor);
        return body.destination === 'accepted' ? await approvalResponse(body.userId, result) : adminResponse(200, result);
      }
      if (body.action === 'accept' && exact(body, 'action,userId') && userValue(body.userId)) {
        return await approvalResponse(body.userId, await service.accept(body.userId, actor));
      }
      throw new OrganizationProblem('invalid-request', 400);
    } catch (error) {
      return error instanceof OrganizationProblem ? adminResponse(error.status, { state: error.state }) : adminResponse(503, { state: 'unavailable' });
    }
  } };
}
