import { CodeBlock, ContactForm, RemoteSchedule, RemoteSessions } from '../page-controls';

export default function PageContent() { return <div className="page-layout layout-faq">
<section className={"page-heading"}>
<div className={"shell"}>
<p className="eyebrow">FAQ</p>
<h1>Questions about EBS?</h1>
<p className={"lead"}>{"Answers to common questions about EBS — who can participate, what the research looks like, how the process works, and how to get involved."}</p>
</div>
</section>
<section className={"section"}>
<div className={"shell"}>
<div className={"grid grid--layout-aside"}>
<div>
<nav aria-label={"Jump to FAQ section"}>
<div className={"faq-nav"}>
<a className={"faq-nav__link"} href={"#general"}>{"General"}</a>
<a className={"faq-nav__link"} href={"#students"}>{"For Students"}</a>
<a className={"faq-nav__link"} href={"#research"}>{"Research & Projects"}</a>
<a className={"faq-nav__link"} href={"#symposium"}>{"Symposium Day"}</a>
<a className={"faq-nav__link"} href={"#schools"}>{"Schools"}</a>
<a className={"faq-nav__link"} href={"#judges"}>{"Judges"}</a>
</div>
</nav>
<div className={"faq-section"} id={"general"}>
<h2 className={"faq-section__title"}>{"General"}</h2>
<div className={"accordion"} role={"list"}>
<details className={"disclosure"} role={"listitem"}>
<summary>{"What is the Exeter Biology Symposium?"}</summary>
<div id={"g1"}>
<p>{"EBS is a student-organized research symposium hosted by the Genetics and Biotech Club at Phillips Exeter Academy. It gives students with little or no prior research experience the opportunity to conduct, present, and discuss original dry-lab biological research alongside peers and judges. The inaugural event is planned for April 24th, 2027, with both in-person and online attendance options available the same day."}</p>
</div>
</details>
<details className={"disclosure"} role={"listitem"}>
<summary>{"What is \"dry-lab\" research?"}</summary>
<div id={"g2"}>
<p>{"Dry-lab research refers to research conducted without physical laboratory experiments or wet-lab techniques (pipettes, cell cultures, reagents, etc.). Instead, it uses computational analysis, publicly available datasets, literature synthesis, bioinformatics tools, and statistical modeling. Examples include genomics studies using publicly available sequence databases, meta-analyses of existing literature, disease modeling from epidemiological data, and computational protein structure prediction."}</p>
<p>{"Dry-lab research is ideal for high school and middle school students because it requires a standard laptop rather than specialized lab equipment, and many powerful tools and datasets are freely accessible online."}</p>
</div>
</details>
<details className={"disclosure"} role={"listitem"}>
<summary>{"When and where is EBS 2027?"}</summary>
<div id={"g3"}>
<p>{"EBS 2027 will take place on April 24th, 2027, at Phillips Exeter Academy in Exeter, New Hampshire, with online participation available the same day."}</p>
</div>
</details>
<details className={"disclosure"} role={"listitem"}>
<summary>{"Who organizes EBS?"}</summary>
<div id={"g4"}>
<p>{"EBS is organized entirely by students in the Genetics and Biotech Club at Phillips Exeter Academy, with guidance from faculty advisors. The co-heads are "}<strong>{"Adrian Chan"}</strong>{", "}<strong>{"Jaiden Kim"}</strong>{", "}<strong>{"Reya Satam"}</strong>{", and "}<strong>{"Luke Wang"}</strong>{". Faculty oversight is provided by "}<strong>{"Summer Morrill"}</strong>{" (Biology Department, Phillips Exeter Academy). The organizing committee also includes working groups covering research curriculum, outreach, logistics, media, and abstract review. See the "}<a href={"team.html"}>{"Team page"}</a>{" for details."}</p>
</div>
</details>
<details className={"disclosure"} role={"listitem"}>
<summary>{"Is there a cost to participate?"}</summary>
<div id={"g5"}>
<p>{"No! EBS is completely free for all interested participants. Transportation costs for the April 24th, 2027 symposium are the responsibility of participants, but those who cannot attend in-person are welcome to present online."}</p>
</div>
</details>
</div>
</div>
<div className={"faq-section"} id={"students"}>
<h2 className={"faq-section__title"}>{"For Students"}</h2>
<div className={"accordion"} role={"list"}>
<details className={"disclosure"} role={"listitem"}>
<summary>{"Do I need prior research experience to participate?"}</summary>
<div id={"s1"}>
<p>{"No. EBS is specifically designed for students who have not done biological research before. The entire program — from our resource library to organizing team support — is built around helping beginners. If you have never read a scientific paper or used a research database, that is exactly the starting point EBS is built for."}</p>
</div>
</details>
<details className={"disclosure"} role={"listitem"}>
<summary>{"Who is eligible to participate as a student?"}</summary>
<div id={"s2"}>
<p>{"EBS 2027 is open to all middle school and high school students"}</p>
</div>
</details>
<details className={"disclosure"} role={"listitem"}>
<summary>{"How much time does participation require?"}</summary>
<div id={"s3"}>
<p>{"Most students will spend 1-2 hours per week throughout the year. All lectures and research guides are completable asynchronously – each student or classroom can set their own pace. EBS is designed to fit around a full academic schedule."}</p>
</div>
</details>
<details className={"disclosure"} role={"listitem"}>
<summary>{"Can I work with a partner or team?"}</summary>
<div id={"s4"}>
<p>{"Yes. Solo projects, pairs, and teams of up to three students are all accepted. Each team member must contribute meaningfully to the research and be prepared to discuss any part of the project during the poster session. All team members register individually."}</p>
</div>
</details>
<details className={"disclosure"} role={"listitem"}>
<summary>{"Can I submit my EBS project to other competitions?"}</summary>
<div id={"s5"}>
<p>{"Yes. EBS does not restrict students from submitting their work to other science fairs, competitions, or academic journals. We actively encourage students to share their research broadly. EBS is a launchpad, not an exclusive commitment."}</p>
</div>
</details>
</div>
</div>
<div className={"faq-section"} id={"research"}>
<h2 className={"faq-section__title"}>{"Research & Projects"}</h2>
<div className={"accordion"} role={"list"}>
<details className={"disclosure"} role={"listitem"}>
<summary>{"What kinds of research projects are accepted?"}</summary>
<div id={"r1"}>
<p>{"Any original dry-lab biological research is eligible. This includes:"}</p>
<ul>
<li><strong>{"Literature synthesis / meta-analysis:"}</strong>{" Review and synthesize research on a biological question"}</li>
<li><strong>{"Bioinformatics:"}</strong>{" Analyze genomic, proteomic, or transcriptomic datasets using online tools"}</li>
<li><strong>{"Computational modeling:"}</strong>{" Build or apply models to simulate biological systems"}</li>
<li><strong>{"Epidemiological analysis:"}</strong>{" Analyze disease spread, risk factors, or public health data"}</li>
<li><strong>{"Ecological data analysis:"}</strong>{" Study population dynamics, biodiversity, or habitat data using existing datasets"}</li>
<li><strong>{"Product design with a biological application:"}</strong>{" Design a tool, device, or system that addresses a real biological or health problem — supported with research on the problem space, existing solutions, and your design rationale"}</li>
</ul>
<p>{"The subject must be biology-adjacent — we interpret this broadly. If your project engages with a living system, human health, an ecosystem, or the interface between biology and technology, it almost certainly qualifies. When in doubt, reach out and we'll tell you."}</p>
<p>{"Projects must use publicly available tools and data (no proprietary or gated resources that reviewers can't verify). Wet-lab experiments are not accepted at EBS."}</p>
</div>
</details>
<details className={"disclosure"} role={"listitem"}>
<summary>{"How do I choose a research topic?"}</summary>
<div id={"r2"}>
<p>{"Start with something you're genuinely curious about. Think about biology topics that came up in class, news stories that caught your attention, or questions you've always had. A good EBS research question is: specific (not \"what causes cancer\" but \"what genetic mutations are most common in pediatric glioblastoma\"), answerable with public data, and biological in nature."}</p>
<p>{"Our resource library and organizing team are available to help you refine your question into something workable. See the "}<a href={"resources.html"}>{"Resources page"}</a>{" for guides on forming research questions and finding datasets."}</p>
</div>
</details>
<details className={"disclosure"} role={"listitem"}>
<summary>{"What tools and software will I use?"}</summary>
<div id={"r3"}>
<p>{"All tools used in EBS research are free and browser-accessible. Common tools include: "}<strong>{"PubMed"}</strong>{" and "}<strong>{"Google Scholar"}</strong>{" for literature; "}<strong>{"NCBI"}</strong>{", "}<strong>{"UCSC Genome Browser"}</strong>{", and "}<strong>{"UniProt"}</strong>{" for biological databases; "}<strong>{"Galaxy"}</strong>{" and "}<strong>{"Google Colab"}</strong>{" for bioinformatics; "}<strong>{"R/RStudio"}</strong>{" for statistical analysis. No coding experience is required — EBS provides beginner guides for all tools in the resource library."}</p>
</div>
</details>
<details className={"disclosure"} role={"listitem"}>
<summary>{"How are projects submitted and reviewed?"}</summary>
<div id={"r4"}>
<p>{"Students submit a structured abstract in March 2027. Abstracts are reviewed by the EBS abstract review committee (composed of EBS organizing team members and volunteer reviewers). All students who submit a complete, original abstract in scope for EBS are expected to be accepted to present, though we may provide feedback for revision in borderline cases. Acceptance notifications go out before April 24th, 2027."}</p>
</div>
</details>
</div>
</div>
<div className={"faq-section"} id={"symposium"}>
<h2 className={"faq-section__title"}>{"Symposium Day"}</h2>
<div className={"accordion"} role={"list"}>
<details className={"disclosure"} role={"listitem"}>
<summary>{"Is there an online / virtual option?"}</summary>
<div id={"sy0"}>
<p>{"Yes. EBS 2027 runs as a hybrid event — in-person at Phillips Exeter Academy and online, both on the same day. Students who can't travel to campus can present their poster and take part in judging and Q&A through a livestreamed virtual track running alongside the in-person schedule."}</p>
</div>
</details>
<details className={"disclosure"} role={"listitem"}>
<summary>{"What are the presentation formats?"}</summary>
<div id={"sy1"}>
<p>{"EBS uses a single presentation format:"}</p>
<ul>
<li><strong>{"Poster Presentation:"}</strong>{" A printed or digital research poster displayed during one or both poster sessions. Students stand by their poster and explain their work to visiting judges and attendees (~15 min per judge visit). Students joining online present their poster over video during the same sessions."}</li>
</ul>
</div>
</details>
<details className={"disclosure"} role={"listitem"}>
<summary>{"What should I bring to Symposium Day?"}</summary>
<div id={"sy2"}>
<p>{"Poster presenters should bring their printed poster (size specifications will be provided). Oral presenters should bring a laptop with slides loaded (backup on USB recommended). Wear professional or business casual attire — you are presenting original research to professionals. All other materials will be provided at check-in."}</p>
</div>
</details>
<details className={"disclosure"} role={"listitem"}>
<summary>{"Will there be food at the symposium?"}</summary>
<div id={"sy3"}>
<p>{"Yes. Lunch will be provided for all registered participants, judges, and volunteers. Light refreshments will be available throughout the day. Please indicate any dietary restrictions when you register — we will do our best to accommodate them."}</p>
</div>
</details>
<details className={"disclosure"} role={"listitem"}>
<summary>{"Will families and guests be allowed to attend?"}</summary>
<div id={"sy4"}>
<p>{"We are planning for a limited in-person guest list given venue constraints. Details on guest attendance will be communicated to registered participants in early 2027. At minimum, we expect to allow one family member or support person per student presenter. Guests joining the online track are not subject to this limit."}</p>
</div>
</details>
</div>
</div>
<div className={"faq-section"} id={"schools"}>
<h2 className={"faq-section__title"}>{"For Schools"}</h2>
<div className={"accordion"} role={"list"}>
<details className={"disclosure"} role={"listitem"}>
<summary>{"Can students from schools other than Exeter participate?"}</summary>
<div id={"sc1"}>
<p>{"Yes. EBS 2027 is open to students from any school nationwide. In-person attendance is centered at Phillips Exeter Academy, but the online track lets students from other schools take part fully — presenting, getting judged, and attending talks — without traveling to campus."}</p>
</div>
</details>
<details className={"disclosure"} role={"listitem"}>
<summary>{"What is the role of a faculty advisor?"}</summary>
<div id={"sc2"}>
<p>{"Faculty advisors provide light oversight and institutional support — checking in on student progress, helping with any scheduling conflicts, and being a point of contact for the EBS organizing team. Faculty advisors are not expected to provide academic research supervision — students draw on the EBS resource library and organizing team for that. This role typically requires under 1 hour per month."}</p>
</div>
</details>
</div>
</div>
<div className={"faq-section"} id={"judges"}>
<h2 className={"faq-section__title"}>{"For Judges"}</h2>
<div className={"accordion"} role={"list"}>
<details className={"disclosure"} role={"listitem"}>
<summary>{"What qualifications do judges need?"}</summary>
<div id={"j1"}>
<p>{"Judges should have at minimum an undergraduate degree in a biological science or related STEM field. Graduate students, postdoctoral researchers, faculty members, and industry professionals are all welcome. Judges should be comfortable evaluating research methodology and scientific communication at a high school and middle school level."}</p>
</div>
</details>
<details className={"disclosure"} role={"listitem"}>
<summary>{"How are judges briefed before the symposium?"}</summary>
<div id={"j2"}>
<p>{"All judges receive a briefing packet before Symposium Day including: the judging rubric, abstract summaries of the projects they're assigned to evaluate, a venue map and schedule, and guidelines for providing constructive feedback to first-time student researchers. A brief virtual orientation is held the week before the event."}</p>
</div>
</details>
<details className={"disclosure"} role={"listitem"}>
<summary>{"Can I judge remotely?"}</summary>
<div id={"j3"}>
<p>{"Yes. EBS 2027 is a hybrid event, so judges can evaluate in-person poster sessions on campus or join the online track to judge virtual presentations, both running the same day."}</p>
</div>
</details>
</div>
</div>
</div>

</div>
</div>
</section>
<section className={"section"} id={"contact"}>
<div className={"shell"}>
<div className={"section-header"}>
<h2>{"Contact Us"}</h2>
<p>{"Can't find the answer you're looking for? Send us a message and the EBS organizing team will get back to you."}</p>
</div>
<div className={"reading"}>
<div className={"contact-form-wrap"}>
<ContactForm action={"https://api.web3forms.com/submit"} accessKey={"2f40a3e9-3780-44bd-94c6-0762a55f64fb"} />

</div>
</div>
</div>
</section>
</div>; }
