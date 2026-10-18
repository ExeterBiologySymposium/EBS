export function clerkBuildDefines(env: Record<string, string | undefined>): Record<string, string> {
  const publishableKey = env.VITE_CLERK_PUBLISHABLE_KEY?.trim() || env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim();
  if (env.VERCEL_ENV === 'production' && !publishableKey) {
    throw new Error('Clerk production requires a publishable key: set VITE_CLERK_PUBLISHABLE_KEY or NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY in Vercel.');
  }
  if (!publishableKey) return {};
  if (!/^pk_(test|live)_\S+$/.test(publishableKey)) {
    throw new Error('Clerk requires a valid publishable key, never a secret key.');
  }
  if (env.VERCEL_ENV === 'production' && !publishableKey.startsWith('pk_live_')) {
    throw new Error('Clerk production requires a pk_live_ publishable key.');
  }
  return { 'import.meta.env.VITE_CLERK_PUBLISHABLE_KEY': JSON.stringify(publishableKey) };
}
