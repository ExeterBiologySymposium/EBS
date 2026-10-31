import { lazy, Suspense, useContext } from 'react';
import { AuthContext } from '../auth';
const AcceptedAccount = lazy(() => import('./accepted-account'));

export default function AccountPage() {
  const { status, access, signIn, refreshAccess, manageAccount } = useContext(AuthContext);
  const checking = status === 'loading' || access === 'checking';
  const accepted = status === 'signed-in' && access === 'accepted';
  const pending = status === 'signed-in' && (access === 'pending' || access === null);
  const message = checking ? 'Checking your account…' : status === 'signed-out' ? 'Sign in to see your account and approval status.' : accepted ? 'Your account is accepted. Your EBS research tools are ready to use.' : pending ? 'Your account is pending approval. The EBS team will review your account before granting access to research tools and events.' : 'We could not check your account. Try again, or contact the EBS team.';
  return <div className="page-layout layout-account">
    <section className="page-heading"><div className="shell"><p className="eyebrow">Your EBS membership</p><h1>Account</h1><p className="lead" role="status" aria-live="polite">{message}</p>
      <div className="actions">
        {status === 'signed-out' && <button className="button" type="button" onClick={signIn}>Sign in</button>}
        {status === 'signed-in' && <>
          {!accepted && <button className="button" type="button" onClick={refreshAccess} disabled={checking}>{checking ? 'Checking approval…' : 'Check approval status'}</button>}
          <button className="button secondary" type="button" onClick={manageAccount}>Account settings</button>
        </>}
        <a className="button secondary" href="contact.html">Contact the EBS team</a>
      </div>
    </div></section>
    {accepted && <>
      <Suspense fallback={<section className="section"><div className="shell" role="status">Loading your research folder…</div></section>}><AcceptedAccount /></Suspense>
      <section className="section account-destinations"><div className="shell"><h2>Explore EBS</h2><div className="actions"><a className="button secondary" href="events.html">Events</a><a className="button secondary" href="resources.html">Resources</a><a className="button secondary" href="datascience.html">Coding</a></div></div></section>
    </>}
  </div>;
}
