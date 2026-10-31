import { isProtectedPath, normalizedPath, safeReturnTo } from '../src/access-policy.js';

export type Membership = 'accepted' | 'pending' | 'unassigned';
export interface AccessDependencies {
  authenticate(request: Request): Promise<string | null>;
  membership(userId: string): Promise<Membership>;
  enrollPending(userId: string): Promise<void>;
}
export const privateHeaders = {
  'Cache-Control': 'private, no-store, max-age=0',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store',
  Vary: 'Cookie, Authorization',
};
function json(status: number, access: string): Response {
  return Response.json({ access }, { status, headers: privateHeaders });
}
export function createAccessHandlers(dependencies: AccessDependencies) {
  async function state(request: Request) {
    const userId = await dependencies.authenticate(request);
    return { userId, access: userId ? await dependencies.membership(userId) : null };
  }
  return {
    async status(request: Request): Promise<Response> {
      if (request.method !== 'GET') return json(405, 'unavailable');
      try { const value = await state(request); return value.userId ? json(200, value.access!) : json(401, 'signed-out'); }
      catch { return json(503, 'unavailable'); }
    },
    async enroll(request: Request): Promise<Response> {
      if (request.method !== 'POST') return json(405, 'unavailable');
      if (request.headers.get('origin') !== new URL(request.url).origin) return json(403, 'unavailable');
      try {
        const value = await state(request);
        if (!value.userId) return json(401, 'signed-out');
        if (value.access === 'unassigned') {
          // Only this verified user can be enrolled, always into Pending.
          await dependencies.enrollPending(value.userId);
          return json(200, await dependencies.membership(value.userId));
        }
        return json(200, value.access!);
      } catch { return json(503, 'unavailable'); }
    },
    async protect(request: Request): Promise<Response | null> {
      const url = new URL(request.url);
      const path = normalizedPath(url.pathname);
      if (/^\/register(?:[/.;]|$)/.test(path)) {
        try {
          if (!await dependencies.authenticate(request)) return null;
          const returnTo = safeReturnTo(url.searchParams.get('returnTo'));
          return new Response(null, { status: 303, headers: { ...privateHeaders, Location: '/account.html' + (returnTo ? '?' + new URLSearchParams({ returnTo }) : '') } });
        } catch { return json(503, 'unavailable'); }
      }
      if (!isProtectedPath(url.pathname)) return null;
      try {
        const value = await state(request);
        if (value.access === 'accepted') return null;
        const path = normalizedPath(url.pathname);
        if (/^\/(resources|datascience|python|rstudio|opensource|events)(?:[/.;]|$)/.test(path)) {
          const returnTo = '/' + path.split('/')[1].replace(/\.html.*$/, '').replace(/;.*$/, '') + '.html';
          return new Response(null, { status: 303, headers: { ...privateHeaders, Location: (value.userId ? '/account.html?' : '/register.html?') + new URLSearchParams({ access: 'required', returnTo }) } });
        }
        return json(value.userId ? 403 : 401, value.userId ? 'pending' : 'signed-out');
      } catch { return json(503, 'unavailable'); }
    },
  };
}
