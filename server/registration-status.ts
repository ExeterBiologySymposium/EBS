import { createHash, timingSafeEqual } from 'node:crypto';
import { adminResponse, emailValue, exact, readBody } from './orgs/handlers.js';
import type { OrganizationService } from './orgs/service.js';
import { OrganizationProblem, type RegistrationStatus } from './orgs/types.js';

// Read-only registration lookup for the EBS student registration Apps Script
// (apps-script/student-registration, docs/student-registration.md). A dedicated
// bearer token stored in Vercel and Apps Script properties authorizes it. It reports
// whether each address belongs to one verified account and whether that account is
// Pending or Accepted in a registered EBS pool. It never returns names or changes access.
const MAX_EMAILS = 10;
const MAX_EMAIL_LENGTH = 320;
const MIN_TOKEN_LENGTH = 32;
const digest = (value: string) => createHash('sha256').update(value, 'utf8').digest();

export function createRegistrationStatusHandler({ token, service }: {
  token: string | undefined;
  // Built only after the caller is authenticated, so unauthenticated requests never reach Clerk or the registry.
  service: () => Pick<OrganizationService, 'registrationStatus'>;
}) {
  const expected = token && token.length >= MIN_TOKEN_LENGTH ? digest(token) : null;
  return { async fetch(request: Request): Promise<Response> {
    if (request.method !== 'POST') {
      const response = adminResponse(405, { state: 'method-not-allowed' });
      response.headers.set('Allow', 'POST');
      return response;
    }
    if (!expected) return adminResponse(503, { state: 'configuration' });
    const presented = /^Bearer ([\x21-\x7e]{1,512})$/.exec(request.headers.get('authorization') || '')?.[1];
    // Fixed-length digests keep the comparison constant-time regardless of the presented length.
    if (!presented || !timingSafeEqual(digest(presented), expected)) return adminResponse(401, { state: 'unauthorized' });
    if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') return adminResponse(415, { state: 'invalid-request' });
    try {
      const body = await readBody(request);
      const emails = body.emails;
      if (!exact(body, 'emails') || !Array.isArray(emails) || emails.length < 1 || emails.length > MAX_EMAILS
        || !emails.every((email): email is string => typeof email === 'string' && email.length <= MAX_EMAIL_LENGTH)) throw new OrganizationProblem('invalid-request', 400);
      const normalized = emails.map(email => email.trim().toLowerCase());
      if (new Set(normalized).size !== normalized.length) throw new OrganizationProblem('invalid-request', 400);
      const valid = normalized.filter(email => emailValue(email));
      const found = new Map((valid.length ? await service().registrationStatus(valid) : []).map(result => [result.email, result]));
      const results: RegistrationStatus[] = normalized.map(email => found.get(email) ?? { email, account: 'invalid' });
      return adminResponse(200, { results });
    } catch (error) {
      return error instanceof OrganizationProblem ? adminResponse(error.status, { state: error.state }) : adminResponse(503, { state: 'unavailable' });
    }
  } };
}
