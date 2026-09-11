import { CodeBlock, ContactForm, RemoteSchedule, RemoteSessions } from '../page-controls';

export default function PageContent() { return <div className="page-layout layout-about">
<section className={"page-heading"}>
<div className={"shell"}>
<p className="eyebrow">About EBS</p>
<h1>Opening biology research<br/>to its next generation.</h1>
<p className={"lead"}>{"A free introduction to dry-lab biology research, organized by students in the Genetics and Biotech Club at Phillips Exeter Academy."}</p>
</div>
</section>
<img className="about-cover" src="/images/Genetics Club Photos/EGBC 2.jpg" alt="Students from the Genetics and Biotech Club at the Broad Institute" />
<section className={"section"}>
<div className={"shell reading"}>
<div>
<h2>{"Why we started EBS"}</h2>
<p>{"Across the nation, talented high school and middle school students with a passion for biology   face a frustrating catch-22 when trying to enter research: the already-rare research opportunities often end up in the hands of those with prior research experience. In other words,  the very students who need a first opportunity are excluded from getting one.\n"}</p>
<p>{"We saw talented, curious peers who simply didn't know where to start — not because they lacked ability, but because no structured pathway existed for beginners. To remedy that, the Exeter Genetics and Biotech Club founded EBS:  a symposium specifically for beginner researchers, built around the accessible and rigorous world of dry-lab biology: computational analysis, bioinformatics, statistical modeling, and systematic literature reviews.\n"}</p>
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
<span><strong>{"Computational modeling"}</strong>{" — simulating biological systems or disease spread"}</span>
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
<p>{"All you need is a computer, an internet connection, and curiosity."}</p>
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
<h2>{"How the Symposium Works"}</h2>
<p>{"EBS is a one-day event combining research presentations and scientific discussion in a supportive, conference-style setting, held in-person and online."}</p>
</div>
<div className={"grid columns-2"}>
<div className={"steps"}>
<div className={"step"}>
<div className={"step__num"}>{"1"}</div>
<div className={"step__body"}>
<p className={"step__title"}>{"Research & Preparation (Fall 2026 – April 24th, 2027)"}</p>
<p>{"Students receive resources and structured guidance to develop their research question, conduct their study, and prepare their presentation."}</p>
</div>
</div>
<div className={"step"}>
<div className={"step__num"}>{"2"}</div>
<div className={"step__body"}>
<p className={"step__title"}>{"Abstract Submission (March 2027)"}</p>
<p>{"Participants submit a brief abstract summarizing their research question, methodology, and preliminary findings. All abstracts are reviewed before acceptance."}</p>
</div>
</div>
<div className={"step"}>
<div className={"step__num"}>{"3"}</div>
<div className={"step__body"}>
<p className={"step__title"}>{"Symposium Day (April 24th, 2027)"}</p>
<p>{"Students present their work through poster presentations, in-person or online. Judges evaluate presentations and provide constructive written feedback."}</p>
</div>
</div>
<div className={"step"}>
<div className={"step__num"}>{"4"}</div>
<div className={"step__body"}>
<p className={"step__title"}>{"Awards & Networking"}</p>
<p>{"The day concludes with an awards ceremony and open networking session, connecting students with researchers and industry professionals."}</p>
</div>
</div>
</div>
<div>
<h3>{"Presentation Formats"}</h3>
<div>
<div className={"text-block"}>
<h3>{"\n\n                Poster Presentation\n              "}</h3>
<p>{"Students display their research on a physical poster and discuss their work with judges, peers, and attendees during a dedicated poster session. This is the primary format for EBS 2027."}</p>
</div>
<div className={"text-block"}>
<h3>{"\n\n                Panel Discussion\n              "}</h3>
<p>{"A moderated discussion featuring invited researchers speaking about pathways into biological research — open to all attendees."}</p>
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
<p>{"Research should be open to everyone. We actively remove barriers — real and perceived — that prevent students from engaging with science."}</p>
</div>
<div className={"text-block"}>
<h3>{"Rigor"}</h3>
<p>{"We hold student work to real scientific standards while providing the support needed to meet them. Beginner-friendly does not mean less rigorous."}</p>
</div>
<div className={"text-block"}>
<h3>{"Community"}</h3>
<p>{"Science thrives through collaboration and discourse. EBS fosters a generous, collegial community where students learn as much from each other as from the researchers who take part."}</p>
</div>
</div>
</div>
</section>
<section className={"section"}>
<div className={"shell"}>
<div className={"next-step"}>
<h2>{"Take part on April 24th, 2027"}</h2>
<p>{"Whether you're ready to start your research journey or just curious to learn more, we'd love to hear from you."}</p>
<div className={"actions"}>
<a className={"button primary"} href={"register.html"}>{"Register Your Interest"}</a>
<a className={"button secondary"} href={"team.html"}>{"Meet the Team"}</a>
</div>
</div>
</div>
</section>
</div>; }
