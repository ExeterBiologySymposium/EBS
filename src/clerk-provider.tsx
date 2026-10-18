import { ClerkProvider, UserButton, useAuth, useClerk, useUser } from '@clerk/react';
import { Component, useEffect, useState, useCallback, type ReactNode } from 'react';
import { AuthContext, initialAuth, type MemberAccess } from './auth';
import { safeReturnTo } from './access-policy';

class AuthErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

function ClerkSession({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const clerk = useClerk();
  const { user } = useUser();
  const [member, setMember] = useState<{ userId: string | null; access: MemberAccess }>({ userId: null, access: null });
  const [revision, setRevision] = useState(0);
  const refreshAccess = useCallback(() => setRevision(value => value + 1), []);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const status = !hydrated ? 'loading' : clerk.status === 'error' ? 'unavailable' : !isLoaded ? 'loading' : isSignedIn ? 'signed-in' : 'signed-out';
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;
    const controller = new AbortController();
    setMember({ userId: user.id, access: 'checking' });
    fetch('/api/access', { method: 'POST', credentials: 'same-origin', cache: 'no-store', signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error('Access check failed');
        const body = await response.json();
        const access: MemberAccess = body.access === 'accepted' ? 'accepted' : body.access === 'pending' ? 'pending' : 'unavailable';
        setMember({ userId: user.id, access });
        if (access === 'accepted') {
          const returnTo = safeReturnTo(new URLSearchParams(window.location.search).get('returnTo'));
          if (returnTo) window.location.replace(returnTo);
        }
      }).catch(() => { if (!controller.signal.aborted) setMember({ userId: user.id, access: 'unavailable' }); });
    return () => controller.abort();
  }, [isLoaded, isSignedIn, user?.id, revision]);
  useEffect(() => { const update = () => { if (document.visibilityState === 'visible') refreshAccess(); }; window.addEventListener('focus', refreshAccess); document.addEventListener('visibilitychange', update); return () => { window.removeEventListener('focus', refreshAccess); document.removeEventListener('visibilitychange', update); }; }, [refreshAccess]);
  const access: MemberAccess = status !== 'signed-in' ? null : member.userId === user?.id ? member.access : 'checking';
  return <AuthContext.Provider value={{
    status, access, refreshAccess,
    signIn: () => clerk.openSignIn({ forceRedirectUrl: window.location.href, signUpForceRedirectUrl: window.location.href }),
    signUp: () => clerk.openSignUp({ forceRedirectUrl: window.location.href, signInForceRedirectUrl: window.location.href }),
    account: status === 'signed-in' ? <UserButton /> : null,
  }}>{children}</AuthContext.Provider>;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const unavailable = <AuthContext.Provider value={{ ...initialAuth, status: hydrated ? 'unavailable' : 'loading' }}>{children}</AuthContext.Provider>;
  if (!publishableKey) return unavailable;
  return <AuthErrorBoundary fallback={unavailable}>
    <ClerkProvider publishableKey={publishableKey} afterSignOutUrl="/" appearance={{ variables: {
      colorPrimary: '#a31f34', fontFamily: 'Helvetica, Arial, sans-serif', borderRadius: '4px',
    } }}>
      <ClerkSession>{children}</ClerkSession>
    </ClerkProvider>
  </AuthErrorBoundary>;
}
