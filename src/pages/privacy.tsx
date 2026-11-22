import { usePageCopy, safeCopyUrl } from '../content/page-copy';
import { definition } from '../content/copy/privacy';
import type { Value } from '../content/fields';
import { LegalPage, type LegalSection } from '../legal-page';

function legalSections(editorial: Value<typeof definition>): LegalSection[] { return [
  {
    id: "about-this-notice",
    title: editorial.aboutThisNotice.title,
    content: <>
      <p>{editorial.aboutThisNotice.exeterBiologySymposiumEbsFreeStudent}</p>
      <p>{editorial.aboutThisNotice.thisNoticeExplainsHowEbsOrganizing}</p>
      <p>{editorial.aboutThisNotice.readThisNoticeAlongsideOur + " "}<a href={safeCopyUrl(editorial.aboutThisNotice.destinationTermsUse)}>{editorial.aboutThisNotice.termsUse}</a>{editorial.aboutThisNotice.itDescribesOurPracticesItDoes + " "}<a href={safeCopyUrl(editorial.aboutThisNotice.destinationAcademyPrivacyNotice)}>{editorial.aboutThisNotice.academyPrivacyNotice}</a>{editorial.aboutThisNotice.whichAddressesAcademySBroaderActivities}</p>
    </>,
  },
  {
    id: "information-you-provide",
    title: editorial.informationProvide.title,
    content: <>
      <p>{editorial.informationProvide.dependingHowParticipateInformationMayInclude}</p>
      <ul>
        <li><strong>{editorial.informationProvide.accountInformation}</strong>{" " + editorial.informationProvide.nameEmailAddressAccountIdentifierLinked}</li>
        <li><strong>{editorial.informationProvide.applicationsParticipation}</strong>{" " + editorial.informationProvide.informationRequestedStudentSchoolOrJudge}</li>
        <li><strong>{editorial.informationProvide.messages}</strong>{" " + editorial.informationProvide.nameEmailOptionalRoleSubjectMessage}</li>
        <li><strong>{editorial.informationProvide.research}</strong>{" " + editorial.informationProvide.projectTitlesAbstractsPostersCodeResearch}</li>
        <li><strong>{editorial.informationProvide.programArrangements}</strong>{" " + editorial.informationProvide.informationOrAnAuthorizedAdultProvides}</li>
      </ul>
      <p>{editorial.informationProvide.pleaseProvideOnlyInformationNeededRelevant}</p>
    </>,
  },
  {
    id: "information-collected-when-you-use-the-website",
    title: editorial.informationCollectedWhenUseWebsite.title,
    content: <>
      <p>{editorial.informationCollectedWhenUseWebsite.websiteItsProvidersMayProcessTechnical}</p>
      <p>{editorial.informationCollectedWhenUseWebsite.siteIncludesVercelWebAnalyticsSpeed + " "}<a href={safeCopyUrl(editorial.informationCollectedWhenUseWebsite.destinationVercelWebAnalyticsPrivacyInformation)}>{editorial.informationCollectedWhenUseWebsite.vercelWebAnalyticsPrivacyInformation}</a>{" " + editorial.informationCollectedWhenUseWebsite.entry + " "}<a href={safeCopyUrl(editorial.informationCollectedWhenUseWebsite.destinationSpeedInsightsPrivacyInformation)}>{editorial.informationCollectedWhenUseWebsite.speedInsightsPrivacyInformation}</a>.</p>
      <p>{editorial.informationCollectedWhenUseWebsite.contactPagesLoadHcaptchaHelpPrevent}</p>
    </>,
  },
  {
    id: "where-information-comes-from",
    title: editorial.whereInformationComesFrom.title,
    content: <>
      <p>{editorial.whereInformationComesFrom.weReceiveInformationDirectlyFromFrom}</p>
      <p>{editorial.whereInformationComesFrom.applicationFormsResearchToolsLinksUse}</p>
    </>,
  },
  {
    id: "how-we-use-information",
    title: editorial.howWeUseInformation.title,
    content: <>
      <p>{editorial.howWeUseInformation.weUseInformation}</p>
      <ul>
        <li>{editorial.howWeUseInformation.respondQuestionsCommunicateAboutEbs}</li>
        <li>{editorial.howWeUseInformation.processApplicationsManageAccountsDetermineAccess}</li>
        <li>{editorial.howWeUseInformation.provideLearningResourcesResearchGuidanceProject}</li>
        <li>{editorial.howWeUseInformation.createManageResearchFoldersWhereThat}</li>
        <li>{editorial.howWeUseInformation.coordinatePresentationsAttendanceChaperoneArrangementsProgram}</li>
        <li>{editorial.howWeUseInformation.maintainWebsiteUnderstandItsUseDiagnose}</li>
        <li>{editorial.howWeUseInformation.addressSafetyConcernsEnforceParticipationRequirements}</li>
      </ul>
      <p>{editorial.howWeUseInformation.informationSubmittedResearchUsedSupportProgram}</p>
    </>,
  },
  {
    id: "who-can-receive-information",
    title: editorial.whoCanReceiveInformation.title,
    content: <>
      <p>{editorial.whoCanReceiveInformation.informationMayBeMadeAvailableEbs}</p>
      <p>{editorial.whoCanReceiveInformation.websiteSIntegrationsInclude}</p>
      <ul>
        <li><strong>{editorial.whoCanReceiveInformation.clerk}</strong>{" " + editorial.whoCanReceiveInformation.signAccountManagementMembershipInformationSee + " "}<a href={safeCopyUrl(editorial.whoCanReceiveInformation.destinationClerkSPrivacyInformation)}>{editorial.whoCanReceiveInformation.clerkSPrivacyInformation}</a>.</li>
        <li><strong>{editorial.whoCanReceiveInformation.google}</strong>{" " + editorial.whoCanReceiveInformation.applicationFormsEmailCommunicationsLinkedGoogle + " "}<a href={safeCopyUrl(editorial.whoCanReceiveInformation.destinationGoogleSPrivacyPolicy)}>{editorial.whoCanReceiveInformation.googleSPrivacyPolicy}</a>.</li>
        <li><strong>{editorial.whoCanReceiveInformation.web3formsHcaptcha}</strong>{" " + editorial.whoCanReceiveInformation.deliveryContactFormMessagesProtectionAgainst + " "}<a href={safeCopyUrl(editorial.whoCanReceiveInformation.destinationWeb3formsPrivacyPolicy)}>{editorial.whoCanReceiveInformation.web3formsPrivacyPolicy}</a>{" " + editorial.whoCanReceiveInformation.entry + " "}<a href={safeCopyUrl(editorial.whoCanReceiveInformation.destinationHcaptchaSPrivacyInformation)}>{editorial.whoCanReceiveInformation.hcaptchaSPrivacyInformation}</a>.</li>
        <li><strong>{editorial.whoCanReceiveInformation.vercel}</strong>{" " + editorial.whoCanReceiveInformation.websiteHostingRequestHandlingAnalyticsPerformance + " "}<a href={safeCopyUrl(editorial.whoCanReceiveInformation.destinationVercelSPrivacyNotice)}>{editorial.whoCanReceiveInformation.vercelSPrivacyNotice}</a>.</li>
        <li><strong>{editorial.whoCanReceiveInformation.neon}</strong>{" " + editorial.whoCanReceiveInformation.storageRecordsConnectingAnAcceptedParticipant + " "}<a href={safeCopyUrl(editorial.whoCanReceiveInformation.destinationNeonSPrivacyPolicy)}>{editorial.whoCanReceiveInformation.neonSPrivacyPolicy}</a>.</li>
        <li><strong>{editorial.whoCanReceiveInformation.appwrite}</strong>{" " + editorial.whoCanReceiveInformation.deliveryScheduleSessionInformationWhichCan + " "}<a href={safeCopyUrl(editorial.whoCanReceiveInformation.destinationAppwriteSPrivacyPolicy)}>{editorial.whoCanReceiveInformation.appwriteSPrivacyPolicy}</a>.</li>
      </ul>
      <p>{editorial.whoCanReceiveInformation.providersProcessInformationAccordingApplicableService}</p>
      <p>{editorial.whoCanReceiveInformation.weMayAlsoDiscloseInformationWhen}</p>
    </>,
  },
  {
    id: "research-folders-and-google-accounts",
    title: editorial.researchFoldersGoogleAccounts.title,
    content: <>
      <p>{editorial.researchFoldersGoogleAccounts.whenEnabledResearchFolderFeatureUses}</p>
      <p>{editorial.researchFoldersGoogleAccounts.supportingDatabaseStoresEbsAccountIdentifier}</p>
      <p>{editorial.researchFoldersGoogleAccounts.linkingGoogleSignAccountThisFeature}</p>
      <p>{editorial.researchFoldersGoogleAccounts.deletingAnAccountUnlinkingGoogleOr}</p>
    </>,
  },
  {
    id: "presentations-public-materials-and-recordings",
    title: editorial.presentationsPublicMaterialsRecordings.title,
    content: <>
      <p>{editorial.presentationsPublicMaterialsRecordings.presentationIntendedBeViewedByIts}</p>
      <p>{editorial.presentationsPublicMaterialsRecordings.privateWorkingFilesAreNotAutomatically}</p>
    </>,
  },
  {
    id: "cookies-browser-controls-and-external-resources",
    title: editorial.cookiesBrowserControlsExternalResources.title,
    content: <>
      <p>{editorial.cookiesBrowserControlsExternalResources.signSecurityProvidersMayUseCookies}</p>
      <p>{editorial.cookiesBrowserControlsExternalResources.ebsWebsiteDoesNotCurrentlyChange}</p>
      <p>{editorial.cookiesBrowserControlsExternalResources.externalSitesSocialNetworksVideosResearch}</p>
    </>,
  },
  {
    id: "children-and-younger-participants",
    title: editorial.childrenYoungerParticipants.title,
    content: <>
      <p>{editorial.childrenYoungerParticipants.ebsIntendedSupportMiddleHighSchool}</p>
      <p>{editorial.childrenYoungerParticipants.directEbsAccountCreationPersonalInformation}</p>
      <p>{editorial.childrenYoungerParticipants.childrenUnder13ShouldNotCreate}</p>
      <p>{editorial.childrenYoungerParticipants.ifBelieveChildHasProvidedInformation}</p>
    </>,
  },
  {
    id: "retention-and-deletion",
    title: editorial.retentionDeletion.title,
    content: <>
      <p>{editorial.retentionDeletion.informationRetainedAccordingItsPurposeApplicable}</p>
      <p>{editorial.retentionDeletion.canAskAboutRetentionOrRequest}</p>
    </>,
  },
  {
    id: "your-choices-and-requests",
    title: editorial.choicesRequests.title,
    content: <>
      <p>{editorial.choicesRequests.canBrowsePublicInformationWithoutCreating}</p>
      <p>{editorial.choicesRequests.dependingLawThatAppliesMayHave}</p>
      <p>{editorial.choicesRequests.emailTeamWithPrivacyRequestSubject}</p>
      <p>{editorial.choicesRequests.stopOptionalProgramAnnouncementsFollowAn}</p>
    </>,
  },
  {
    id: "international-access",
    title: editorial.internationalAccess.title,
    content: <>
      <p>{editorial.internationalAccess.ebsOrganizedNewHampshireUnitedStates}</p>
    </>,
  },
  {
    id: "security",
    title: editorial.security.title,
    content: <>
      <p>{editorial.security.websiteFeaturesUseAccessControlsProvider}</p>
    </>,
  },
  {
    id: "changes-to-this-notice",
    title: editorial.changesThisNotice.title,
    content: <>
      <p>{editorial.changesThisNotice.weMayUpdateThisNoticeAs}</p>
    </>,
  },
  {
    id: "contact",
    title: editorial.contact.title,
    content: <>
      <p>{editorial.contact.questionsCorrectionsOrPrivacyRequestsContact + " "}<a href={safeCopyUrl(editorial.contact.destinationExeterbiosymposiumGmailCom)}>{editorial.contact.exeterbiosymposiumGmailCom}</a>{" " + editorial.contact.withPrivacyRequestSubjectLineOr + " "}<a href={safeCopyUrl(editorial.contact.destinationContactPage)}>{editorial.contact.contactPage}</a>.</p>
      <p>{editorial.contact.questionsAboutAcademySWiderPractices + " "}<a href={safeCopyUrl(editorial.contact.destinationPhillipsExeterAcademySPrivacy)}>{editorial.contact.phillipsExeterAcademySPrivacyNotice}</a>.</p>
    </>,
  }
]; }

export default function PrivacyPage() {
  const editorial = usePageCopy('privacy', definition);
  return <LegalPage title={editorial.pageHeading.title} lead={editorial.pageHeading.lead} sections={legalSections(editorial)} />;
}
