import { usePageCopy, safeCopyUrl } from '../content/page-copy';
import { definition } from '../content/copy/schools';
import { RegistrationLink } from '../auth';

export default function PageContent() {
  const editorial = usePageCopy('schools', definition); return <div className="page-layout layout-schools">
<div className={"shell"}>
<section className={"page-heading"}>
<h1>{editorial.pageHeading.title}<br />{editorial.pageHeading.title2}</h1>
<p className={"lead"}>{editorial.pageHeading.ebsWelcomesAllMiddleHighSchool}</p>
<div className={"actions"}><RegistrationLink className={"button"} href={safeCopyUrl(editorial.pageHeading.hrefRegisterSchool, "google-form")}>{editorial.pageHeading.registerSchool}</RegistrationLink></div><p className={"external-form-note"}>{editorial.pageHeading.schoolsThatWouldLikeSignUp}</p>
<p>{editorial.pageHeading.alreadyContactedByEbsOnlyNeed + " "}<a href={safeCopyUrl(editorial.pageHeading.hrefIndividualStudentRegistrations)}>{editorial.pageHeading.individualStudentRegistrations}</a>{editorial.pageHeading.see + " "}<a href="#school-questions">{editorial.pageHeading.questionsFromSchools}</a>{" " + editorial.pageHeading.below}</p>
<p className={"small"}><a href={safeCopyUrl(editorial.pageHeading.hrefNotTeacherOrAdministratorRegister)}>{editorial.pageHeading.notTeacherOrAdministratorRegisterIndividually}</a></p>
</section>
<figure className="context-media context-media--schools"><img src={safeCopyUrl(editorial.page.srcStudentsFromGeneticsBiotechnologyClub, "image")} alt={editorial.page.altStudentsFromGeneticsBiotechnologyClub} loading="lazy" /></figure>
<div className={"school-layout"}>
<section className={"reading"}>
<h2>{editorial.researchThatFitsSchool.researchThatFitsSchool}</h2><p>{editorial.researchThatFitsSchool.studentsCanInvestigateBiologyThroughComputational}</p><p>{editorial.researchThatFitsSchool.yearLongResearchProgramUsesDocument}</p>
<h2>{editorial.researchThatFitsSchool.whoCanParticipate}</h2><ul className={"plain-list"}><li>{editorial.researchThatFitsSchool.allMiddleHighSchoolStudentsWith}</li><li>{editorial.researchThatFitsSchool.individualProjectsOrTeamsUpThree}</li><li>{editorial.researchThatFitsSchool.allAreasBiologyIncludingGeneticsEcology}</li><li>{editorial.researchThatFitsSchool.originalBiologyResearchWetLabProjects}</li></ul>
<h2>{editorial.researchThatFitsSchool.whatStudentsReceive}</h2><p>{editorial.researchThatFitsSchool.studentsGainExperiencePresentingBiologicalStudy}</p>
</section>
<aside aria-labelledby={"practical-title"} className={"school-practical"}><h2 id={"practical-title"}>{editorial.page.practicalDetails}</h2><dl>
<div><dt>{editorial.page.cost}</dt><dd>{editorial.page.participationFreeParticipantsCoverTheirOwn}</dd></div>
<div><dt>{editorial.page.time}</dt><dd>{editorial.page.mostStudentsSpend12Hours}</dd></div>
<div><dt>{editorial.page.supervision}</dt><dd>{editorial.page.teacherSupervisorNotRequiredEbsGuides}</dd></div>
<div><dt>{editorial.page.timing}</dt><dd>{editorial.page.april25th2027}</dd></div>
</dl></aside>
</div>
<section className={"content-section"}>
<h2>{editorial.whatExpect.whatExpect}</h2><p className={"reading"}>{editorial.whatExpect.eachStudentRegistersIndividuallyThenReceives}</p>
<dl className={"schedule-list"}>
<div><dt>{editorial.whatExpect.fall2026}</dt><dd><strong>{editorial.whatExpect.studentRegistration}</strong><p>{editorial.whatExpect.individualStudentsRegisterReceiveAccessEbs}</p></dd></div>
<div><dt>{editorial.whatExpect.fallWinter202627}</dt><dd><strong>{editorial.whatExpect.researchPeriod}</strong><p>{editorial.whatExpect.studentsWorkThroughResearchDocumentWith}</p></dd></div>
<div><dt>{editorial.whatExpect.december182026}</dt><dd><strong>{editorial.whatExpect.check1IdeaResearchPlan}</strong><p>{editorial.whatExpect.studentsSubmitTheirProjectIdeaResearch}</p></dd></div>
<div><dt>{editorial.whatExpect.march122027}</dt><dd><strong>{editorial.whatExpect.check2AbstractCode}</strong><p>{editorial.whatExpect.studentsSubmitTheirResearchAbstractAll}</p></dd></div>
<div><dt>{editorial.whatExpect.april92027}</dt><dd><strong>{editorial.whatExpect.check3FirstPosterDraft}</strong><p>{editorial.whatExpect.allFourCoHeadsReviewFirst}</p></dd></div>
<div><dt>{editorial.whatExpect.april25th2027}</dt><dd><strong>{editorial.whatExpect.symposiumDay}</strong><p>{editorial.whatExpect.studentsPresentAtPhillipsExeterAcademy}</p></dd></div>
</dl>
<p><a href={safeCopyUrl(editorial.whatExpect.hrefProjectRequirementsReviewProcess)}>{editorial.whatExpect.projectRequirementsReviewProcess}</a></p>
</section>
<section className="school-questions reading" id="school-questions" aria-labelledby="school-questions-title">
<h2 id="school-questions-title">{editorial.questionsFromSchools.questionsFromSchools}</h2>
<details className="disclosure" id="s-faq-registration"><summary>{editorial.doesOurSchoolNeedFillOut.doesOurSchoolNeedFillOut}</summary>
<p>{editorial.doesOurSchoolNeedFillOut.useFormIfSchoolWouldLike + " "}<a href={safeCopyUrl(editorial.doesOurSchoolNeedFillOut.hrefEbs)}>{editorial.doesOurSchoolNeedFillOut.ebs}</a>{editorial.doesOurSchoolNeedFillOut.everyStudentResearcherMustStill + " "}<a href={safeCopyUrl(editorial.doesOurSchoolNeedFillOut.hrefRegisterIndividually)}>{editorial.doesOurSchoolNeedFillOut.registerIndividually}</a>.</p>
</details>
<details className="disclosure" id="s-faq-2"><summary>{editorial.whatDoesOurSchoolContactPerson.whatDoesOurSchoolContactPerson}</summary>
<p>{editorial.whatDoesOurSchoolContactPerson.shareEbsInformationWithInterestedStudents}</p>
</details>
<details className="disclosure" id="s-faq-1"><summary>{editorial.howMuchTimeDoStudentsNeed.howMuchTimeDoStudentsNeed}</summary>
<p>{editorial.howMuchTimeDoStudentsNeed.mostSpend12HoursPer}</p>
</details>
<details className="disclosure" id="s-faq-orientation"><summary>{editorial.howDoWeArrangeOrientation.howDoWeArrangeOrientation}</summary>
<p>{editorial.howDoWeArrangeOrientation.anEbsTeamMemberArranges20 + " "}<a href={safeCopyUrl(editorial.howDoWeArrangeOrientation.hrefEmailEbs)}>{editorial.howDoWeArrangeOrientation.emailEbs}</a>{" " + editorial.howDoWeArrangeOrientation.coordinate}</p>
</details>
<details className="disclosure" id="s-faq-advisor"><summary>{editorial.howDoWeContactEbsFaculty.howDoWeContactEbsFaculty}</summary>
<p>{editorial.howDoWeContactEbsFaculty.email + " "}<a href={safeCopyUrl(editorial.howDoWeContactEbsFaculty.hrefExeterbiosymposiumGmailCom)}>{editorial.howDoWeContactEbsFaculty.exeterbiosymposiumGmailCom}</a>{" " + editorial.howDoWeContactEbsFaculty.sayMessageFacultyAdvisorEbsTeam}</p>
</details>
<p>{editorial.questionsFromSchools.entry + " "}<a id="s-faq-3" href={safeCopyUrl(editorial.questionsFromSchools.hrefCosts)}>{editorial.questionsFromSchools.costs}</a>, <a id="s-faq-4" href={safeCopyUrl(editorial.questionsFromSchools.hrefTeams)}>{editorial.questionsFromSchools.teams}</a>, <a id="s-faq-5" href={safeCopyUrl(editorial.questionsFromSchools.hrefSubmittingElsewhere)}>{editorial.questionsFromSchools.submittingElsewhere}</a>{editorial.questionsFromSchools.attendanceRequirementsSee + " "}<a href={safeCopyUrl(editorial.questionsFromSchools.hrefMainFaq)}>{editorial.questionsFromSchools.mainFaq}</a>.</p>
</section>
</div>
</div>; }
