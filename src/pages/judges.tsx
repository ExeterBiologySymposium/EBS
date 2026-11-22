import { usePageCopy, safeCopyUrl } from '../content/page-copy';
import { definition } from '../content/copy/judges';
import { RegistrationLink } from '../auth';

export default function PageContent() {
  const editorial = usePageCopy('judges', definition); return <div className="page-layout layout-judges">
  <section className="page-heading"><div className="shell">
    <h1>{editorial.pageHeading.title}</h1>
    <p className="lead">{editorial.pageHeading.giveFirstTimeStudentResearchersThoughtful}</p>
    <p><a href="#judge-questions">{editorial.pageHeading.qualificationsCommitmentBriefing}</a></p>
  </div></section>
  <section className="section"><div className="shell">
    <div className="grid columns-2">
      <div>
        <h2>{editorial.whatJudgesDo.whatJudgesDo}</h2>
        <p>{editorial.whatJudgesDo.useEbsRubricAssessStudentsMethods}</p>
      </div>
      <div>
        <div className="text-block"><h3>{editorial.whatJudgesDo.location}</h3><p>{editorial.whatJudgesDo.phillipsExeterAcademyExeterNewHampshire}</p></div>
        <div className="text-block"><h3>{editorial.whatJudgesDo.recognition}</h3><p>{editorial.whatJudgesDo.judgesAreAcknowledgedSymposiumProgramThis}</p></div>
      </div>
    </div>
  </div></section>
  <section className="section" id="judge-questions" aria-labelledby="judge-questions-title"><div className="shell reading">
    <h2 id="judge-questions-title">{editorial.questionsFromJudges.questionsFromJudges}</h2>
    <details className="disclosure" id="j1"><summary>{editorial.whoCanJudge.whoCanJudge}</summary>
      <p>{editorial.whoCanJudge.shouldHaveAtLeastAnUndergraduate}</p>
    </details>
    <details className="disclosure" id="j3"><summary>{editorial.canIJudgeOnlineHowMuch.canIJudgeOnlineHowMuch}</summary>
      <p>{editorial.canIJudgeOnlineHowMuch.yesJudgesCanAttendPersonOr + " "}<a href={safeCopyUrl(editorial.canIJudgeOnlineHowMuch.hrefSchedule)}>{editorial.canIJudgeOnlineHowMuch.schedule}</a>{" " + editorial.canIJudgeOnlineHowMuch.eventHours}</p>
    </details>
    <details className="disclosure" id="j2"><summary>{editorial.whatBriefingWillIReceive.whatBriefingWillIReceive}</summary>
      <p>{editorial.whatBriefingWillIReceive.briefingPacketIncludesRubricAssignedProject}</p>
    </details>
  </div></section>
  <section className="section"><div className="shell"><div className="next-step">
    <h2>{editorial.registerAsJudge.registerAsJudge}</h2>
    <p>{editorial.registerAsJudge.submitInterestFormEbsTeamWill}</p>
    <div className="actions">
      <RegistrationLink className="button primary" href={safeCopyUrl(editorial.registerAsJudge.hrefExpressJudgeInterest, "google-form")}>{editorial.registerAsJudge.expressJudgeInterest}</RegistrationLink>
      <a className="button secondary" href={safeCopyUrl(editorial.registerAsJudge.hrefContactEbs)}>{editorial.registerAsJudge.contactEbs}</a>
    </div>
  </div></div></section>
</div>; }
