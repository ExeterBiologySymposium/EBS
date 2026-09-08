import { CodeBlock, ContactForm, RemoteSchedule, RemoteSessions } from '../page-controls';

export default function PageContent() { return <div className="page-layout layout-register">
<div className={"shell"}>
<section className={"page-heading"}><h1>{"Register for EBS"}</h1><p className={"lead"}>{"Choose one route. Each application opens in Google Forms."}</p><p>{"April 24th, 2027. In-person and online participation are planned."}</p></section>
<div className={"registration-options registration-routes"}>
<section><p className={"route-kicker"}>{"01"}</p><h2>{"Students"}</h2><p>{"For middle and high school students presenting original dry-lab biological research."}</p><div className={"actions"}><a className={"button"} href={"student-signup.html"}>{"Student registration"}</a></div></section>
<section><p className={"route-kicker"}>{"02"}</p><h2>{"Schools and educators"}</h2><p>{"For educators, counselors, and administrators sharing EBS with students or registering school interest."}</p><div className={"actions"}><a className={"button"} href={"schools.html"}>{"School registration"}</a></div></section>
<section><p className={"route-kicker"}>{"03"}</p><h2>{"Volunteers and judges"}</h2><p>{"For researchers and professionals supporting student presenters as speakers, reviewers, or judges."}</p><div className={"actions"}><a className={"button"} href={"volunteer-signup.html"}>{"Volunteer or judge registration"}</a></div></section>
</div>
<section className={"content-section reading"} id={"form"}><h2>{"Help choosing an application"}</h2><p>{"The signup pages link to the application forms. If you are unsure which fits, "}<a href={"faq.html#contact"}>{"contact the EBS team"}</a>{" or email "}<a href={"mailto:exeterbiologysymposium@gmail.com"}>{"exeterbiologysymposium@gmail.com"}</a>{"."}</p><p><a href={"faq.html"}>{"Read participation, eligibility, and timeline FAQs"}</a></p></section>
</div>
</div>; }
