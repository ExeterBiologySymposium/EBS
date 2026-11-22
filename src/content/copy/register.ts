import { copy, group, url } from '../fields.js';

export const definition = group("register", {
  pageHeading: group("Page heading", {
    hrefContactEbsTeam: url("Link destination · Contact the EBS team", "contact.html", "link"),
    contactEbsTeam: copy("Link text · Contact the EBS team", "Contact the EBS team"),
    title: copy("Page title", "Register for EBS"),
    chooseOneRouteSignOrCreate: copy("Text · Choose one route. Sign in or create an account to open your…", "Choose one route. Sign in or create an account to open your application in Google Forms."),
    april25th2027PersonOnlineParticipation: copy("Text · April 25th, 2027. In-person and online participation are planned.", "April 25th, 2027. In-person and online participation are planned."),
  }),
  students: group("Students", {
    students: copy("Heading · Students", "Students"),
    middleHighSchoolStudentsPresentingOriginal: copy("Text · For middle and high school students presenting original biology…", "For middle and high school students presenting original biology research. Wet-lab projects will be accepted for presentation on a case-by-case basis."),
    hrefStudentRegistration: url("Link destination · Student registration", "student-signup.html", "link"),
    studentRegistration: copy("Link text · Student registration", "Student registration"),
  }),
  schoolsEducators: group("Schools and educators", {
    schoolsEducators: copy("Heading · Schools and educators", "Schools and educators"),
    educatorsCounselorsAdministratorsSharingEbsWith: copy("Text · For educators, counselors, and administrators sharing EBS with…", "For educators, counselors, and administrators sharing EBS with students or registering school interest."),
    hrefSchoolRegistration: url("Link destination · School registration", "schools.html", "link"),
    schoolRegistration: copy("Link text · School registration", "School registration"),
  }),
  judges: group("Judges", {
    judges: copy("Heading · Judges", "Judges"),
    researchersProfessionalsWhoWantEvaluateStudent: copy("Text · For researchers and professionals who want to evaluate student…", "For researchers and professionals who want to evaluate student posters and presentations."),
    hrefJudgeRecruitment: url("Link destination · Judge recruitment", "judges.html", "link"),
    judgeRecruitment: copy("Link text · Judge recruitment", "Judge recruitment"),
  }),
  helpChoosingAnApplication: group("Help choosing an application", {
    helpChoosingAnApplication: copy("Heading · Help choosing an application", "Help choosing an application"),
    signupPagesLinkApplicationFormsIf: copy("Text · The signup pages link to the application forms. If you are…", "The signup pages link to the application forms. If you are unsure which fits,"),
    hrefContactEbsTeam: url("Link destination · contact the EBS team", "faq.html#contact", "link"),
    contactEbsTeam: copy("Link text · contact the EBS team", "contact the EBS team"),
    orEmail: copy("Text · The signup pages link to the application forms. If you are…", "or email"),
    hrefExeterbiosymposiumGmailCom: url("Link destination · exeterbiosymposium@gmail.com", "mailto:exeterbiosymposium@gmail.com", "link"),
    exeterbiosymposiumGmailCom: copy("Link text · exeterbiosymposium@gmail.com", "exeterbiosymposium@gmail.com"),
    hrefReadParticipationEligibilityTimelineFaqs: url("Link destination · Read participation, eligibility, and timeline FAQs", "faq.html", "link"),
    readParticipationEligibilityTimelineFaqs: copy("Link text · Read participation, eligibility, and timeline FAQs", "Read participation, eligibility, and timeline FAQs"),
  }),
});
