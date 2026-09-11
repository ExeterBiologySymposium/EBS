import { CodeBlock, ContactForm, RemoteSchedule, RemoteSessions } from '../page-controls';

export default function PageContent() { return <div className="page-layout layout-schools">
<div className={"shell"}>
<section className={"page-heading"}>
<h1>{"100% Free."}<br />{"Open to your students."}</h1>
<p className={"lead"}>{"EBS welcomes all middle and high school students. No prior research programme or lab facilities required."}</p>
<div className={"actions"}><a className={"button"} href={"https://forms.gle/wXrjJJb6XEtWvqEu8"} rel={"noopener noreferrer"} target={"_blank"}>{"Register your school"}</a></div><p className={"external-form-note"}>{"Application opens in a new tab. Completion happens in Google Forms."}</p>
<p className={"small"}><a href={"https://forms.gle/vgtVrsBm1UbBhwtv9"} rel={"noopener noreferrer"} target={"_blank"}>{"Not a teacher or administrator? Register individually"}</a></p>
</section>
<figure className="context-media context-media--schools"><img src="/images/Genetics Club Photos/EGBC Yearbook Photo.jpg" alt="Students from the Genetics and Biotech Club together at school" loading="lazy" /></figure>
<div className={"school-layout"}>
<section className={"reading"}>
<h2>{"Research that fits your school"}</h2><p>{"Students can investigate biology through computational or literature-based projects. A standard laptop and an internet connection are enough to get started."}</p><p>{"Research guides and lectures can be completed asynchronously, so each student or classroom can set their own pace. Students practise literature reading, data analysis, scientific writing, and oral communication, and receive feedback from biologists, graduate students, and industry professionals."}</p>
<h2>{"Who can participate"}</h2><ul className={"plain-list"}><li>{"All middle and high school students, with no prior research experience required."}</li><li>{"Individual projects or teams of up to three students."}</li><li>{"All areas of biology, including genetics, ecology, neuroscience, and epidemiology."}</li><li>{"Original research that is dry-lab in nature."}</li></ul>
<h2>{"What students receive"}</h2><p>{"Students gain experience presenting a biological study and discussing it with reviewers. Participants receive a certificate of participation; top presenters receive awards recognized by the Phillips Exeter Academy Genetics and Biotech Club."}</p>
</section>
<aside aria-labelledby={"practical-title"} className={"school-practical"}><h2 id={"practical-title"}>{"Practical details"}</h2><dl>
<div><dt>{"Cost"}</dt><dd>{"Participation is free. Participants cover their own travel costs; online presentation is available."}</dd></div>
<div><dt>{"Time"}</dt><dd>{"Most students spend 1–2 hours per week throughout the year, at their own pace."}</dd></div>
<div><dt>{"Supervision"}</dt><dd>{"A teacher supervisor is not required. EBS guides students from learning dry-lab skills to writing abstracts."}</dd></div>
<div><dt>{"Timing"}</dt><dd>{"April 24th, 2027."}</dd></div>
</dl></aside>
</div>
<section className={"content-section"}>
<h2>{"What to expect"}</h2><p className={"reading"}>{"School interest registration is open. Submit the form to receive resources, timelines, and faculty advisor information. The timeline below is provisional."}</p>
<dl className={"schedule-list"}>
<div><dt>{"Fall 2026"}</dt><dd><strong>{"Student registration"}</strong><p>{"Individual students register and receive access to the EBS resource library."}</p></dd></div>
<div><dt>{"Fall–winter 2026–27"}</dt><dd><strong>{"Research period"}</strong><p>{"Students work on projects with support from the organizing team and resource library."}</p></dd></div>
<div><dt>{"March–April 2027"}</dt><dd><strong>{"Abstract review"}</strong><p>{"Students submit abstracts in March; acceptance notifications follow in April."}</p></dd></div>
<div><dt>{"April 24th, 2027"}</dt><dd><strong>{"Symposium day"}</strong><p>{"Students present at Phillips Exeter Academy or online; registered schools receive logistics details."}</p></dd></div>
</dl>
</section>
<section className={"school-questions reading"}>
<h2>{"Questions from schools"}</h2>
<details id={"s-faq-1"}><summary>{"How much time does a student need to commit?"}</summary><p>{"Most students spend 1–2 hours per week throughout the year. Lectures and research guides are asynchronous, so each student or classroom can set their own pace around a full academic schedule."}</p></details>
<details id={"s-faq-2"}><summary>{"Do students need a teacher supervisor?"}</summary><p>{"No. EBS guides students throughout the process, from learning dry-lab skills to writing scientific abstracts."}</p></details>
<details id={"s-faq-3"}><summary>{"Is there a cost to participate?"}</summary><p>{"EBS is free for all interested participants. Participants cover transportation costs for attending in person; students who cannot travel may present online."}</p></details>
<details id={"s-faq-4"}><summary>{"Can students work in teams?"}</summary><p>{"Yes. Projects may have up to three students. Each team member must contribute meaningfully, be able to discuss any part of the project during the poster session, and register individually."}</p></details>
<details id={"s-faq-5"}><summary>{"Can students submit the same research elsewhere?"}</summary><p>{"Yes. EBS does not restrict submissions to other science fairs or competitions. Students are encouraged to share their research broadly."}</p></details>
<p><a href={"faq.html"}>{"More questions and contact information"}</a></p>
</section>
</div>
</div>; }
