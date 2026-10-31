import { next } from '@vercel/functions';
import { createAccessHandlers, privateHeaders } from './server/access.js';
import { clerkAccess } from './server/clerk.js';
import { isProtectedPath, isAccountPath } from './src/access-policy.js';

export const config = { runtime: 'nodejs' };
export default async function middleware(request: Request) {
  const response = await createAccessHandlers(clerkAccess).protect(request);
  if (response) return response;
  const continuation = next();
  if ((isProtectedPath(new URL(request.url).pathname) || isAccountPath(new URL(request.url).pathname))) {
    for (const [name, value] of Object.entries(privateHeaders)) continuation.headers.set(name, value);
  }
  return continuation;
}
