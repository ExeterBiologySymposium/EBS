import { copy, group, url } from '../fields.js';

export const definition = group("student-signup", {
  pageHeading: group("Page heading", {
    hrefRegistrationOptions: url("Link destination · Registration options", "register.html", "link"),
    registrationOptions: copy("Link text · Registration options", "Registration options"),
    title: copy("Page title", "Student registration"),
    presentOriginalBiologyResearchParticipation100: copy("Text · Present original biology research. Participation is 100% free.", "Present original biology research. Participation is 100% free."),
    openAllMiddleHighSchoolStudents: copy("Text · Open to all middle and high school students. Attend at Phillips…", "Open to all middle and high school students. Attend at Phillips Exeter Academy or online on April 25th, 2027."),
  }),
  beforeApply: group("Before you apply", {
    beforeApply: copy("Heading · Before you apply", "Before you apply"),
    noPriorResearchExperienceRequired: copy("Text · No prior research experience required.", "No prior research experience required."),
    presentResearchPosterPersonOrOnline: copy("Text · Present a research poster in person or online.", "Present a research poster in person or online."),
    wetLabProjectsWillBeAccepted: copy("Text · Wet-lab projects will be accepted for presentation on a…", "Wet-lab projects will be accepted for presentation on a case-by-case basis."),
    projectsMayBeIndividualOrTeams: copy("Text · Projects may be individual or teams of up to three students.", "Projects may be individual or teams of up to three students."),
    hrefOpenStudentApplication: url("Google Forms application URL", "https://forms.gle/vgtVrsBm1UbBhwtv9", "google-form"),
    openStudentApplication: copy("Link text · Open student application", "Open student application"),
    signOpenApplicationNewTabComplete: copy("Text · Sign in to open the application in a new tab. Complete your…", "Sign in to open the application in a new tab. Complete your registration in Google Forms."),
    registeringSchool: copy("Text · Registering for a school? Use school registration.", "Registering for a school?"),
    hrefUseSchoolRegistration: url("Link destination · Use school registration", "schools.html", "link"),
    useSchoolRegistration: copy("Link text · Use school registration", "Use school registration"),
  }),
  helpWithRegistration: group("Help with registration", {
    helpWithRegistration: copy("Heading · Help with registration", "Help with registration"),
    useStudentOrSchoolApplicationAbove: copy("Text · Use the student or school application above. For questions,…", "Use the student or school application above. For questions,"),
    hrefContactEbsTeam: url("Link destination · contact the EBS team", "faq.html#contact", "link"),
    contactEbsTeam: copy("Link text · contact the EBS team", "contact the EBS team"),
    orEmail: copy("Text · Use the student or school application above. For questions,…", "or email"),
    hrefExeterbiosymposiumGmailCom: url("Link destination · exeterbiosymposium@gmail.com", "mailto:exeterbiosymposium@gmail.com", "link"),
    exeterbiosymposiumGmailCom: copy("Link text · exeterbiosymposium@gmail.com", "exeterbiosymposium@gmail.com"),
    hrefReadParticipationEligibilityFaqs: url("Link destination · Read participation and eligibility FAQs", "faq.html", "link"),
    readParticipationEligibilityFaqs: copy("Link text · Read participation and eligibility FAQs", "Read participation and eligibility FAQs"),
  }),
});
