import { CodeBlock, ContactForm, RemoteSchedule, RemoteSessions } from '../page-controls';

export default function PageContent() { return <div className="page-layout layout-volunteer-signup">
<div className={"shell"}>
<section className={"page-heading"}><a className={"back-link"} href={"register.html"}>{"Registration options"}</a><h1>{"Volunteer and judge signup"}</h1><p className={"lead"}>{"Share your research experience with middle and high school students."}</p><p>{"Applications are open for graduate students, postdocs, working biologists, and other professionals. Speaking and judging are available in person or online on April 24th, 2027."}</p></section>
<div className={"registration-options"}>
<section><h2>{"Speakers and resource reviewers"}</h2><p>{"Contribute a guest talk or help create and review beginner-friendly research guides, resource lists, and curriculum materials."}</p><ul><li>{"Talk about your research or career in biology."}</li><li>{"Review learning materials at your own pace."}</li><li>{"Join in person or online."}</li></ul><div className={"actions"}><a className={"button"} href={"https://forms.gle/Z2qizT1xiPdGeRNp9"} rel={"noopener noreferrer"} target={"_blank"}>{"Apply to volunteer"}</a></div><p className={"external-form-note"}>{"Application opens in a new tab. Completion happens in Google Forms."}</p></section>
<section><h2>{"Judges"}</h2><p>{"Evaluate student presentations using the EBS rubric, calibrated for first-time researchers."}</p><ul><li>{"Evaluate 4–6 poster presentations."}</li><li>{"Provide written and verbal feedback."}</li><li>{"Attend symposium-day events."}</li></ul><div className={"actions"}><a className={"button"} href={"https://docs.google.com/forms/d/e/1FAIpQLScEdi8TnCtiIfO9cD0fGQkLRkPcPeik3xHIPaZi87brvRiY2g/viewform?usp=dialog"} rel={"noopener noreferrer"} target={"_blank"}>{"Apply to judge"}</a></div><p className={"external-form-note"}>{"Application opens in a new tab. Completion happens in Google Forms."}</p></section>
</div>
<section className={"content-section"} id={"volunteer-roles"}><h2>{"Roles and time commitments"}</h2>
<dl className={"schedule-list"}>
<div><dt>{"Guest speaker"}</dt><dd><p>{"Deliver a 20–30 minute talk about your research area or career path in biology on symposium day. This is a one-day commitment, in person or online."}</p></dd></div>
<div><dt>{"Resource contributor"}</dt><dd><p>{"Create or review beginner-friendly guides, resource lists, and curriculum materials. Work is flexible and asynchronous."}</p></dd></div>
<div><dt>{"Judge"}</dt><dd><p>{"A one-day commitment, with full- or half-day attendance based on availability. Symposium-day hours are provisional; see the "}<a href={"schedule.html"}>{"current schedule"}</a>{". Judges may attend in person or online."}</p></dd></div>
</dl>
<div className={"reading"}><h3>{"Who can judge"}</h3><p>{"Judges should have at least an undergraduate degree in biological science or a related field. Graduate students, faculty, postdocs, and industry professionals are welcome. Experience evaluating research at middle and high school level is helpful."}</p><p><a href={"judges.html"}>{"Judging criteria and participation details"}</a></p></div>
</section>
<section className={"content-section reading"} id={"form"}><h2>{"Help choosing a role"}</h2><p>{"For questions about speaking, reviewing, or judging, "}<a href={"faq.html#contact"}>{"contact the EBS team"}</a>{" or email "}<a href={"mailto:exeterbiologysymposium@gmail.com"}>{"exeterbiologysymposium@gmail.com"}</a>{"."}</p><p><a href={"faq.html"}>{"Read the symposium FAQs"}</a></p></section>
</div>
</div>; }
