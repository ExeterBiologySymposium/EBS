import { RegistrationLink } from '../auth';

export default function PageContent() { return <div className="page-layout layout-schools">
<div className={"shell"}>
<section className={"page-heading"}>
<h1>{"100% Free."}<br />{"Open to your students."}</h1>
<p className={"lead"}>{"EBS welcomes all middle and high school students. No prior research programme or lab facilities required."}</p>
<div className={"actions"}><RegistrationLink className={"button"} href={"https://forms.gle/wXrjJJb6XEtWvqEu8"}>{"Register your school"}</RegistrationLink></div><p className={"external-form-note"}>{"For schools that would like to sign up. Sign in, then complete the form in Google Forms."}</p>
<p>Already contacted by EBS? You only need a school contact person and <a href="student-signup.html">individual student registrations</a>. See <a href="#school-questions">Questions from schools</a> below.</p>
<p className={"small"}><a href={"student-signup.html"}>{"Not a teacher or administrator? Register individually"}</a></p>
</section>
<figure className="context-media context-media--schools"><img src="/images/Genetics Club Photos/EGBC Yearbook Photo.jpg" alt="Students from the Genetics and Biotechnology Club together at school" loading="lazy" /></figure>
<div className={"school-layout"}>
<section className={"reading"}>
<h2>{"Research that fits your school"}</h2><p>{"Students can investigate biology through computational or literature-based projects. A standard laptop and an internet connection are enough to get started."}</p><p>{"The year-long research program uses a document written by experienced high school researchers, with exercises for different ability levels. Students work asynchronously in a shared Google folder, with regular progress check-ins, ongoing email support, and office hours. Their projects culminate in poster presentations at Exeter or virtually on April 25, 2027."}</p>
<h2>{"Who can participate"}</h2><ul className={"plain-list"}><li>{"All middle and high school students, with no prior research experience required."}</li><li>{"Individual projects or teams of up to three students."}</li><li>{"All areas of biology, including genetics, ecology, neuroscience, and epidemiology."}</li><li>{"Original research that is dry-lab in nature."}</li></ul>
<h2>{"What students receive"}</h2><p>{"Students gain experience presenting a biological study and discussing it with reviewers. Participants receive a certificate of participation; top presenters receive awards recognized by the Phillips Exeter Academy Genetics and Biotechnology Club."}</p>
</section>
<aside aria-labelledby={"practical-title"} className={"school-practical"}><h2 id={"practical-title"}>{"Practical details"}</h2><dl>
<div><dt>{"Cost"}</dt><dd>{"Participation is free. Participants cover their own travel costs; online presentation is available."}</dd></div>
<div><dt>{"Time"}</dt><dd>{"Most students spend 1–2 hours per week throughout the year, at their own pace."}</dd></div>
<div><dt>{"Supervision"}</dt><dd>{"A teacher supervisor is not required. EBS guides students from learning dry-lab skills to writing abstracts."}</dd></div>
<div><dt>{"Timing"}</dt><dd>{"April 25th, 2027."}</dd></div>
</dl></aside>
</div>
<section className={"content-section"}>
<h2>{"What to expect"}</h2><p className={"reading"}>{"Each student registers individually, then receives member access after account approval. The timeline below is provisional."}</p>
<dl className={"schedule-list"}>
<div><dt>{"Fall 2026"}</dt><dd><strong>{"Student registration"}</strong><p>{"Individual students register and receive access to the EBS resource library."}</p></dd></div>
<div><dt>{"Fall–winter 2026–27"}</dt><dd><strong>{"Research period"}</strong><p>{"Students work through the research document with regular progress check-ins, email support, and office hours."}</p></dd></div>
<div><dt>{"December 18, 2026"}</dt><dd><strong>{"Check 1: idea and research plan"}</strong><p>{"Students submit their project idea and research plan. All four co-heads review it and provide detailed written feedback."}</p></dd></div>
<div><dt>{"March 12, 2027"}</dt><dd><strong>{"Check 2: abstract and code"}</strong><p>{"Students submit their research abstract and all code or exported workflows. All four co-heads review the submission and provide detailed written feedback."}</p></dd></div>
<div><dt>{"April 9, 2027"}</dt><dd><strong>{"Check 3: first poster draft"}</strong><p>{"All four co-heads review the first poster draft and provide detailed comments to help students refine it before presentation."}</p></dd></div>
<div><dt>{"April 25th, 2027"}</dt><dd><strong>{"Symposium day"}</strong><p>{"Students present at Phillips Exeter Academy or online during a full-day event with a keynote and two poster sessions. Registered schools receive logistics details."}</p></dd></div>
</dl>
<p><a href="researchers.html">Project requirements and review process</a></p>
</section>
<section className="school-questions reading" id="school-questions" aria-labelledby="school-questions-title">
<h2 id="school-questions-title">Questions from schools</h2>
<details className="disclosure" id="s-faq-registration"><summary>Does our school need to fill out the school form?</summary>
<p>Use the form if your school would like to sign up. If EBS has already contacted your school, skip it and email a contact person's name and email to <a href="mailto:exeterbiologysymposium@gmail.com">EBS</a>. Every student researcher must still <a href="student-signup.html">register individually</a>.</p>
</details>
<details className="disclosure" id="s-faq-2"><summary>What does our school contact person need to do?</summary>
<p>Share EBS information with interested students and coordinate communication with the organizing team. A faculty advisor or another school representative can be the contact. Students do not need a teacher research supervisor; EBS provides research support.</p>
</details>
<details className="disclosure" id="s-faq-1"><summary>How much time do students need?</summary>
<p>Most spend 1–2 hours per week, at their own pace. They can work individually or in teams of up to three, with each member applying separately.</p>
</details>
<details className="disclosure" id="s-faq-orientation"><summary>How do we arrange orientation?</summary>
<p>An EBS team member arranges a 20-minute Zoom meeting by email to introduce the program and answer questions. Your school contact person can <a href="mailto:exeterbiologysymposium@gmail.com">email EBS</a> to coordinate.</p>
</details>
<details className="disclosure" id="s-faq-advisor"><summary>How do we contact the EBS faculty advisor?</summary>
<p>Email <a href="mailto:exeterbiologysymposium@gmail.com">exeterbiologysymposium@gmail.com</a> and say your message is for the faculty advisor. The EBS team coordinates advisor contact through this address.</p>
</details>
<p>For <a id="s-faq-3" href="faq.html#g5">costs</a>, <a id="s-faq-4" href="faq.html#s4">teams</a>, <a id="s-faq-5" href="faq.html#s5">submitting elsewhere</a>, and attendance requirements, see the <a href="faq.html">main FAQ</a>.</p>
</section>
</div>
</div>; }
