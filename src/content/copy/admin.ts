import { copy, group } from '../fields.js';

export const definition = group("admin", {
  addOrInvite: group("Add or invite", {
    addOrInviteParticipant: copy("Heading · Add or invite participant", "Add or invite participant"),
    choosePendingReviewOrAcceptedGrant: copy("Text · Choose Pending for review or Accepted to grant resource access.", "Choose Pending for review or Accepted to grant resource access."),
    participantEmail: copy("Label · Participant email", "Participant email"),
    destination: copy("Label · Destination", "Destination"),
    pending: copy("Text · Pending", "Pending"),
    accepted: copy("Text · Accepted", "Accepted"),
    retryCapacityCheck: copy("Link text · Retry capacity check", "Retry capacity check"),
  }),
  workspace: group("Workspace", {
    teamAccessHasChangedAdministrativeData: copy("Text · Your team access has changed. Administrative data has been…", "Your team access has changed. Administrative data has been closed."),
    returnAccount: copy("Link text · Return to Account", "Return to Account"),
    participants: copy("Link text · Participants", "Participants"),
    websiteContent: copy("Link text · Website content", "Website content"),
    teamOrganizationSettings: copy("Link text · Team organization settings", "Team organization settings"),
    refreshListsCapacity: copy("Link text · Refresh lists and capacity", "Refresh lists and capacity"),
  }),
  pageHeading: group("Page heading", {
    ebsTeam: copy("Text · For the EBS team", "For the EBS team"),
    title: copy("Page title", "EBS administration"),
    manageParticipantsInvitationsEditWebsiteContent: copy("Text · Manage participants and invitations, edit website content, and…", "Manage participants and invitations, edit website content, and control access to EBS research tools."),
    backAccount: copy("Link text · Back to Account", "Back to Account"),
  }),
  page: group("Page", {
    sign: copy("Link text · Sign in", "Sign in"),
    checkTeamAccessAgain: copy("Link text · Check team access again", "Check team access again"),
  }),
});
