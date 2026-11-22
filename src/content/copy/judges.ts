import { copy, group, url } from '../fields.js';

export const definition = group("judges", {
  pageHeading: group("Page heading", {
    title: copy("Page title", "Judging at EBS"),
    giveFirstTimeStudentResearchersThoughtful: copy("Text · Give first-time student researchers thoughtful feedback on their…", "Give first-time student researchers thoughtful feedback on their biology posters, in person or online on April 25, 2027."),
    qualificationsCommitmentBriefing: copy("Link text · Qualifications, commitment, and briefing", "Qualifications, commitment, and briefing"),
  }),
  whatJudgesDo: group("What judges do", {
    whatJudgesDo: copy("Heading · What judges do", "What judges do"),
    useEbsRubricAssessStudentsMethods: copy("Text · Use the EBS rubric to assess students' methods, understanding,…", "Use the EBS rubric to assess students' methods, understanding, and scientific communication at a middle or high school level. Give written and verbal feedback, then submit your scoresheets by the end of the event.", {"multiline":true}),
    location: copy("Heading · Location", "Location"),
    phillipsExeterAcademyExeterNewHampshire: copy("Text · Phillips Exeter Academy in Exeter, New Hampshire, or online.…", "Phillips Exeter Academy in Exeter, New Hampshire, or online. Campus venue and parking details will be shared with registered judges."),
    recognition: copy("Heading · Recognition", "Recognition"),
    judgesAreAcknowledgedSymposiumProgramThis: copy("Text · Judges are acknowledged in the symposium program and on this…", "Judges are acknowledged in the symposium program and on this website."),
  }),
  questionsFromJudges: group("Questions from judges", {
    questionsFromJudges: copy("Heading · Questions from judges", "Questions from judges"),
  }),
  whoCanJudge: group("Who can judge?", {
    whoCanJudge: copy("Question · Who can judge?", "Who can judge?"),
    shouldHaveAtLeastAnUndergraduate: copy("Text · You should have at least an undergraduate degree in biology or a…", "You should have at least an undergraduate degree in biology or a related STEM field. Graduate students, postdoctoral researchers, faculty, and industry professionals are welcome. You should be comfortable reviewing beginner research and giving constructive feedback.", {"multiline":true}),
  }),
  canIJudgeOnlineHowMuch: group("Can I judge online, and how much time is involved?", {
    canIJudgeOnlineHowMuch: copy("Question · Can I judge online, and how much time is involved?", "Can I judge online, and how much time is involved?"),
    yesJudgesCanAttendPersonOr: copy("Text · Yes. Judges can attend in person or online, for a full or half…", "Yes. Judges can attend in person or online, for a full or half day based on availability. Expect to review 4–6 posters, about 15 minutes each. See the provisional"),
    hrefSchedule: url("Link destination · Schedule", "schedule.html", "link"),
    schedule: copy("Link text · Schedule", "Schedule"),
    eventHours: copy("Text · Yes. Judges can attend in person or online, for a full or half…", "for event hours."),
  }),
  whatBriefingWillIReceive: group("What briefing will I receive?", {
    whatBriefingWillIReceive: copy("Question · What briefing will I receive?", "What briefing will I receive?"),
    briefingPacketIncludesRubricAssignedProject: copy("Text · A briefing packet includes the rubric, assigned project…", "A briefing packet includes the rubric, assigned project abstracts, schedule, venue information, and feedback guidance. A brief virtual orientation takes place in the week before the symposium."),
  }),
  registerAsJudge: group("Register as a judge", {
    registerAsJudge: copy("Heading · Register as a judge", "Register as a judge"),
    submitInterestFormEbsTeamWill: copy("Text · Submit your interest form. The EBS team will confirm placement…", "Submit your interest form. The EBS team will confirm placement and send event details."),
    hrefExpressJudgeInterest: url("Google Forms application URL", "https://docs.google.com/forms/d/e/1FAIpQLScEdi8TnCtiIfO9cD0fGQkLRkPcPeik3xHIPaZi87brvRiY2g/viewform?usp=dialog", "google-form"),
    expressJudgeInterest: copy("Link text · Express judge interest", "Express judge interest"),
    hrefContactEbs: url("Link destination · Contact EBS", "contact.html", "link"),
    contactEbs: copy("Link text · Contact EBS", "Contact EBS"),
  }),
});
