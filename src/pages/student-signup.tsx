import { CodeBlock, ContactForm, RemoteSchedule, RemoteSessions } from '../page-controls';

export default function PageContent() { return <div className="page-layout layout-student-signup">
<div className={"shell"}>
<section className={"page-heading"}><a className={"back-link"} href={"register.html"}>{"Registration options"}</a><h1>{"Student registration"}</h1><p className={"lead"}>{"Present original dry-lab biological research. Participation is 100% free."}</p><p>{"Open to all middle and high school students. Attend at Phillips Exeter Academy or online on April 24th, 2027."}</p></section>
<section className={"registration-focus"}><h2>{"Before you apply"}</h2><ul><li>{"No prior research experience required."}</li><li>{"Present a research poster in person or online."}</li><li>{"Projects may be individual or teams of up to three students."}</li></ul><div className={"actions"}><a className={"button"} href={"https://forms.gle/vgtVrsBm1UbBhwtv9"} rel={"noopener noreferrer"} target={"_blank"}>{"Open student application"}</a></div><p className={"external-form-note"}>{"Application opens in a new tab. Completion happens in Google Forms."}</p><p className={"small"}>{"Registering for a school? "}<a href={"schools.html"}>{"Use school registration"}</a>{"."}</p></section>
<section className={"content-section reading"} id={"form"}><h2>{"Help with registration"}</h2><p>{"Use the student or school application above. For questions, "}<a href={"faq.html#contact"}>{"contact the EBS team"}</a>{" or email "}<a href={"mailto:exeterbiologysymposium@gmail.com"}>{"exeterbiologysymposium@gmail.com"}</a>{"."}</p><p><a href={"faq.html"}>{"Read participation and eligibility FAQs"}</a></p></section>
</div>
</div>; }
