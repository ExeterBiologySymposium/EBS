import { usePageCopy, safeCopyUrl } from '../content/page-copy';
import { definition } from '../content/copy/faq';
import { ContactForm } from '../page-controls';

export default function PageContent() {
  const editorial = usePageCopy('faq', definition); return <div className="page-layout layout-faq">
  <section className="page-heading"><div className="shell">
    <p className="eyebrow">{editorial.pageHeading.faq}</p>
    <h1>{editorial.pageHeading.title}</h1>
    <p className="lead">{editorial.pageHeading.startHereBasicsThenFindHelp}</p>
    <p><a href={safeCopyUrl(editorial.pageHeading.hrefAccountHelp)}>{editorial.pageHeading.accountHelp}</a> · <a href={safeCopyUrl(editorial.pageHeading.hrefSchools)}>{editorial.pageHeading.schools}</a> · <a href={safeCopyUrl(editorial.pageHeading.hrefJudges)}>{editorial.pageHeading.judges}</a></p>
  </div></section>
  <section className="section"><div className="shell">
    <nav className="faq-nav" aria-label="Jump to FAQ section">
      <a className="faq-nav__link" href="#general">{editorial.aboutEbs.aboutEbs}</a>
      <a className="faq-nav__link" href="#students">{editorial.aboutEbs.takingPart}</a>
      <a className="faq-nav__link" href="#registration">{editorial.aboutEbs.gettingStarted}</a>
    </nav>
    <section className="faq-section" id="general" aria-labelledby="general-title">
      <h2 className="faq-section__title" id="general-title">{editorial.aboutEbs.aboutEbs2}</h2>
      <div className="accordion">
        <details className="disclosure" id="g1"><summary>{editorial.whatEbsWhenIt.whatEbsWhenIt}</summary>
          <p id="g3"><a id="g4" href={safeCopyUrl(editorial.whatEbsWhenIt.hrefEbs)}>{editorial.whatEbsWhenIt.ebs}</a>{" " + editorial.whatEbsWhenIt.hasTwoParts + " "}<a href={safeCopyUrl(editorial.whatEbsWhenIt.hrefYearLongDryLabBiology)}>{editorial.whatEbsWhenIt.yearLongDryLabBiologyResearch}</a>{" " + editorial.whatEbsWhenIt.studentsAllLevelsFollowedByPoster + " "}<a href={safeCopyUrl(editorial.whatEbsWhenIt.hrefSchedule)}>{editorial.whatEbsWhenIt.schedule}</a>.</p>
        </details>
        <details className="disclosure" id="s2"><summary>{editorial.whoCanTakePart.whoCanTakePart}</summary>
          <p id="s1">{editorial.whoCanTakePart.allMiddleHighSchoolStudentsFrom}</p>
        </details>
        <details className="disclosure" id="g5"><summary>{editorial.whatDoesItCost.whatDoesItCost}</summary>
          <p id="sy-travel">{editorial.whatDoesItCost.participationPersonPosterPrintingAreFree}</p>
        </details>
        <details className="disclosure" id="research"><summary>{editorial.whatResearchCanIPresent.whatResearchCanIPresent}</summary>
          <p id="r1"><span id="g2">{editorial.whatResearchCanIPresent.originalDryLabBiologyResearchUses}</span>{" " + editorial.whatResearchCanIPresent.biologyRelatedProductDesignSupportedBy + " "}<a href={safeCopyUrl(editorial.whatResearchCanIPresent.hrefProjectExamples)}>{editorial.whatResearchCanIPresent.projectExamples}</a>.</p>
        </details>
      </div>
    </section>
    <section className="faq-section" id="students" aria-labelledby="students-title">
      <h2 className="faq-section__title" id="students-title">{editorial.takingPart.takingPart}</h2>
      <div className="accordion">
        <details className="disclosure" id="s3"><summary>{editorial.howMuchTimeWillINeed.howMuchTimeWillINeed}</summary>
          <p>{editorial.howMuchTimeWillINeed.mostStudentsSpend12Hours}</p>
        </details>
        <details className="disclosure" id="s4"><summary>{editorial.canIWorkTeam.canIWorkTeam}</summary>
          <p>{editorial.canIWorkTeam.yesWorkAloneOrTeamUp}</p>
        </details>
        <details className="disclosure" id="international"><summary>{editorial.canIPresentOnline.canIPresentOnline}</summary>
          <p id="i1"><span id="sy0">{editorial.canIPresentOnline.yesIncludingPosterPresentationJudgingInternational}</span>{" " + editorial.canIPresentOnline.presentationsAreEnglish + " "}<a id="i3" href={safeCopyUrl(editorial.canIPresentOnline.hrefSchedule)}>{editorial.canIPresentOnline.schedule}</a>{" " + editorial.canIPresentOnline.usesEasternTimeChoosingOnlineDoes}</p>
        </details>
        <details className="disclosure" id="symposium"><summary>{editorial.whatDoINeedAttendPerson.whatDoINeedAttendPerson}</summary>
          <p id="sy-chaperone">{editorial.whatDoINeedAttendPerson.mustBeAbleTravelExeterCover}</p>
        </details>
        <details className="disclosure" id="s5"><summary>{editorial.canISubmitMyProjectElsewhere.canISubmitMyProjectElsewhere}</summary>
          <p>{editorial.canISubmitMyProjectElsewhere.yesCanAlsoSubmitEbsResearch}</p>
        </details>
      </div>
    </section>
    <section className="faq-section" id="registration" aria-labelledby="registration-title">
      <h2 className="faq-section__title" id="registration-title">{editorial.gettingStarted.gettingStarted}</h2>
      <div className="accordion">
        <details className="disclosure" id="registration-steps"><summary>{editorial.howDoISignUp.howDoISignUp}</summary>
          <p>{editorial.howDoISignUp.signOrCreateAnAccountThen + " "}<a href={safeCopyUrl(editorial.howDoISignUp.hrefStudentRegistration)}>{editorial.howDoISignUp.studentRegistration}</a>{" " + editorial.howDoISignUp.submitGoogleFormUsingAccountEmail}</p>
        </details>
        <details className="disclosure" id="application-process"><summary>{editorial.whatHappensAfterIApply.whatHappensAfterIApply}</summary>
          <p>{editorial.whatHappensAfterIApply.ebsTeamReviewsApplicationEmailsIf + " "}<a href={safeCopyUrl(editorial.whatHappensAfterIApply.hrefAccountPage)}>{editorial.whatHappensAfterIApply.accountPage}</a>{editorial.whatHappensAfterIApply.acceptedAccountsCanCreateResearchFolder}</p>
        </details>
        <details className="disclosure" id="orientation-meetings"><summary>{editorial.whatOrientationMeeting.whatOrientationMeeting}</summary>
          <p>{editorial.whatOrientationMeeting.entry20MinuteZoomIntroductionEbsGetting + " "}<a href={safeCopyUrl(editorial.whatOrientationMeeting.hrefEmailEbs)}>{editorial.whatOrientationMeeting.emailEbs}</a>{" " + editorial.whatOrientationMeeting.coordinate}</p>
        </details>
      </div>
    </section>
    <div className="reading">
      <p id="schools"><span id="school-registration">{editorial.aboutEbs.schoolSignupSchoolContactRolesFaculty + " "}<a id="faculty-advisor-contact" href={safeCopyUrl(editorial.aboutEbs.hrefQuestionsFromSchools)}>{editorial.aboutEbs.questionsFromSchools}</a>.</span></p>
      <p id="judges">{editorial.aboutEbs.qualificationsTimeCommitmentBriefing + " "}<a href={safeCopyUrl(editorial.aboutEbs.hrefQuestionsFromJudges)}>{editorial.aboutEbs.questionsFromJudges}</a>.</p>
      <p id="pending-access"><span id="approved-access">{editorial.aboutEbs.applicationStatusResourcesFolderHelp + " "}<a id="research-folder" href={safeCopyUrl(editorial.aboutEbs.hrefAccountPage)}>{editorial.aboutEbs.accountPage}</a>.</span></p>
    </div>
  </div></section>
  <section className="section" id="contact"><div className="shell">
    <div className="section-header"><h2>{editorial.stillHaveQuestion.stillHaveQuestion}</h2><p>{editorial.stillHaveQuestion.sendMessageBelowOrVisitOur + " "}<a href={safeCopyUrl(editorial.stillHaveQuestion.hrefContactPage)}>{editorial.stillHaveQuestion.contactPage}</a>.</p></div>
    <div className="reading"><div className="contact-form-wrap">
      <ContactForm action="https://api.web3forms.com/submit" accessKey="2f40a3e9-3780-44bd-94c6-0762a55f64fb" />
    </div></div>
  </div></section>
</div>; }
