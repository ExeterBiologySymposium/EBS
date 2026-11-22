import { usePageCopy, safeCopyUrl, usePageCopyState } from '../content/page-copy';
import { definition } from '../content/copy/register';
import { useContext, useEffect } from 'react';
import { AuthContext } from '../auth';
import { safeReturnTo } from '../access-policy';
import AccountPage from './account';
import { AccessNotice } from '../auth';

export default function PageContent() {
  const editorial = usePageCopy('register', definition);
  const preview = usePageCopyState()?.preview;
  const {status}=useContext(AuthContext);
  useEffect(()=>{
    if(preview || status!=='signed-in') return;
    const returnTo=safeReturnTo(new URLSearchParams(window.location.search).get('returnTo'));
    window.location.replace('/account.html'+(returnTo?'?'+new URLSearchParams({returnTo}):''));
  },[status, preview]);
  if(status==='signed-in') return <AccountPage/>;
  if(status!=='signed-out') return <div className="page-layout shell"><section className="page-heading"><h1>{status==='loading'?'Checking your account…':'Sign-in unavailable'}</h1><p role="status">{status==='loading'?'Please wait while we check your account.':'Try again later, or contact the EBS team.'}</p><p><a href={safeCopyUrl(editorial.pageHeading.hrefContactEbsTeam)}>{editorial.pageHeading.contactEbsTeam}</a></p></section></div>;
  return <div className="page-layout layout-register">
<div className={"shell"}>
<section className={"page-heading"}><h1>{editorial.pageHeading.title}</h1><p className={"lead"}>{editorial.pageHeading.chooseOneRouteSignOrCreate}</p><p>{editorial.pageHeading.april25th2027PersonOnlineParticipation}</p></section>
<div className={"registration-options registration-routes"}>
<section><h2>{editorial.students.students}</h2><p>{editorial.students.middleHighSchoolStudentsPresentingOriginal}</p><div className={"actions"}><a className={"button primary"} href={safeCopyUrl(editorial.students.hrefStudentRegistration)}>{editorial.students.studentRegistration}</a></div></section>
<section><h2>{editorial.schoolsEducators.schoolsEducators}</h2><p>{editorial.schoolsEducators.educatorsCounselorsAdministratorsSharingEbsWith}</p><div className={"actions"}><a className={"button secondary"} href={safeCopyUrl(editorial.schoolsEducators.hrefSchoolRegistration)}>{editorial.schoolsEducators.schoolRegistration}</a></div></section>
<section><h2>{editorial.judges.judges}</h2><p>{editorial.judges.researchersProfessionalsWhoWantEvaluateStudent}</p><div className={"actions"}><a className={"button secondary"} href={safeCopyUrl(editorial.judges.hrefJudgeRecruitment)}>{editorial.judges.judgeRecruitment}</a></div></section>
</div>
<AccessNotice/>
<section className={"content-section reading"} id={"form"}><h2>{editorial.helpChoosingAnApplication.helpChoosingAnApplication}</h2><p>{editorial.helpChoosingAnApplication.signupPagesLinkApplicationFormsIf + " "}<a href={safeCopyUrl(editorial.helpChoosingAnApplication.hrefContactEbsTeam)}>{editorial.helpChoosingAnApplication.contactEbsTeam}</a>{" " + editorial.helpChoosingAnApplication.orEmail + " "}<a href={safeCopyUrl(editorial.helpChoosingAnApplication.hrefExeterbiosymposiumGmailCom)}>{editorial.helpChoosingAnApplication.exeterbiosymposiumGmailCom}</a>{"."}</p><p><a href={safeCopyUrl(editorial.helpChoosingAnApplication.hrefReadParticipationEligibilityTimelineFaqs)}>{editorial.helpChoosingAnApplication.readParticipationEligibilityTimelineFaqs}</a></p></section>
</div>
</div>; }
