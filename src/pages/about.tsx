import { CodeBlock, ContactForm, RemoteSchedule, RemoteSessions } from '../page-controls';

export default function PageContent() { return <div className="page-layout layout-about">
<section className={"page-heading"}>
<div className={"shell"}>
<img className="about-exeter-mark" src="/Phillips Exeter Academy-selected-assets/PEA_ExeterMark_Red_Lg.png" alt="Exeter" width={2400} height={779} decoding="async" />
<p className="eyebrow">About EBS</p>
<h1>Opening biology research<br/>to its next generation.</h1>
<p className={"lead"}>{"A free dry-lab biology research program and symposium, organized by students in the Genetics and Biotechnology Club at Phillips Exeter Academy."}</p>
</div>
</section>
<img className="about-cover" src="/images/Genetics Club Photos/EGBC 2.jpg" alt="Students from the Genetics and Biotechnology Club at the Broad Institute" />
<section className={"section about-origin"}>
<img className="about-origin-seal" src="/Phillips Exeter Academy-selected-assets/PEA_Seal_LtGray_Lg.png" alt="" aria-hidden="true" loading="lazy" decoding="async" />
<div className={"shell reading"}>
<div>
<h2>{"Why we started EBS"}</h2>
<p>{"Across the nation, talented high school and middle school students with a passion for biology   face a frustrating catch-22 when trying to enter research: the already-rare research opportunities often end up in the hands of those with prior research experience. In other words,  the very students who need a first opportunity are excluded from getting one.\n"}</p>
<p>{"We saw talented, curious peers who simply didn't know where to start — not because they lacked ability, but because no structured pathway existed for beginners. To remedy that, the Exeter Genetics and Biotechnology Club founded EBS:  a symposium specifically for beginner researchers, built around the accessible and rigorous world of dry-lab biology: computational analysis, bioinformatics, statistical modeling, and systematic literature reviews.\n"}</p>
</div>
</div>
</section>
<section className={"section"}>
<div className={"shell"}>
<div className={"grid columns-2"}>
<div>
<h2>{"What Is Dry-Lab Research?"}</h2>
<p>{"Dry-lab research is biology conducted without a physical laboratory — using computers, databases, statistics, and published literature to answer scientific questions. It is rigorous, publishable, and increasingly essential in modern biology."}</p>
<p>{" EBS is dry-lab only as it removes the primary barrier to entry for most students: access to physical lab equipment. Anyone with a computer and internet connection can begin doing meaningful biological research."}</p>
<div className={"checklist"}>
<div className={"checklist__item"}>
<span><strong>{"Bioinformatics"}</strong>{" — analyzing genomic, proteomic, or evolutionary data"}</span>
</div>
<div className={"checklist__item"}>
<span><strong>{"Computational modeling"}</strong>{" — simulating biological systems or disease outbreaks"}</span>
</div>
<div className={"checklist__item"}>
<span><strong>{"Statistical analysis"}</strong>{" — working with public health or ecology datasets"}</span>
</div>
<div className={"checklist__item"}>
<span><strong>{"Systematic literature review"}</strong>{" — synthesizing and analyzing published research"}</span>
</div>
<div className={"checklist__item"}>
<span><strong>{"Meta-analysis"}</strong>{" — drawing quantitative conclusions from existing studies"}</span>
</div>
</div>
</div>
<div>
<div className={"grid"}>
<div className={"text-block"}>
<h3>{"No Lab Required"}</h3>
<p>{"All you need is a computer, an internet connection, and a question."}</p>
</div>
<div className={"text-block"}>
<h3>{"Real Science"}</h3>
<p>{"Dry-lab research leads to new findings and is the foundation of modern genomics and systems biology."}</p>
</div>
<div className={"text-block"}>
<h3>{"Your Own Question"}</h3>
<p>{"Students choose their own research question within any area of biology they find compelling."}</p>
</div>
</div>
</div>
</div>
</div>
</section>
<section className={"section"}>
<div className={"shell"}>
<div className={"section-header"}>
<h2>{"The two parts of EBS"}</h2>
<p>{"EBS combines a year-long research program for students of all levels with a full day of poster presentations at Exeter and online on April 25, 2027."}</p>
</div>
<div className={"grid columns-2"}>
<div className={"steps"}>
<div className={"step"}>
<div className={"step__num"}>{"1"}</div>
<div className={"step__body"}>
<p className={"step__title"}>{"Research & Preparation (Fall 2026 – April 25th, 2027)"}</p>
<p>{"The research program centers on a document written by experienced high school researchers. Each section includes exercises for different ability levels, guiding students from a research question through a complete dry-lab biology project. The document is shared in a Google folder, where the team regularly checks progress and suggests refinements. Ongoing email support and regular office hours complement the asynchronous work."}</p>
</div>
</div>
<div className={"step"}>
<div className={"step__num"}>{"2"}</div>
<div className={"step__body"}>
<p className={"step__title"}>{"Three Checkpoints (December 2026 – April 2027)"}</p>
<p>{"Submit your project idea and plan on December 18, 2026; research abstract and all code or exported workflows on March 12, 2027; and first poster draft on April 9, 2027. At every checkpoint, all four co-heads review submissions and write detailed comments to help students prepare for the next stage."}</p>
</div>
</div>
<div className={"step"}>
<div className={"step__num"}>{"3"}</div>
<div className={"step__body"}>
<p className={"step__title"}>{"Symposium Day (April 25th, 2027)"}</p>
<p>The research program culminates in a poster presented at Exeter or virtually on April 25, 2027. The full-day event includes a keynote presentation and two poster sessions, with judging and feedback. See the <a href="schedule.html">full schedule</a>.</p>
</div>
</div>
<div className={"step"}>
<div className={"step__num"}>{"4"}</div>
<div className={"step__body"}>
<p className={"step__title"}>{"Awards"}</p>
<p>{"The day concludes with an awards ceremony."}</p>
</div>
</div>
</div>
<div>
<h3>{"Presentation Formats"}</h3>
<div>
<div className={"text-block"}>
<h3>{"\n\n                Poster Presentation\n              "}</h3>
<p>{"Students present a physical poster at Exeter or a digital poster online, discussing their findings with judges, peers, and attendees during the poster sessions."}</p>
</div>
</div>
</div>
</div>
</div>
</section>
<section className={"section"}>
<div className={"shell"}>
<div className={"section-header"}>
<h2>{"Our approach"}</h2>
</div>
<div className={"grid columns-3"}>
<div className={"text-block"}>
<h3>{"Accessibility"}</h3>
<p>{"Research should be open to everyone. We hope that through this program we are able to remove the physical and perceptual barriers to starting your first research project."}</p>
</div>
<div className={"text-block"}>
<h3>{"Rigor"}</h3>
<p>{"We aim for every researcher to leave EBS with a rigorous research poster graded by professional researchers. We will ensure that every participant will have the support they need to create a professional poster."}</p>
</div>
<div className={"text-block"}>
<h3>{"Community"}</h3>
<p>{"EBS has reached out to middle and high schools across the United States, and individual researchers from more than seven countries have signed up for the research program. Students learn alongside peers and receive support from our experienced student research team."}</p>
</div>
</div>
</div>
</section>
<section className={"section about-register"}>
<div className={"shell"}>
<div className={"next-step"}>
<h2>{"Take part on April 25th, 2027"}</h2>
<p>{"Whether you're ready to start your research journey or just curious to learn more, we'd love to hear from you."}</p>
<div className={"actions"}>
<a className={"button primary"} href={"register.html"}>{"Register Your Interest"}</a>
<a className={"button secondary"} href={"team.html"}>{"Meet the Team"}</a>
</div>
</div>
</div>
</section>
</div>; }
