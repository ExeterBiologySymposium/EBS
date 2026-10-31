import { LearningLink } from '../auth';
import { RegistrationLink } from '../auth';
import { CodeBlock, ContactForm, RemoteSchedule, RemoteSessions } from '../page-controls';

export default function PageContent() { return <div className="page-layout layout-researchers">
<section className={"page-heading"}>
<div className={"shell"}>
<h1>{"Student research"}</h1>
<p className={"lead"}>{"EBS has two parts: a year-long dry-lab biology research program for students of all levels, followed by poster presentations at Exeter or online on April 25, 2027."}</p>
</div>
</section>
<section className={"section"}>
<div className={"shell"}>
<figure className="context-media context-media--research"><img src="/images/Studying/Screenshot 2026-09-10 at 6.02.51 PM.png" alt="Student working on research at a laptop" loading="lazy" /></figure>
<div className={"grid columns-2"}>
<div>
<h2>{"Dry-Lab Research"}</h2>
<p>{"EBS research is dry-lab: no wet-lab experiments, pipettes, or specialized equipment required. Every project uses computational analysis, publicly available datasets, literature synthesis, or statistical modeling — the kind of work you can do with a laptop and internet connection."}</p>
<p>{"This makes original research accessible regardless of what lab access your school has. Your project should ask a real biological question and answer it with a method reviewers can follow and verify."}</p>
<div className={"callout"}>
<p><strong>{"Product design welcome."}</strong>{" Research does not have to be wet-lab or experimental. Computational analysis, literature synthesis, epidemiological modeling, genomic data analysis, and biology-adjacent product design all qualify."}</p>
</div>
</div>
<div>
<h3>{"Valid Research Areas"}</h3>
<div className={"checklist"}>
<div className={"checklist__item"}>
<span>{"Genetics and genomics"}</span>
</div>
<div className={"checklist__item"}>
<span>{"Computational biology and bioinformatics"}</span>
</div>
<div className={"checklist__item"}>
<span>{"Epidemiology and public health"}</span>
</div>
<div className={"checklist__item"}>
<span>{"Ecology and evolutionary biology"}</span>
</div>
<div className={"checklist__item"}>
<span>{"Neuroscience and behavioral biology"}</span>
</div>
<div className={"checklist__item"}>
<span>{"Cell and molecular biology (computational focus)"}</span>
</div>
<div className={"checklist__item"}>
<span>{"Biology-adjacent product design"}</span>
</div>
</div>
<div className={"callout"}>
<p>{"Not sure if your topic qualifies? "}<a href={"faq.html"}>{"Check the FAQ"}</a>{" or reach out to the organizing team — we'd rather help you scope a project than turn you away."}</p>
</div>
</div>
</div>
</div>
</section>
<section className={"section"}>
<div className={"shell"}>
<div className={"section-header"}>
<h2>{"Timeline"}</h2>
<p>{"The research cycle runs from October 2026 through Symposium Day on April 25th, 2027."}</p>
</div>
<div className={"grid columns-2"}>
<div className={"timeline"}>
<div className={"timeline__item"}>
<div className={"timeline__date"}>{"September 2026"}</div>
<div className={"timeline__title"}>{"Interest Registration"}</div>
<p>{"Submit your interest via the registration form. Share your research area and any initial ideas."}</p>
</div>
<div className={"timeline__item"}>
<div className={"timeline__date"}>{"October 2026"}</div>
<div className={"timeline__title"}>{"Research Kickoff"}</div>
<p>{"Start with a 20-minute Zoom orientation arranged by email with an EBS team member. Use the research document and team support to narrow your question."}</p>
</div>
<div className={"timeline__item"}>
<div className={"timeline__date"}>{"October – March"}</div>
<div className={"timeline__title"}>{"Active Research Period"}</div>
<p>{"Work through the research document, literature review, and data analysis at your own pace, with regular progress check-ins, ongoing email support, and office hours."}</p>
</div>
<div className={"timeline__item"}>
<div className={"timeline__date"}>{"Friday, December 18, 2026"}</div>
<div className={"timeline__title"}>{"Check 1: Idea and Research Plan"}</div>
<p>{"Submit your project idea and research plan. All four EBS co-heads review the submission and provide detailed written feedback for the next stage."}</p>
</div>
</div>
<div className={"timeline"}>
<div className={"timeline__item"}>
<div className={"timeline__date"}>{"Friday, March 12, 2027"}</div>
<div className={"timeline__title"}>{"Check 2: Abstract and Code"}</div>
<p>{"Submit a 250-word research abstract describing your question, methodology, findings, and conclusions, plus all code or exported workflows. All four co-heads read the abstract, check the code for completeness, and write detailed comments to guide your next steps."}</p>
</div>
<div className={"timeline__item"}>
<div className={"timeline__date"}>{"Friday, April 9, 2027"}</div>
<div className={"timeline__title"}>{"Check 3: First Poster Draft"}</div>
<p>{"Submit your first poster draft. All four co-heads provide detailed written comments on format, completeness, and consistency with your abstract and research logs so you can refine it before presentation."}</p>
</div>
<div className={"timeline__item"}>
<div className={"timeline__date"}>{"April 25th, 2027"}</div>
<div className={"timeline__title"}>{"Symposium Day"}</div>
<p>Present your completed poster at Phillips Exeter Academy or virtually. The full-day event includes a keynote presentation and two poster sessions. See the <a href="schedule.html">full schedule</a>.</p>
</div>
</div>
</div>
</div>
</section>
<section className={"section"}>
<div className={"shell"}>
<div className={"section-header"}>
<h2>{"Presentation Format"}</h2>
<p>{"EBS uses a single, consistent format so every participant is judged the same way."}</p>
</div>
<div className={"grid columns-2"}>
<div className={"text-block"}>
<h3>{"Poster Presentation"}</h3>
<p>{"Design a research poster and present it to judges and attendees during the poster session. Judges spend approximately 15 minutes per poster. Standard academic poster format — EBS provides a template."}</p>
<span className={"badge badge--primary"}>{"In-person"}</span>
</div>
<div className={"text-block"}>
<h3>{"Poster Presentation, Online"}</h3>
<p>{"Same format, presented over video — walk judges and attendees through your poster during the same live sessions as in-person presenters."}</p>
<span className={"badge badge--primary"}>{"Online"}</span>
</div>
</div>
</div>
</section>
<section className={"section"}>
<div className={"shell"}>
<div className={"grid columns-2"}>
<div>
<h2>{"Research support"}</h2>
<p>{"The core of the program is a research document written by experienced high school researchers. It guides you through the entire research process, with multiple exercises in each section for different ability levels."}</p>
<p>{"Your shared Google folder holds the document and your work. The team regularly checks every student’s progress and suggests ways to refine their study. Work asynchronously, stay in touch by email, and use regular office hours to talk through ideas and difficulties."}</p>
<p>Once your account is Accepted, use <a href="account.html">Account → Create my research folder</a> to set up your folder and document. For research questions or office-hour arrangements, email <a href="mailto:exeterbiologysymposium@gmail.com">exeterbiologysymposium@gmail.com</a>.</p>
<RegistrationLink className={"button primary"} href={"https://forms.gle/vgtVrsBm1UbBhwtv9"}>Register your interest</RegistrationLink>
</div>
<div>
<div className={"text-block"}>
<h3>{"Support throughout your project"}</h3>
<div className={"checklist"}>
<div className={"checklist__item"}>
<span>{"Scoping and refining your research question"}</span>
</div>
<div className={"checklist__item"}>
<span>{"Identifying credible sources and datasets"}</span>
</div>
<div className={"checklist__item"}>
<span>{"Selecting analytical tools and methods appropriate for dry-lab research"}</span>
</div>
<div className={"checklist__item"}>
<span>{"Detailed written feedback from all four co-heads at each checkpoint"}</span>
</div>
<div className={"checklist__item"}>
<span>{"Regular office hours and ongoing email communication"}</span>
</div>
</div>
</div>
</div>
</div>
</div>
</section>
<section className={"section"}>
<div className={"shell"}>
<div className={"next-step"}>
<h2>{"Register as a student"}</h2>
<p>{"Join researchers from more than seven countries in the EBS research program. Each student registers individually; the team will follow up by email."}</p>
<div className={"actions"}>
<RegistrationLink className={"button primary"} href={"https://forms.gle/vgtVrsBm1UbBhwtv9"}>{"Register Interest"}</RegistrationLink>
<LearningLink className={"button secondary"} href={"resources.html"}>{"Browse Resources"}</LearningLink>
</div>
</div>
</div>
</section>
</div>; }
