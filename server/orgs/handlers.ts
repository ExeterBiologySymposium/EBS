import { privateHeaders } from '../access.js';
import { OrganizationProblem, type Destination } from './types.js';
import type { OrganizationService } from './service.js';

export function adminResponse(status: number, value: object) {
  return Response.json(value, { status, headers: { ...privateHeaders, 'X-Content-Type-Options': 'nosniff', ...(status === 202 || status === 429 ? { 'Retry-After': '5' } : {}) } });
}
async function readBody(request: Request): Promise<Record<string, unknown>> {
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
const exact = (body: object, fields: string) => Object.keys(body).sort().join(',') === fields;
const emailValue = (email: unknown): email is string => typeof email === 'string' && email.trim().length <= 254 && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email.trim());
const userValue = (id: unknown): id is string => typeof id === 'string' && /^user_[a-zA-Z0-9]{1,128}$/.test(id);
const destinationValue = (value: unknown): value is Destination => value === 'pending' || value === 'accepted';

export function createAdminHandlers({ authenticate, service, teamId }: { authenticate(request: Request): Promise<string | null>; service: OrganizationService; teamId: string }) {
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
      if (body.action === 'lookup' && exact(body, 'action,email') && emailValue(body.email)) return adminResponse(200, await service.lookup(body.email.trim()));
      if (body.action === 'invite' && exact(body, 'action,destination,email') && emailValue(body.email) && destinationValue(body.destination)) return adminResponse(200, await service.invite(body.email.trim(), body.destination, actor));
      if (body.action === 'add' && exact(body, 'action,destination,email,userId') && userValue(body.userId) && emailValue(body.email) && destinationValue(body.destination)) return adminResponse(200, await service.add(body.userId, body.email.trim(), body.destination, actor));
      if (body.action === 'accept' && exact(body, 'action,userId') && userValue(body.userId)) return adminResponse(200, await service.accept(body.userId, actor));
      throw new OrganizationProblem('invalid-request', 400);
    } catch (error) {
      return error instanceof OrganizationProblem ? adminResponse(error.status, { state: error.state }) : adminResponse(503, { state: 'unavailable' });
    }
  } };
}
