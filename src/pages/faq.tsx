import { LearningLink } from '../auth';
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
<a className={"faq-nav__link"} href={"#registration"}>{"Registration & Access"}</a>
<a className={"faq-nav__link"} href={"#students"}>{"For Students"}</a>
<a className={"faq-nav__link"} href={"#research"}>{"Research & Projects"}</a>
<a className={"faq-nav__link"} href={"#symposium"}>{"Symposium Day"}</a>
<a className={"faq-nav__link"} href={"#international"}>{"International Students"}</a>
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
<p>{"EBS is a student-organized research symposium hosted by the Genetics and Biotechnology Club at Phillips Exeter Academy. It gives students with little or no prior research experience the opportunity to conduct, present, and discuss original dry-lab biological research alongside peers and judges. The inaugural event is planned for April 25th, 2027, with both in-person and online attendance options available the same day."}</p>
</div>
</details>
<details className={"disclosure"} role={"listitem"}>
<summary>{"What is \"dry-lab\" research?"}</summary>
<div id={"g2"}>
<p>{"Dry-lab research refers to research conducted without physical laboratory experiments or wet-lab techniques (pipettes, cell cultures, reagents, etc.). Instead, it uses computational analysis, publicly available datasets, literature synthesis, bioinformatics tools, and statistical modeling. Examples include genomics studies using publicly available sequence databases, meta-analyses of existing literature, disease modeling from epidemiological data, and computational protein structure prediction."}</p>
<p>{"Dry-lab research is ideal for high school and middle school students because it requires only a standard laptop rather than specialized lab equipment, and many powerful tools and datasets are freely accessible online."}</p>
</div>
</details>
<details className={"disclosure"} role={"listitem"}>
<summary>{"When and where is EBS 2027?"}</summary>
<div id={"g3"}>
<p>{"EBS 2027 will take place on April 25th, 2027, at Phillips Exeter Academy in Exeter, New Hampshire, with online participation available the same day."}</p>
</div>
</details>
<details className={"disclosure"} role={"listitem"}>
<summary>{"Who organizes EBS?"}</summary>
<div id={"g4"}>
<p>{"EBS is organized entirely by students in the Genetics and Biotechnology Club at Phillips Exeter Academy, with guidance from faculty advisors. The co-heads are "}<strong>{"Adrian Chan"}</strong>{", "}<strong>{"Jaiden Kim"}</strong>{", "}<strong>{"Reya Satam"}</strong>{", and "}<strong>{"Luke Wang"}</strong>{". Faculty oversight is provided by "}<strong>{"Summer Morrill"}</strong>{" (Biology Department, Phillips Exeter Academy). The organizing team supports research curriculum, outreach, logistics, and media. See the "}<a href={"team.html"}>{"Team page"}</a>{" for details."}</p>
</div>
</details>
<details className={"disclosure"} role={"listitem"}>
<summary>{"Is there a cost to participate?"}</summary>
<div id={"g5"}>
<p>{"No! EBS is completely free for all interested participants. EBS prints posters for all participants at no charge. Travel, lodging, and meals outside the symposium are the responsibility of participants, but those who cannot attend in person are welcome to present online."}</p>
</div>
</details>
</div>
</div>
<div className={"faq-section"} id={"registration"}>
<h2 className={"faq-section__title"}>{"Registration & Resource Access"}</h2>
<div className={"accordion"} role={"list"}>
<details className={"disclosure"} role={"listitem"}>
<summary>{"How do I register for EBS?"}</summary>
<div id={"registration-steps"}>
<ol>
<li>Open <a href="register.html">Register</a> and choose student registration, school registration, or judge recruitment.</li>
<li>Sign in or create an EBS account. You must be signed in to open an application.</li>
<li>On your chosen registration page, open the application. It opens in a new Google Forms tab.</li>
<li>Complete and submit the Google Form. Creating an EBS account or opening the form does not submit your application.</li>
</ol>
<p>Each student team member registers individually. You can submit your application while your account is Pending; Accepted access is required only for the resource library and coding lessons.</p>
</div>
</details>
<details className={"disclosure"} role={"listitem"}>
<summary>{"What happens after I submit the application?"}</summary>
<div id={"application-process"}>
<ol>
<li><strong>Submit the Google Form.</strong> Each student completes the form individually, including the in-person or online question (see below).</li>
<li><strong>Team review.</strong> The EBS organizing team reviews every application.</li>
<li><strong>Confirmation email.</strong> If your application is approved, we email you a confirmation.</li>
<li><strong>Access granted.</strong> Once approved, your account is set to Accepted and you gain access to the website's resources, coding lessons, and materials.</li>
</ol>
<p>Use the same email address on the form and for your EBS account so we can match them. If you have not heard back within a week or two, check your spam folder, then <a href="#contact">contact the EBS team</a>.</p>
</div>
</details>
<details className={"disclosure"} role={"listitem"}>
<summary>{"Where are the resources and coding lessons?"}</summary>
<div id={"finding-resources"}>
<p>Once your account is Accepted, sign in and look for <strong>Resources</strong> and <strong>Coding</strong> in the top navigation. On a smaller screen, open <strong>Menu</strong> to find them.</p>
<p><strong>Resources</strong> contains research guides, tools, databases, and presentation guidance. <strong>Coding</strong> contains the biology data-analysis curriculum and links to the Python and RStudio tracks, practice data, and exercises.</p>
<p>These links and pages are available only to Accepted accounts. If you cannot see them, visit <a href="register.html">Register</a> to check your account's access status.</p>
</div>
</details>
<details className={"disclosure"} role={"listitem"}>
<summary>{"Why is my account Pending after I sign in?"}</summary>
<div id={"pending-access"}>
<p>New signed-in accounts join Pending while the EBS team reviews access. Signing in or submitting a registration form does not automatically grant access to resources and coding lessons. The EBS team must approve your account as Accepted.</p>
<p>While Pending, you can still register and explore public symposium information. Opening a restricted lesson directly takes you to the registration page with your access status.</p>
</div>
</details>
<details className={"disclosure"} role={"listitem"}>
<summary>{"What should I do after my resource access is approved?"}</summary>
<div id={"approved-access"}>
<p>Sign in with the same account the EBS team approved. Return to <a href="register.html">Register</a> and select <strong>Check access again</strong>. When your status says <strong>Your account is accepted</strong>, use the Resources or Coding links there or in the navigation.</p>
<p>If your status is still Pending or the access check is unavailable, try again or <a href="#contact">contact the EBS team</a> for help.</p>
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
<p>{"No. EBS is specifically designed for students who have not done biological research before. The entire program — from our resource library to organizing team support — is built around helping new researchers. If you have never read a scientific paper or used a research database, that is exactly the starting point EBS is built for."}</p>
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
<p>{"Our resource library and organizing team are available to help you refine your question into something workable. See the "}<LearningLink href={"resources.html"}>{"Resources page"}</LearningLink>{" for guides on forming research questions and finding datasets."}</p>
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
<p>{"Projects go through three checkpoints:"}</p>
<ul>
<li><strong>{"Check 1, Friday, December 18, 2026: project idea and research plan."}</strong></li>
<li><strong>{"Check 2, Friday, March 12, 2027: abstract and code."}</strong>{" Submit your abstract plus the code or exported workflow. Every abstract is read in full, and every project's code is checked for completeness."}</li>
<li><strong>{"Check 3, Friday, April 9, 2027: final poster."}</strong>{" We check format, completeness, and that the numbers match the abstract and logs."}</li>
</ul>
<p>{"Accepted posters will be allowed to present at the symposia."}</p>
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
<p>{"Yes. EBS 2027 runs as a hybrid event — in-person at Phillips Exeter Academy and online, both on the same day. Students who can't travel to campus can present their poster and take part in judging through a livestreamed virtual track running alongside the in-person schedule."}</p>
</div>
</details>
<details className={"disclosure"} role={"listitem"}>
<summary>{"Who should attend in person?"}</summary>
<div id={"sy-inperson"}>
<p>{"On the application form you will be asked whether you plan to attend in person. Please only answer Yes if you either live within a two-hour drive of the school or would be willing to travel to Exeter and are able to cover all travel costs."}</p>
<p>{"Everyone else is encouraged to choose the online option, which offers the same poster presentation and judging experience. Choosing online has no effect on whether you are accepted."}</p>
</div>
</details>
<details className={"disclosure"} role={"listitem"}>
<summary>{"Do in-person presenters need a chaperone?"}</summary>
<div id={"sy-chaperone"}>
<p>{"Yes. Every in-person presenter must be accompanied by a chaperone, such as a parent, guardian, or teacher. The detailed chaperone policy is still being finalized. We will share the full requirements with registered participants and update this page as soon as it is set."}</p>
</div>
</details>
<details className={"disclosure"} role={"listitem"}>
<summary>{"Will posters be printed for participants?"}</summary>
<div id={"sy-print"}>
<p>{"Yes. EBS will print posters for participants at no cost. You submit your poster as a digital file by the deadline, and we handle printing for the in-person event. Poster size specifications and templates will be provided."}</p>
</div>
</details>
<details className={"disclosure"} role={"listitem"}>
<summary>{"What are the presentation formats?"}</summary>
<div id={"sy1"}>
<p>{"Students present in one format, and the day also includes a keynote:"}</p>
<ul>
<li><strong>{"Poster Presentation:"}</strong>{" A research poster displayed during one or both poster sessions. EBS prints posters for in-person presenters; online presenters share a digital copy. Students stand by their poster and explain their work to visiting judges and attendees (~15 min per judge visit). Students joining online present their poster over video during the same sessions."}</li>
<li><strong>{"Keynote Speaker:"}</strong>{" A distinguished keynote speaker opens the day by speaking on their research experience, followed by a moderated discussion with symposium participants. The keynote is open to all registered participants and is streamed to online attendees."}</li>
</ul>
</div>
</details>
<details className={"disclosure"} role={"listitem"}>
<summary>{"What should I bring to Symposium Day?"}</summary>
<div id={"sy2"}>
<p>{"You do not need to print your poster. EBS prints posters for all in-person presenters from the digital file you submit, and they will be set up at your session. In-person presenters should also bring their chaperone (see above). Students presenting online should also have a reliable camera and microphone for the live poster walkthrough. Wear professional or business casual attire — you are presenting original research to professionals. All other materials will be provided at check-in."}</p>
</div>
</details>
<details className={"disclosure"} role={"listitem"}>
<summary>{"Will there be food at the symposium?"}</summary>
<div id={"sy3"}>
<p>{"Yes. Lunch will be provided for all registered participants, judges, and event staff. Light refreshments will be available throughout the day. Please indicate any dietary restrictions when you register — we will do our best to accommodate them."}</p>
</div>
</details>
<details className={"disclosure"} role={"listitem"}>
<summary>{"Can I switch between in-person and online after applying?"}</summary>
<div id={"sy-switch"}>
<p>{"Probably, within limits. Email the EBS team as early as you can if your plans change. Moving from in person to online is generally easy. Moving from online to in person depends on remaining venue capacity and on having a chaperone arranged."}</p>
</div>
</details>
<details className={"disclosure"} role={"listitem"}>
<summary>{"Is housing or travel assistance available?"}</summary>
<div id={"sy-travel"}>
<p>{"EBS does not currently provide travel funding or lodging. Exeter, New Hampshire is about an hour from Boston, and we will share directions, parking, and a list of nearby hotels with registered in-person participants. If cost is a barrier, please present online."}</p>
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
<div className={"faq-section"} id={"international"}>
<h2 className={"faq-section__title"}>{"International Students"}</h2>
<div className={"accordion"} role={"list"}>
<details className={"disclosure"} role={"listitem"}>
<summary>{"Can international students participate?"}</summary>
<div id={"i1"}>
<p>{"Yes, with one limit for 2027: international students are currently eligible to apply solely for the online symposium. In-person attendance at Phillips Exeter Academy is not available to international applicants this year."}</p>
</div>
</details>
<details className={"disclosure"} role={"listitem"}>
<summary>{"What does the online experience include?"}</summary>
<div id={"i2"}>
<p>{"Online participants go through the same application and review process, get the same resources and coding lessons, present their poster over video during the live sessions, and receive judging. Posters are shared digitally."}</p>
</div>
</details>
<details className={"disclosure"} role={"listitem"}>
<summary>{"Do I need to present in English? What about time zones?"}</summary>
<div id={"i3"}>
<p>{"Presentations and judging are conducted in English. The symposium runs on Eastern Time on April 25th, 2027. We will publish the session schedule in advance so you can check the local time where you live, and we will do our best to place online presenters in sessions that are reasonable for their time zone."}</p>
</div>
</details>
<details className={"disclosure"} role={"listitem"}>
<summary>{"Will in-person attendance open to international students in the future?"}</summary>
<div id={"i4"}>
<p>{"We hope so. Visa and travel logistics are the main obstacle for a first-year, student-run event. Any change will be announced on this page and to registered participants."}</p>
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
