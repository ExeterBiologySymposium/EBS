import { usePageCopy, safeCopyUrl, usePageCopyState } from '../content/page-copy';
import { definition } from '../content/copy/account';
import { lazy, Suspense, useContext } from 'react';
import { AuthContext } from '../auth';
import { ApplicationProgress } from '../application-progress';
const ParticipantHelp = lazy(() => import('../content/readers/participant-help'));
const AcceptedAccount = lazy(() => import('./accepted-account'));

export default function AccountPage() {
  const editorial = usePageCopy('account', definition);
  const preview = usePageCopyState()?.preview;
  const { status, access, teamAccess, signIn, refreshAccess, manageAccount } = useContext(AuthContext);
  const checking = status === 'loading' || access === 'checking';
  const accepted = status === 'signed-in' && access === 'accepted';
  const pending = status === 'signed-in' && (access === 'pending' || access === null);
  const message = checking ? editorial.pageHeading.checking : status === 'signed-out' ? editorial.visitor.message :
    accepted ? editorial.acceptedStatus.message : pending ? editorial.pendingAccount.message : editorial.pageHeading.unavailable;
  const accountActions = (
      <div className="actions">
        {status === 'signed-out' && <button className="button" type="button" onClick={signIn}>{editorial.visitor.sign}</button>}
        {status === 'signed-in' && <>
          {!accepted && <button className="button" type="button" onClick={refreshAccess} disabled={checking}>{checking ? editorial.pageHeading.approvalChecking : editorial.pendingStatus.checkApproval}</button>}
          <button className="button secondary" type="button" onClick={manageAccount}>{editorial.signedIn.accountSettings}</button>
          {accepted && <a className="button secondary" href={safeCopyUrl(editorial.acceptedStatus.hrefJoinEbsDiscord)} target="_blank" rel="noopener noreferrer">{editorial.acceptedStatus.joinEbsDiscord}</a>}
          {teamAccess === 'allowed' && editorial.team && <a className="button secondary" href={safeCopyUrl(editorial.team.hrefManageParticipants)}>{editorial.team.manageParticipants}</a>}
          {teamAccess === 'allowed' && editorial.team && <a className="button secondary" href={safeCopyUrl(editorial.team.hrefEditWebsiteContent)}>{editorial.team.editWebsiteContent}</a>}
        </>}
        <a className="button secondary" href={safeCopyUrl(editorial.pageHeading.hrefContactEbsTeam)}>{editorial.pageHeading.contactEbsTeam}</a>
      </div>
  );
  return <div className="page-layout layout-account">
    <section className="page-heading"><div className="shell"><p className="eyebrow">{editorial.pageHeading.ebsMembership}</p><h1>{editorial.pageHeading.title}</h1><p className="lead" role="status" aria-live="polite">{message}</p>
      {!accepted && accountActions}
    </div></section>
    {pending && <div className="shell pending-application"><ApplicationProgress account>
      <div className="actions"><a className="button primary" href={safeCopyUrl(editorial.pendingAccount.hrefStudentRegistration)}>{editorial.pendingAccount.studentRegistration}</a></div>
    </ApplicationProgress></div>}
    {pending && <section className="section" aria-labelledby="pending-help-title"><div className="shell reading">
      <h2 id="pending-help-title">{editorial.pendingAccount.whileWait}</h2>
      <details className="disclosure" id="pending-access"><summary>{editorial.pendingAccount.whyMyAccountPending}</summary>
        <p>{editorial.pendingAccount.ebsTeamReviewsApplicationsBeforeApproving}</p>
      </details>
      <details className="disclosure" id="application-process"><summary>{editorial.pendingAccount.haveICompletedMyApplication}</summary>
        <p>{editorial.pendingAccount.creatingAnAccountOnlyFirstStep + " "}<a href={safeCopyUrl(editorial.pendingAccount.hrefStudentRegistration)}>{editorial.pendingAccount.studentRegistration}</a>{editorial.pendingAccount.usingSameEmailAsTheirEbs}</p>
      </details>
      <details className="disclosure" id="approved-access"><summary>{editorial.pendingAccount.iReceivedApprovalWhyAmI}</summary>
        <p>{editorial.pendingAccount.signWithAccountMatchingApplicationEmail + " "}<strong>{editorial.pendingAccount.checkApprovalStatus}</strong>{" " + editorial.pendingAccount.aboveIfItStillShowsPending + " "}<a href={safeCopyUrl(editorial.pendingAccount.hrefContactEbsTeam)}>{editorial.pendingAccount.contactEbsTeam}</a>{editorial.pendingAccount.ifHaveNotHeardBackWithin}</p>
      </details>
    </div></section>}
    {accepted && <>
      <Suspense fallback={<section className="section"><div className="shell" role="status">Loading your research folder…</div></section>}>{preview ? <ParticipantHelp /> : <AcceptedAccount />}</Suspense>
      <section className="section account-destinations"><div className="shell"><h2>{editorial.acceptedAccount.exploreEbs}</h2><div className="account-destination-links">
        <a href={safeCopyUrl(editorial.acceptedAccount.hrefResources)}>{editorial.acceptedAccount.resources}</a>
        <a href={safeCopyUrl(editorial.acceptedAccount.hrefCoding)}>{editorial.acceptedAccount.coding}</a>
        <a href={safeCopyUrl(editorial.acceptedAccount.hrefDatasetLibrary)}>{editorial.acceptedAccount.datasetLibrary}</a>
        <a href={safeCopyUrl(editorial.acceptedAccount.hrefEvents)}>{editorial.acceptedAccount.events}</a>
        <a href={safeCopyUrl(editorial.acceptedAccount.hrefResearchProjects)}>{editorial.acceptedAccount.researchProjects}</a>
      </div></div></section>
      <div className="shell account-secondary">{accountActions}</div>
    </>}
  </div>;
}
