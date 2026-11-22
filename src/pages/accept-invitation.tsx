import { usePageCopy, safeCopyUrl, usePageCopyState } from '../content/page-copy';
import { definition } from '../content/copy/accept-invitation';
import { lazy, Suspense, useContext } from 'react';
import { AuthContext } from '../auth';
const InvitationSignIn = lazy(() => import('../invitation-sign-in'));

export default function AcceptInvitationPage() {
  const editorial = usePageCopy('accept-invitation', definition);
  const preview = usePageCopyState()?.preview;
  const { status } = useContext(AuthContext);
  return <div className="page-layout"><section className="page-heading"><div className="shell"><p className="eyebrow">{editorial.pageHeading.ebsMembership}</p><h1>{editorial.pageHeading.title}</h1><p className="lead">{editorial.pageHeading.continueWithEmailAddressInvitationWas}</p></div></section>
    <section className="section"><div className="shell">{preview ? <button type="button" disabled>Continue with invitation</button> : status === 'signed-in' || status === 'signed-out' ? <Suspense fallback={<p role="status">Loading invitation sign-in…</p>}><InvitationSignIn /></Suspense> : <p role="status">{status === 'unavailable' ? 'Sign-in is unavailable. Reload this page to try again.' : 'Loading invitation sign-in…'}</p>}<p><a href={safeCopyUrl(editorial.page.hrefGoAccount)}>{editorial.page.goAccount}</a> · <a href={safeCopyUrl(editorial.page.hrefContactEbsTeam)}>{editorial.page.contactEbsTeam}</a></p></div></section>
  </div>;
}
