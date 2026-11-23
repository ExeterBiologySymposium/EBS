import { useContext } from 'react';
import { usePageCopy, safeCopyUrl, usePageCopyState } from '../content/page-copy';
import { definition } from '../content/copy/student-signup';
import { isStudentApplicationUrl, studentApplicationForm } from '../content/urls';
import { AuthContext, RegistrationLink } from '../auth';
import { ApplicationProgress } from '../application-progress';

function StudentApplicationForm({ href, label }: { href?: string; label: string }) {
  const { status, registrationProfile } = useContext(AuthContext);
  const preview = usePageCopyState()?.preview;
  const trustedForm = isStudentApplicationUrl(href);
  const embed = status === 'signed-in' && !preview && trustedForm ? new URL(studentApplicationForm) : null;
  const name = registrationProfile?.fullName?.trim();
  const email = registrationProfile?.verifiedEmail?.trim();
  if (embed) {
    embed.searchParams.set('embedded', 'true');
    if (name || email) embed.searchParams.set('usp', 'pp_url');
    if (name) embed.searchParams.set('entry.327609807', name);
    if (email) embed.searchParams.set('entry.1433419627', email);
  }

  return <>
    {embed && (name || email) && <p className="small">Google Forms uses the name and verified email available in your EBS profile. Check your answers before submitting.</p>}
    <div className="actions"><RegistrationLink className={embed ? 'button secondary' : 'button'} href={trustedForm ? studentApplicationForm : href}>{label} (new tab)</RegistrationLink></div>
    {embed && <div className="student-application-frame"><iframe className="student-application-embed" src={embed.href} title="EBS student application Google Form" width="640" height="2850" loading="lazy" referrerPolicy="no-referrer" /></div>}
  </>;
}

export default function PageContent() {
  const editorial = usePageCopy('student-signup', definition); return <div className="page-layout layout-student-signup">
<div className={"shell"}>
<section className={"page-heading"}><a className={"back-link"} href={safeCopyUrl(editorial.pageHeading.hrefRegistrationOptions)}>{editorial.pageHeading.registrationOptions}</a><h1>{editorial.pageHeading.title}</h1><p className={"lead"}>{editorial.pageHeading.presentOriginalBiologyResearchParticipation100}</p><p>{editorial.pageHeading.openAllMiddleHighSchoolStudents}</p></section>
<section className={"registration-focus"}><h2>{editorial.beforeApply.beforeApply}</h2><ul><li>{editorial.beforeApply.noPriorResearchExperienceRequired}</li><li>{editorial.beforeApply.presentResearchPosterPersonOrOnline}</li><li>{editorial.beforeApply.wetLabProjectsWillBeAccepted}</li><li>{editorial.beforeApply.projectsMayBeIndividualOrTeams}</li></ul><p className={"small"}>{editorial.beforeApply.registeringSchool + " "}<a href={safeCopyUrl(editorial.beforeApply.hrefUseSchoolRegistration)}>{editorial.beforeApply.useSchoolRegistration}</a>{"."}</p></section>
<ApplicationProgress submissionNote={editorial.beforeApply.signOpenApplicationNewTabComplete} approvalNote={editorial.beforeApply.welcomeEmail}>
<StudentApplicationForm href={safeCopyUrl(editorial.beforeApply.hrefOpenStudentApplication, "google-form")} label={editorial.beforeApply.openStudentApplication} />
</ApplicationProgress>
<section className={"content-section reading"} id={"form"}><h2>{editorial.helpWithRegistration.helpWithRegistration}</h2><p>{editorial.helpWithRegistration.useStudentOrSchoolApplicationAbove + " "}<a href={safeCopyUrl(editorial.helpWithRegistration.hrefContactEbsTeam)}>{editorial.helpWithRegistration.contactEbsTeam}</a>{" " + editorial.helpWithRegistration.orEmail + " "}<a href={safeCopyUrl(editorial.helpWithRegistration.hrefExeterbiosymposiumGmailCom)}>{editorial.helpWithRegistration.exeterbiosymposiumGmailCom}</a>{"."}</p><p><a href={safeCopyUrl(editorial.helpWithRegistration.hrefReadParticipationEligibilityFaqs)}>{editorial.helpWithRegistration.readParticipationEligibilityFaqs}</a></p></section>
</div>
</div>; }
