import { createContext, useContext, type ReactNode, type AnchorHTMLAttributes } from 'react';

export type AuthStatus = 'loading' | 'unavailable' | 'signed-out' | 'signed-in';
export type MemberAccess = 'checking' | 'pending' | 'accepted' | 'unavailable' | null;
export type AuthState = {
  access: MemberAccess;
  refreshAccess: () => void;
  status: AuthStatus;
  signIn: () => void;
  signUp: () => void;
  account: ReactNode;
};

// Prerender and the first browser render share a closed gate while Clerk loads.
export const initialAuth: AuthState = {
  status: 'loading', access: null, refreshAccess() {}, signIn() {}, signUp() {}, account: null,
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

export function useMemberAccess() { return useContext(AuthContext).access; }
export function LearningLink({ children, href, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const access = useMemberAccess();
  return <a {...props} href={access === 'accepted' ? href : '/register.html'}>{children}</a>;
}
export function AccessNotice({ asPage = false }: { asPage?: boolean }) {
  const { status, access, signIn, signUp, refreshAccess } = useContext(AuthContext);
  const Heading = asPage ? 'h1' : 'h2';
  return <section className="member-access registration-focus" aria-labelledby="member-access-title">
    <Heading id="member-access-title">{status === 'loading' || access === 'checking' ? 'Checking your access…' : status === 'signed-out' ? 'Access to EBS resources' : access === 'accepted' ? 'Your account is accepted' : access === 'pending' ? 'Your account is pending approval' : 'Access check unavailable'}</Heading>
    <p role="status">{status === 'signed-out' ? 'Sign in or create an account. The EBS team reviews accounts before granting access to resources and coding lessons.' : access === 'accepted' ? 'You can now use all EBS resources and coding lessons.' : access === 'pending' ? 'The EBS team will grant resource access after review. You can still register and explore the symposium.' : status === 'loading' || access === 'checking' ? 'Please wait while we check your membership.' : 'We could not verify your membership. Try again, or contact the EBS team.'}</p>
    <div className="actions">{status === 'signed-out' ? <><button className="button" type="button" onClick={signIn}>Sign in</button><button className="button secondary" type="button" onClick={signUp}>Create an account</button></> : status === 'signed-in' && access !== 'checking' ? <><button className="button secondary" type="button" onClick={refreshAccess}>Check access again</button>{access === 'accepted' && <><a className="button" href="resources.html">Resources</a><a className="button" href="datascience.html">Coding</a></>}</> : null}</div>
    <p><a href="faq.html#contact">Contact the EBS team</a></p>
  </section>;
}
