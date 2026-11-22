import { copy, group, url } from '../fields.js';

export const definition = group("contact", {
  pageHeading: group("Page heading", {
    getTouch: copy("Text · Get in touch", "Get in touch"),
    title: copy("Page title", "Contact the EBS team"),
    questionsAboutAccountAccessResearchParticipation: copy("Text · Questions about account access, research, participation, or…", "Questions about account access, research, participation, or events? Send a message to the organizing team."),
  }),
  howCanWeHelp: group("How can we help?", {
    howCanWeHelp: copy("Heading · How can we help?", "How can we help?"),
    ifAreAskingAboutAccountAccess: copy("Text · If you are asking about account access, include the email…", "If you are asking about account access, include the email address you use to sign in. Please do not include passwords or private research data."),
    canAlsoFindAnswersOur: copy("Text · You can also find answers on our FAQ page.", "You can also find answers on our"),
    hrefFaqPage: url("Link destination · FAQ page", "faq.html", "link"),
    faqPage: copy("Link text · FAQ page", "FAQ page"),
  }),
});
