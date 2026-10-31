import { lazy, Suspense, useContext } from 'react';
import { AuthContext } from '../auth';
const AcceptedAccount = lazy(() => import('./accepted-account'));

export default function AccountPage() {
  const { status, access, teamAccess, signIn, refreshAccess, manageAccount } = useContext(AuthContext);
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
          {teamAccess === 'allowed' && <a className="button secondary" href="admin.html">Manage participants</a>}
        </>}
        <a className="button secondary" href="contact.html">Contact the EBS team</a>
      </div>
    </div></section>
    {pending && <section className="section" aria-labelledby="pending-help-title"><div className="shell reading">
      <h2 id="pending-help-title">While you wait</h2>
      <details className="disclosure" id="pending-access"><summary>Why is my account Pending?</summary>
        <p>The EBS team reviews applications before approving accounts. Signing in or submitting a form does not automatically unlock research folders, Events, or member resources.</p>
      </details>
      <details className="disclosure" id="application-process"><summary>Have I completed my application?</summary>
        <p>Creating an account is only the first step. Each researcher must also submit the Google Form on <a href="student-signup.html">Student registration</a>, using the same email as their EBS account. A school registration does not replace individual applications.</p>
      </details>
      <details className="disclosure" id="approved-access"><summary>I received approval. Why am I still Pending?</summary>
        <p>Sign in with the account matching your application email and select <strong>Check approval status</strong> above. If it still shows Pending, <a href="contact.html">contact the EBS team</a>. If you have not heard back within a week or two, check your spam folder before contacting us.</p>
      </details>
    </div></section>}
    {accepted && <>
      <Suspense fallback={<section className="section"><div className="shell" role="status">Loading your research folder…</div></section>}><AcceptedAccount /></Suspense>
      <section className="section account-destinations"><div className="shell"><h2>Explore EBS</h2><div className="actions"><a className="button secondary" href="events.html">Events</a><a className="button secondary" href="resources.html">Resources</a><a className="button secondary" href="datascience.html">Coding</a></div></div></section>
    </>}
  </div>;
}
