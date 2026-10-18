import assert from 'node:assert/strict';
import { clerkBuildDefines } from './clerk-config.ts';

const live = 'pk_live_example';
const dev = 'pk_test_example';
const secret = 'sk_live_do_not_publish';
const expected = { 'import.meta.env.VITE_CLERK_PUBLISHABLE_KEY': JSON.stringify(live) };
assert.deepEqual(clerkBuildDefines({ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: live, CLERK_SECRET_KEY: secret }), expected);
assert.deepEqual(clerkBuildDefines({ VITE_CLERK_PUBLISHABLE_KEY: live }), expected);
assert.deepEqual(clerkBuildDefines({ VITE_CLERK_PUBLISHABLE_KEY: live, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: dev }), expected);
assert.deepEqual(clerkBuildDefines({}), {});
assert.deepEqual(clerkBuildDefines({ VERCEL_ENV: 'preview', VITE_CLERK_PUBLISHABLE_KEY: dev }), { 'import.meta.env.VITE_CLERK_PUBLISHABLE_KEY': JSON.stringify(dev) });
assert.throws(() => clerkBuildDefines({ VERCEL_ENV: 'production' }), /production.*publishable key/i);
assert.throws(() => clerkBuildDefines({ VERCEL_ENV: 'production', NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: dev }), /pk_live_/);
assert.throws(() => clerkBuildDefines({ VERCEL_ENV: 'production', VITE_CLERK_PUBLISHABLE_KEY: 'wrong' }), /publishable key/i);
assert.throws(() => clerkBuildDefines({ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: secret }), /publishable key/i);
console.log('PASS: Clerk public-key mapping, precedence, secret exclusion, and production key validation.');
