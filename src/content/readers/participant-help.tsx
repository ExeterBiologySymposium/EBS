import { useEditorialContent, safeCopyUrl } from '../page-copy';
import type { definition } from '../copy/accepted-account';
import type { Value } from '../fields';
export default function ParticipantHelp() {
  const editorial = useEditorialContent<{ participantHelp: Value<typeof definition> }>('account').participantHelp; return <>
  <section className="section" aria-labelledby="participant-help-title"><div className="shell reading">
    <h2 id="participant-help-title">{editorial.participantQuestions.participantQuestions}</h2>
    <details className="disclosure" id="finding-resources"><summary>{editorial.whereDoIFindMyResearch.whereDoIFindMyResearch}</summary>
      <p>{editorial.whereDoIFindMyResearch.openFolderAboveMaterialsSharedWith + " "}<a href={safeCopyUrl(editorial.whereDoIFindMyResearch.hrefEmailSupport)}>{editorial.whereDoIFindMyResearch.emailSupport}</a>{" " + editorial.whereDoIFindMyResearch.regularOfficeHours}</p>
      <p><a href={safeCopyUrl(editorial.whereDoIFindMyResearch.hrefResources)}>{editorial.whereDoIFindMyResearch.resources}</a>{" " + editorial.whereDoIFindMyResearch.containsLatestResearchMaterialsVisit + " "}<a href={safeCopyUrl(editorial.whereDoIFindMyResearch.hrefCoding)}>{editorial.whereDoIFindMyResearch.coding}</a>{" " + editorial.whereDoIFindMyResearch.codingResources + " "}<a href={safeCopyUrl(editorial.whereDoIFindMyResearch.hrefDatasetLibrary)}>{editorial.whereDoIFindMyResearch.datasetLibrary}</a>{" " + editorial.whereDoIFindMyResearch.freeDatasetsStepByStepTool}</p>
    </details>
    <details className="disclosure" id="research-folder"><summary>{editorial.howDoICreateOpenMy.howDoICreateOpenMy}</summary>
      <p>{editorial.howDoICreateOpenMy.ifEbsTeamSharedFolderWith + " "}<strong>{editorial.howDoICreateOpenMy.openMyFolder}</strong>{" " + editorial.howDoICreateOpenMy.aboveCreateAnEbsGoogleDrive}</p>
      <ol>
        <li>{editorial.howDoICreateOpenMy.entry + " "}<strong>{editorial.howDoICreateOpenMy.researchFolder}</strong>{" " + editorial.howDoICreateOpenMy.aboveSelect + " "}<strong>{editorial.howDoICreateOpenMy.linkGoogleAccount}</strong>{" " + editorial.howDoICreateOpenMy.ifPromptedLinkOneGoogleAccount + " "}<strong>{editorial.howDoICreateOpenMy.checkAgain}</strong>.</li>
        <li>{editorial.howDoICreateOpenMy.select + " "}<strong>{editorial.howDoICreateOpenMy.createMyResearchFolder}</strong>{" " + editorial.howDoICreateOpenMy.createFolderStarterGoogleDoc}</li>
        <li>{editorial.howDoICreateOpenMy.returnHereUse + " "}<strong>{editorial.howDoICreateOpenMy.openMyFolder2}</strong>{" " + editorial.howDoICreateOpenMy.or + " "}<strong>{editorial.howDoICreateOpenMy.openResearchDocument}</strong>{" " + editorial.howDoICreateOpenMy.wheneverNeedThem}</li>
      </ol>
      <p><a href={safeCopyUrl(editorial.howDoICreateOpenMy.hrefContactUs)}>{editorial.howDoICreateOpenMy.contactUs}</a>{" " + editorial.howDoICreateOpenMy.ifNeedAccessSharedFolderOr}</p>
    </details>
    <details className="disclosure" id="research-help"><summary>{editorial.howDoIChooseTopicTools.howDoIChooseTopicTools}</summary>
      <p>{editorial.howDoIChooseTopicTools.startWithSpecificBiologyQuestionCan + " "}<a href={safeCopyUrl(editorial.howDoIChooseTopicTools.hrefDatasetLibrary)}>{editorial.howDoIChooseTopicTools.datasetLibrary}</a>{" " + editorial.howDoIChooseTopicTools.pairsDatasets14ResearchFieldsWith + " "}<a href={safeCopyUrl(editorial.howDoIChooseTopicTools.hrefStudentResearch)}>{editorial.howDoIChooseTopicTools.studentResearch}</a>{" " + editorial.howDoIChooseTopicTools.projectExamplesOr + " "}<a href={safeCopyUrl(editorial.howDoIChooseTopicTools.hrefAskEbsTeam)}>{editorial.howDoIChooseTopicTools.askEbsTeam}</a>{" " + editorial.howDoIChooseTopicTools.helpNarrowingIdea}</p>
    </details>
    <details className="disclosure" id="research-checkpoints"><summary>{editorial.whatDoISubmitWhen.whatDoISubmitWhen}</summary>
      <p>{editorial.whatDoISubmitWhen.checkStudentResearchPageCurrentCheckpoint + " "}<a href={safeCopyUrl(editorial.whatDoISubmitWhen.hrefStudentResearch)}>{editorial.whatDoISubmitWhen.studentResearch}</a>{" " + editorial.whatDoISubmitWhen.requirements}</p>
    </details>
    <details className="disclosure" id="presentation-preparation"><summary>{editorial.whatDoIPresentBring.whatDoIPresentBring}</summary>
      <p>{editorial.whatDoIPresentBring.presentResearchPosterExplainItJudges + " "}<a href={safeCopyUrl(editorial.whatDoIPresentBring.hrefSchedule)}>{editorial.whatDoIPresentBring.schedule}</a>{" " + editorial.whatDoIPresentBring.eventTimings}</p>
    </details>
    <details className="disclosure" id="food-and-guests"><summary>{editorial.willThereBeFoodCanI.willThereBeFoodCanI}</summary>
      <p>{editorial.willThereBeFoodCanI.lunchRefreshmentsAreProvidedRegisteredPerson + " "}<a href={safeCopyUrl(editorial.willThereBeFoodCanI.hrefCheckWithEbs)}>{editorial.willThereBeFoodCanI.checkWithEbs}</a>{" " + editorial.willThereBeFoodCanI.beforeMakingGuestPlans}</p>
    </details>
    <details className="disclosure" id="attendance-changes"><summary>{editorial.canIChangeBetweenOnlinePerson.canIChangeBetweenOnlinePerson}</summary>
      <p><a href={safeCopyUrl(editorial.canIChangeBetweenOnlinePerson.hrefContactEbs)}>{editorial.canIChangeBetweenOnlinePerson.contactEbs}</a>{" " + editorial.canIChangeBetweenOnlinePerson.asSoonAsPlansChangeSwitching}</p>
    </details>
  </div></section>
</>; }
