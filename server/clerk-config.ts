import { createClerkClient } from '@clerk/backend';

export function clerkConfiguration() {
  const secretKey = process.env.CLERK_SECRET_KEY;
  const publishableKey = process.env.VITE_CLERK_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const accepted = process.env.CLERK_ACCEPTED_ORG_ID;
  const pending = process.env.CLERK_PENDING_ORG_ID;
  const origins = (process.env.CLERK_AUTHORIZED_PARTIES || '').split(',').map(value => value.trim()).filter(Boolean);
  if (process.env.VERCEL_ENV === 'preview' && process.env.VERCEL_URL) origins.push(`https://${process.env.VERCEL_URL}`);
  if (!secretKey || !publishableKey || !accepted || !pending || accepted === pending || !origins.length) throw new Error('Member access configuration is incomplete.');
  const client = createClerkClient({ secretKey, publishableKey });
  return { client, accepted, pending, origins, secretKey, publishableKey };
}
export async function authenticateClerk(request: Request): Promise<string | null> {
  const { client, origins } = clerkConfiguration();
  const state = await client.authenticateRequest(request, { authorizedParties: origins, acceptsToken: 'session_token' });
  return state.isAuthenticated ? state.toAuth().userId : null;
}
