import { createContext, useContext, type ReactNode } from 'react';

export type AuthStatus = 'loading' | 'unavailable' | 'signed-out' | 'signed-in';
export type AuthState = {
  status: AuthStatus;
  signIn: () => void;
  signUp: () => void;
  account: ReactNode;
};

// Prerender and the first browser render share a closed gate while Clerk loads.
export const initialAuth: AuthState = {
  status: 'loading', signIn() {}, signUp() {}, account: null,
};
export const AuthContext = createContext<AuthState>(initialAuth);

export function AccountControls() {
  const { status, signIn, signUp, account } = useContext(AuthContext);
  return <div className="account-controls" aria-label="Your account">
    {status === 'signed-in' ? account : status === 'signed-out' ? <>
      <button type="button" onClick={signIn}>Sign in</button>
      <button type="button" onClick={signUp}>Sign up</button>
    </> : <span role="status">{status === 'loading' ? 'Loading account…' : 'Sign-in unavailable'}</span>}
  </div>;
}

export function RegistrationLink({ href, children, className = 'button' }: {
  href: string; children: ReactNode; className?: string;
}) {
  const { status, signIn } = useContext(AuthContext);
  if (status === 'signed-in') return <a className={className} href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
  return <button type="button" className={className} onClick={signIn} disabled={status !== 'signed-out'}>
    {status === 'loading' ? 'Loading sign-in…' : status === 'unavailable' ? 'Sign-in unavailable — try again later' : <>Sign in to continue: {children}</>}
  </button>;
}
