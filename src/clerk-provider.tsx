import { ClerkProvider, UserButton, useAuth, useClerk } from '@clerk/react';
import { Component, useEffect, useState, type ReactNode } from 'react';
import { AuthContext, initialAuth } from './auth';

class AuthErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

function ClerkSession({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const clerk = useClerk();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const status = !hydrated ? 'loading' : clerk.status === 'error' ? 'unavailable' : !isLoaded ? 'loading' : isSignedIn ? 'signed-in' : 'signed-out';
  return <AuthContext.Provider value={{
    status,
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
