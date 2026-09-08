import { CodeBlock, ContactForm, RemoteSchedule, RemoteSessions } from '../page-controls';

export default function PageContent() { return <div className="page-layout layout-judges">
<section className={"page-heading"}>
<div className={"shell"}>
<h1>{"Judging at EBS"}</h1>
<p className={"lead"}>{"Evaluate student research posters and give feedback to first-time researchers. Join the symposium in person or online."}</p>
</div>
</section>
<section className={"section"}>
<div className={"shell"}>
<div className={"grid columns-2"}>
<div>
<h2>{"What Judges Do"}</h2>
<p>{"EBS judges attend the symposium on the day of the event and evaluate student research presentations using a structured rubric. Each judge evaluates 4–6 poster presentations, in-person or online (depending on your availability)."}</p>
<p>{"Judging at EBS is calibrated to the level of the participants — these are high school and middle school students doing dry-lab research for the first time. You are not evaluating the quality of a PhD defense. You are evaluating effort, understanding, and scientific thinking relative to the student's experience level."}</p>
<div className={"checklist"}>
<div className={"checklist__item"}>
<span>{"Attend a brief virtual orientation in the week before the symposium"}</span>
</div>
<div className={"checklist__item"}>
<span>{"Attend Symposium Day at Phillips Exeter Academy (April 24th, 2027)"}</span>
</div>
<div className={"checklist__item"}>
<span>{"Evaluate 4–6 poster sessions (~15 min each) using our scoring rubric"}</span>
</div>
<div className={"checklist__item"}>
<span>{"Provide written and verbal feedback to each student presenter"}</span>
</div>
<div className={"checklist__item"}>
<span>{"Submit completed scoresheets by end of event day"}</span>
</div>
</div>
</div>
<div>
<div className={"grid"}>
<div className={"text-block"}>
<h3>{"Time Commitment"}</h3>
<p>{"One-day commitment, with full- or half-day attendance based on availability. See the provisional schedule for symposium-day hours. Judges may attend in person or online."}</p>
</div>
<div className={"text-block"}>
<h3>{"Location"}</h3>
<p>{"Phillips Exeter Academy, Exeter, New Hampshire. Exact venue on campus TBD. Parking information provided to registered judges."}</p>
</div>
<div className={"text-block"}>
<h3>{"Background Required"}</h3>
<p>{"Judges should have at minimum an undergraduate degree in a biological science or related field. Graduate students, faculty, and industry professionals all welcome."}</p>
</div>
<div className={"text-block"}>
<h3>{"Recognition"}</h3>
<p>{"All judges are acknowledged in the EBS symposium program and on this website. We deeply appreciate your time and expertise."}</p>
</div>
</div>
</div>
</div>
</div>
</section>
<section className={"section"}>
<div className={"shell"}>
<div className={"next-step"}>
<h2>{"Register as a judge"}</h2>
<p>{"Judge applications are open now. Express your interest and we'll confirm placement and send symposium details ahead of April 24th, 2027."}</p>
<div className={"actions"}>
<a className={"button primary"} href={"https://docs.google.com/forms/d/e/1FAIpQLScEdi8TnCtiIfO9cD0fGQkLRkPcPeik3xHIPaZi87brvRiY2g/viewform?usp=dialog"} rel={"noopener noreferrer"} target={"_blank"}>{"Express Judge Interest"}</a>
<a className={"button secondary"} href={"faq.html"}>{"FAQ"}</a>
</div>
</div>
</div>
</section>
</div>; }
