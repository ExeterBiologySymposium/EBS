import { copy, group, url } from '../fields.js';

export const definition = group("accept-invitation", {
  pageHeading: group("Page heading", {
    ebsMembership: copy("Text · EBS membership", "EBS membership"),
    title: copy("Page title", "Accept your EBS invitation"),
    continueWithEmailAddressInvitationWas: copy("Text · Continue with the email address your invitation was sent to.…", "Continue with the email address your invitation was sent to. Your invitation determines whether you join Pending for review or Accepted for access."),
  }),
  page: group("Page", {
    hrefGoAccount: url("Link destination · Go to Account", "account.html", "link"),
    goAccount: copy("Link text · Go to Account", "Go to Account"),
    hrefContactEbsTeam: url("Link destination · Contact the EBS team", "contact.html", "link"),
    contactEbsTeam: copy("Link text · Contact the EBS team", "Contact the EBS team"),
  }),
});
