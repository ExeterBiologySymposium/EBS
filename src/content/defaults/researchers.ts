// Initial Student research content. Public, so it is bundled for the prerendered page.
// Published versions from the Team editor replace it at runtime.
import type { ResearchContent } from '../model.js';

export const researchersInitial: ResearchContent = {
  title: "Student research",
  lead: "EBS has two parts: a year-long dry-lab biology research program for students of all levels, followed by poster presentations at Exeter or online on April 25, 2027.",
  registrationUrl: 'https://forms.gle/vgtVrsBm1UbBhwtv9',
  overview: {
    imageSrc: "/images/Studying/Screenshot 2026-09-10 at 6.02.51 PM.png",
    imageAlt: "Student working on research at a laptop",
    heading: "Dry-Lab Research",
    body: { text: "The EBS research program focuses on dry-lab projects that use computational analysis, public datasets, published studies, or statistical modeling. Wet-lab projects will be accepted for presentation on a case-by-case basis.\n\nThis makes original research accessible regardless of what lab access your school has. Your project should ask a real biological question and answer it with a method reviewers can follow and verify.", links: [] },
    calloutTitle: "Product design welcome.",
    calloutText: "Research does not have to be wet-lab or experimental. Computational analysis, literature synthesis, epidemiological modeling, genomic data analysis, and biology-adjacent product design all qualify.",
    areasHeading: "Valid Research Areas",
    areas: [
      "Genetics and genomics",
      "Computational biology and bioinformatics",
      "Epidemiology and public health",
      "Ecology and evolutionary biology",
      "Neuroscience and behavioral biology",
      "Cell and molecular biology (computational focus)",
      "Biology-adjacent product design",
    ],
    areasNote: { text: "Not sure if your topic qualifies? Check the FAQ or reach out to the organizing team — we'd rather help you scope a project than turn you away.", links: [{ phrase: "Check the FAQ", url: "faq.html" }] },
  },
  timeline: {
    heading: "Timeline",
    intro: "The research cycle runs from October 2026 through Symposium Day on April 25th, 2027.",
    entries: [
      { date: "September 2026", title: "Interest Registration", description: { text: "Submit your interest via the registration form. Share your research area and any initial ideas.", links: [] } },
      { date: "October 2026", title: "Research Kickoff", description: { text: "Start with a 20-minute Zoom orientation arranged by email with an EBS team member. Use the research document and team support to narrow your question.", links: [] } },
      { date: "October – March", title: "Active Research Period", description: { text: "Work through the research document, literature review, and data analysis at your own pace, with regular progress check-ins, ongoing email support, and office hours.", links: [] } },
      { date: "Friday, December 18, 2026", title: "Check 1: Idea and Research Plan", description: { text: "Submit your project idea and research plan. All four EBS co-heads review the submission and provide detailed written feedback for the next stage.", links: [] } },
      { date: "Friday, March 12, 2027", title: "Check 2: Abstract and Code", description: { text: "Submit a 250-word research abstract describing your question, methodology, findings, and conclusions, plus all code or exported workflows. All four co-heads read the abstract, check the code for completeness, and write detailed comments to guide your next steps.", links: [] } },
      { date: "Friday, April 9, 2027", title: "Check 3: First Poster Draft", description: { text: "Submit your first poster draft. All four co-heads provide detailed written comments on format, completeness, and consistency with your abstract and research logs so you can refine it before presentation.", links: [] } },
      { date: "April 25th, 2027", title: "Symposium Day", description: { text: "Present your completed poster at Phillips Exeter Academy or virtually. The full-day event includes a keynote presentation and two poster sessions. See the full schedule.", links: [{ phrase: "full schedule", url: "schedule.html" }] } },
    ],
  },
  formats: {
    heading: "Presentation Format",
    intro: "EBS uses a single, consistent format so every participant is judged the same way.",
    entries: [
      { title: "Poster Presentation", description: "Design a research poster and present it to judges and attendees during the poster session. Judges spend approximately 15 minutes per poster. Standard academic poster format — EBS provides a template.", badge: "In-person" },
      { title: "Poster Presentation, Online", description: "Same format, presented over video — walk judges and attendees through your poster during the same live sessions as in-person presenters.", badge: "Online" },
    ],
  },
  support: {
    heading: "Research support",
    body: { text: "The core of the program is a research document written by experienced high school researchers. It guides you through the entire research process, with multiple exercises in each section for different ability levels.\n\nYour shared Google folder holds the document and your work. The team regularly checks every student’s progress and suggests ways to refine their study. Work asynchronously, stay in touch by email, and use regular office hours to talk through ideas and difficulties.\n\nOnce your account is Accepted, use Account → Create my research folder to set up your folder and document. For research questions or office-hour arrangements, email exeterbiologysymposium@gmail.com.", links: [{ phrase: "Account → Create my research folder", url: "account.html" }, { phrase: "exeterbiologysymposium@gmail.com", url: "mailto:exeterbiologysymposium@gmail.com" }] },
    buttonLabel: "Register your interest",
    listHeading: "Support throughout your project",
    items: [
      "Scoping and refining your research question",
      "Identifying credible sources and datasets",
      "Selecting analytical tools and methods appropriate for dry-lab research",
      "Detailed written feedback from all four co-heads at each checkpoint",
      "Regular office hours and ongoing email communication",
    ],
  },
  registration: {
    heading: "Register as a student",
    text: "Join researchers from more than seven countries in the EBS research program. Each student registers individually; the team will follow up by email.",
    buttonLabel: "Register Interest",
    secondaryLabel: "Browse Resources",
    secondaryPage: 'resources.html',
  },
};
