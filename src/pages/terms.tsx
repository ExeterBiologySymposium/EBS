import { usePageCopy, safeCopyUrl } from '../content/page-copy';
import { definition } from '../content/copy/terms';
import type { Value } from '../content/fields';
import { LegalPage, type LegalSection } from '../legal-page';

function legalSections(editorial: Value<typeof definition>): LegalSection[] { return [
  {
    id: "welcome-and-scope",
    title: editorial.welcomeScope.title,
    content: <>
      <p>{editorial.welcomeScope.welcomeExeterBiologySymposiumEbsWebsite}</p>
      <p>{editorial.welcomeScope.theseTermsCoverEbsWebsiteAccount}</p>
      <p>{editorial.welcomeScope.ifActSchoolOrganizationOrAnother}</p>
    </>,
  },
  {
    id: "our-purpose",
    title: editorial.ourPurpose.title,
    content: <>
      <p>{editorial.ourPurpose.ebsHelpsMiddleHighSchoolStudents}</p>
      <p>{editorial.ourPurpose.dryLabResearchUsesComputersPublic}</p>
      <p>{editorial.ourPurpose.ebsParticipationFreeParticipantsRemainResponsible}</p>
    </>,
  },
  {
    id: "students-age-requirements-and-supervision",
    title: editorial.studentsAgeRequirementsSupervision.title,
    content: <>
      <p>{editorial.studentsAgeRequirementsSupervision.programWelcomesMiddleHighSchoolStudents}</p>
      <p>{editorial.studentsAgeRequirementsSupervision.mustBeAtLeast13Create}</p>
      <p>{editorial.studentsAgeRequirementsSupervision.ifAreUnder13PleaseDo}</p>
      <p>{editorial.studentsAgeRequirementsSupervision.everyPersonPresenterMustBeAccompanied}</p>
    </>,
  },
  {
    id: "privacy",
    title: editorial.privacy.title,
    content: <>
      <p>{editorial.privacy.our + " "}<a href={safeCopyUrl(editorial.privacy.destinationPrivacyNotice)}>{editorial.privacy.privacyNotice}</a>{" " + editorial.privacy.explainsHowInformationCollectedUsedShared}</p>
    </>,
  },
  {
    id: "accounts-and-access",
    title: editorial.accountsAccess.title,
    content: <>
      <p>{editorial.accountsAccess.someResourcesEventsResearchToolsRequire}</p>
      <p>{editorial.accountsAccess.protectSignCredentialsDoNotShare}</p>
    </>,
  },
  {
    id: "respectful-and-secure-use",
    title: editorial.respectfulSecureUse.title,
    content: <>
      <p>{editorial.respectfulSecureUse.useServicesLawfullyRespectfullyMustNot}</p>
      <ul>
        <li>{editorial.respectfulSecureUse.harassThreatenDiscriminateAgainstOrImpersonate}</li>
        <li>{editorial.respectfulSecureUse.submitFraudulentApplicationsMisleadingInformationSpam}</li>
        <li>{editorial.respectfulSecureUse.collectDiscloseOrMisuseSomeoneElse}</li>
        <li>{editorial.respectfulSecureUse.accessAnotherParticipantSAccountResearch}</li>
        <li>{editorial.respectfulSecureUse.uploadMaliciousSoftwareDisruptWebsiteOr}</li>
        <li>{editorial.respectfulSecureUse.bypassAccessControlsOrProbeOr}</li>
        <li>{editorial.respectfulSecureUse.helpAnotherPersonCarryOutAny}</li>
      </ul>
      <p>{editorial.respectfulSecureUse.reportConcernsEbsTeamWeMay}</p>
    </>,
  },
  {
    id: "research-integrity-and-appropriate-projects",
    title: editorial.researchIntegrityAppropriateProjects.title,
    content: <>
      <p>{editorial.researchIntegrityAppropriateProjects.researchSubmittedEbsMustFollowPublished}</p>
      <p>{editorial.researchIntegrityAppropriateProjects.keepRecordsSufficientExplainMethodsSupport}</p>
      <p>{editorial.researchIntegrityAppropriateProjects.ebsSupportsDryLabResearchParticipation}</p>
    </>,
  },
  {
    id: "website-materials-and-educational-use",
    title: editorial.websiteMaterialsEducationalUse.title,
    content: <>
      <p>{editorial.websiteMaterialsEducationalUse.websiteTextImagesVideosLogosCode}</p>
      <p>{editorial.websiteMaterialsEducationalUse.mayReadUseMaterialsPersonalLearning}</p>
    </>,
  },
  {
    id: "your-research-and-other-submissions",
    title: editorial.researchOtherSubmissions.title,
    content: <>
      <p>{editorial.researchOtherSubmissions.retainOwnershipOriginalWorkSubmitSubject}</p>
      <p>{editorial.researchOtherSubmissions.bySubmittingWorkParticipationGiveEbs}</p>
      <p>{editorial.researchOtherSubmissions.submittingProjectDoesNotAutomaticallyLicense}</p>
    </>,
  },
  {
    id: "research-folders-and-your-copies",
    title: editorial.researchFoldersCopies.title,
    content: <>
      <p>{editorial.researchFoldersCopies.whenAvailableResearchFolderFeatureCreates}</p>
      <p>{editorial.researchFoldersCopies.keepOwnCopiesImportantResearchSubmissions}</p>
    </>,
  },
  {
    id: "external-services-and-links",
    title: editorial.externalServicesLinks.title,
    content: <>
      <p>{editorial.externalServicesLinks.ebsUsesThirdPartyServicesFunctions}</p>
      <p>{editorial.externalServicesLinks.linkDoesNotGuaranteeAccuracySafety}</p>
    </>,
  },
  {
    id: "program-changes-and-availability",
    title: editorial.programChangesAvailability.title,
    content: <>
      <p>{editorial.programChangesAvailability.resourcesDeadlinesSchedulesSpeakersFormatsCapacity}</p>
    </>,
  },
  {
    id: "educational-information-and-limitations",
    title: editorial.educationalInformationLimitations.title,
    content: <>
      <p>{editorial.educationalInformationLimitations.ebsMaterialsStudentResearchAreEducation}</p>
      <p>{editorial.educationalInformationLimitations.extentPermittedByLawServicesAre}</p>
    </>,
  },
  {
    id: "responsibility-and-disputes",
    title: editorial.responsibilityDisputes.title,
    content: <>
      <p>{editorial.responsibilityDisputes.areResponsibleOwnConductSubmissionsPermissions}</p>
      <p>{editorial.responsibilityDisputes.extentPermittedByApplicableLawEbs}</p>
    </>,
  },
  {
    id: "copyright-and-other-concerns",
    title: editorial.copyrightOtherConcerns.title,
    content: <>
      <p>{editorial.copyrightOtherConcerns.ifBelieveMaterialEbsWebsiteInfringes}</p>
    </>,
  },
  {
    id: "communications-and-updates-to-these-terms",
    title: editorial.communicationsUpdatesTheseTerms.title,
    content: <>
      <p>{editorial.communicationsUpdatesTheseTerms.weMayCommunicateAboutApplicationAccess}</p>
      <p>{editorial.communicationsUpdatesTheseTerms.weMayReviseTheseTermsWill}</p>
    </>,
  },
  {
    id: "general-provisions",
    title: editorial.generalProvisions.title,
    content: <>
      <p>{editorial.generalProvisions.theseTermsConcernEbsServicesDo}</p>
    </>,
  },
  {
    id: "contact",
    title: editorial.contact.title,
    content: <>
      <p>{editorial.contact.questionsAboutTheseTermsResearchPermissions + " "}<a href={safeCopyUrl(editorial.contact.destinationExeterbiosymposiumGmailCom)}>{editorial.contact.exeterbiosymposiumGmailCom}</a>{" " + editorial.contact.orUse + " "}<a href={safeCopyUrl(editorial.contact.destinationContactPage)}>{editorial.contact.contactPage}</a>.</p>
    </>,
  }
]; }

export default function TermsPage() {
  const editorial = usePageCopy('terms', definition);
  return <LegalPage title={editorial.pageHeading.title} lead={editorial.pageHeading.lead} sections={legalSections(editorial)} />;
}
