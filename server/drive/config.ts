import { defaultParentId, defaultTemplateId } from './google.js';

export function driveConfiguration(env: Record<string, string | undefined>) {
  const parentId = env.EBS_DRIVE_PARENT_ID || defaultParentId;
  const templateId = env.EBS_DRIVE_TEMPLATE_ID || defaultTemplateId;
  const connection = env.EBS_DRIVE_DATABASE_URL;
  const clientId = env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = env.GOOGLE_OAUTH_CLIENT_SECRET;
  const refreshToken = env.GOOGLE_OAUTH_REFRESH_TOKEN;
  const ownerEmail = env.GOOGLE_DRIVE_OWNER_EMAIL?.trim().toLowerCase();
  const organizationId = env.CLERK_ACCEPTED_ORG_ID;
  const staffEmails = (env.EBS_DRIVE_STAFF_EMAILS || '').split(',').map(email => email.trim().toLowerCase()).filter(Boolean);
  if (env.EBS_DRIVE_ENABLED !== 'true' || !connection || !clientId || !clientSecret || !refreshToken || !ownerEmail || !organizationId || !staffEmails.length) throw new Error('Folder setup incomplete');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerEmail) || !/^[\w-]+$/.test(parentId) || !/^[\w-]+$/.test(templateId)) throw new Error('Invalid folder setup');
  if (env.VERCEL_ENV !== 'production' && (parentId === defaultParentId || templateId === defaultTemplateId)) throw new Error('Test resources required');
  // Keep the original namespace, preserving existing mapping and recovery records.
  return { parentId, templateId, connection, clientId, clientSecret, refreshToken, ownerEmail, staffEmails, namespace: `${organizationId}:${parentId}:${templateId}` };
}
