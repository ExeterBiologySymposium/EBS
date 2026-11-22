import { usePageCopy, safeCopyUrl } from '../content/page-copy';
import { definition } from '../content/copy/student-signup';
import { RegistrationLink } from '../auth';
import { ApplicationProgress } from '../application-progress';

export default function PageContent() {
  const editorial = usePageCopy('student-signup', definition); return <div className="page-layout layout-student-signup">
<div className={"shell"}>
<section className={"page-heading"}><a className={"back-link"} href={safeCopyUrl(editorial.pageHeading.hrefRegistrationOptions)}>{editorial.pageHeading.registrationOptions}</a><h1>{editorial.pageHeading.title}</h1><p className={"lead"}>{editorial.pageHeading.presentOriginalBiologyResearchParticipation100}</p><p>{editorial.pageHeading.openAllMiddleHighSchoolStudents}</p></section>
<section className={"registration-focus"}><h2>{editorial.beforeApply.beforeApply}</h2><ul><li>{editorial.beforeApply.noPriorResearchExperienceRequired}</li><li>{editorial.beforeApply.presentResearchPosterPersonOrOnline}</li><li>{editorial.beforeApply.wetLabProjectsWillBeAccepted}</li><li>{editorial.beforeApply.projectsMayBeIndividualOrTeams}</li></ul><p className={"small"}>{editorial.beforeApply.registeringSchool + " "}<a href={safeCopyUrl(editorial.beforeApply.hrefUseSchoolRegistration)}>{editorial.beforeApply.useSchoolRegistration}</a>{"."}</p></section>
<ApplicationProgress submissionNote={editorial.beforeApply.signOpenApplicationNewTabComplete} approvalNote={editorial.beforeApply.welcomeEmail}>
<div className={"actions"}><RegistrationLink className={"button"} href={safeCopyUrl(editorial.beforeApply.hrefOpenStudentApplication, "google-form")}>{editorial.beforeApply.openStudentApplication}<span className="sr-only"> (opens in a new tab)</span></RegistrationLink></div>
</ApplicationProgress>
<section className={"content-section reading"} id={"form"}><h2>{editorial.helpWithRegistration.helpWithRegistration}</h2><p>{editorial.helpWithRegistration.useStudentOrSchoolApplicationAbove + " "}<a href={safeCopyUrl(editorial.helpWithRegistration.hrefContactEbsTeam)}>{editorial.helpWithRegistration.contactEbsTeam}</a>{" " + editorial.helpWithRegistration.orEmail + " "}<a href={safeCopyUrl(editorial.helpWithRegistration.hrefExeterbiosymposiumGmailCom)}>{editorial.helpWithRegistration.exeterbiosymposiumGmailCom}</a>{"."}</p><p><a href={safeCopyUrl(editorial.helpWithRegistration.hrefReadParticipationEligibilityFaqs)}>{editorial.helpWithRegistration.readParticipationEligibilityFaqs}</a></p></section>
</div>
</div>; }
