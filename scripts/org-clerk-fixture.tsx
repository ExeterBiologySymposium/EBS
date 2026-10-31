import React, { useSyncExternalStore } from 'react';
let active = 'org_other', canInvite = false;
const listeners = new Set<() => void>();
export const enableTeamInvitation = () => { canInvite = true; listeners.forEach(listener => listener()); };
const clerk = { setActive: async ({ organization }: { organization: string }) => { active = organization; listeners.forEach(listener => listener()); } };
export const useClerk = () => clerk;
export function useOrganization() { const id = useSyncExternalStore(listener => { listeners.add(listener); return () => { listeners.delete(listener); }; }, () => active); return { organization: { id }, isLoaded: true }; }
export function Show({ children }: { children: React.ReactNode }) { return canInvite ? children : null; }
export function InviteMembersButton({ children }: { children: React.ReactNode }) { return <div>{children}</div>; }
export function OrganizationProfile() { return <div><p>Mock Clerk profile · Active organization: {active}</p><a href="#/members">Members</a></div>; }
export function SignIn() { return <div>Mock Clerk invitation sign-in</div>; }
