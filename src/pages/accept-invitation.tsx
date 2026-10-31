import { lazy, Suspense, useContext } from 'react';
import { AuthContext } from '../auth';
const InvitationSignIn = lazy(() => import('../invitation-sign-in'));

export default function AcceptInvitationPage() {
  const { status } = useContext(AuthContext);
  return <div className="page-layout"><section className="page-heading"><div className="shell"><p className="eyebrow">EBS membership</p><h1>Accept your EBS invitation</h1><p className="lead">Continue with the email address your invitation was sent to. Your invitation determines whether you join Pending for review or Accepted for access.</p></div></section>
    <section className="section"><div className="shell">{status === 'signed-in' || status === 'signed-out' ? <Suspense fallback={<p role="status">Loading invitation sign-in…</p>}><InvitationSignIn /></Suspense> : <p role="status">{status === 'unavailable' ? 'Sign-in is unavailable. Reload this page to try again.' : 'Loading invitation sign-in…'}</p>}<p><a href="account.html">Go to Account</a> · <a href="contact.html">Contact the EBS team</a></p></div></section>
  </div>;
}
