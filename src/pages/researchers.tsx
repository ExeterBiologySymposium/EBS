import { CodeBlock, ContactForm, RemoteSchedule, RemoteSessions } from '../page-controls';

export default function PageContent() { return <div className="page-layout layout-researchers">
<section className={"page-heading"}>
<div className={"shell"}>
<h1>{"Student research"}</h1>
<p className={"lead"}>{"Open to all middle and high school students. Investigate a biological question with public data or published research, then present your work in person or online."}</p>
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
<p>{"The research cycle runs from October 2026 through Symposium Day on April 24th, 2027."}</p>
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
<p>{"Orientation session covering how EBS works. Narrow your research question using the EBS resource library and organizing team support."}</p>
</div>
<div className={"timeline__item"}>
<div className={"timeline__date"}>{"October – January"}</div>
<div className={"timeline__title"}>{"Active Research Period"}</div>
<p>{"Literature review, data collection or analysis, and iterative development of your project, with support from the resource library and organizing team."}</p>
</div>
</div>
<div className={"timeline"}>
<div className={"timeline__item"}>
<div className={"timeline__date"}>{"March 2027"}</div>
<div className={"timeline__title"}>{"Abstract Submission"}</div>
<p>{"Submit a 250-word abstract describing your research question, methodology, findings, and conclusions."}</p>
</div>
<div className={"timeline__item"}>
<div className={"timeline__date"}>{"April 2027"}</div>
<div className={"timeline__title"}>{"Presentation Preparation"}</div>
<p>{"Prepare your poster presentation. Receive feedback from the organizing team. Practice Q&A with peers."}</p>
</div>
<div className={"timeline__item"}>
<div className={"timeline__date"}>{"April 24th, 2027"}</div>
<div className={"timeline__title"}>{"Symposium Day"}</div>
<p>{"Present your research in-person at Phillips Exeter Academy or online. Receive judge feedback, attend guest speaker talks, and connect with the broader EBS community."}</p>
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
<p>{"Every registered researcher gets full access to the EBS resource library and organizing team support — no prior research experience needed to get started."}</p>
<p>{"The organizing team is available throughout the research cycle, whether you're presenting in-person or online, from October through Symposium Day in May."}</p>
<a className={"button primary"} href={"https://forms.gle/vgtVrsBm1UbBhwtv9"} rel={"noopener noreferrer"} target={"_blank"}>{"\n            Register Your Interest\n\n"}</a>
</div>
<div>
<div className={"text-block"}>
<h3>{"What the Resource Library Covers"}</h3>
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
<span>{"Guidance on your abstract before submission"}</span>
</div>
<div className={"checklist__item"}>
<span>{"Helping you prepare for judge Q&A"}</span>
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
<p>{"Student registration is open now. Fill out the form and we'll be in touch as the research cycle begins."}</p>
<div className={"actions"}>
<a className={"button primary"} href={"https://forms.gle/vgtVrsBm1UbBhwtv9"} rel={"noopener noreferrer"} target={"_blank"}>{"Register Interest"}</a>
<a className={"button secondary"} href={"resources.html"}>{"Browse Resources"}</a>
</div>
</div>
</div>
</section>
</div>; }
