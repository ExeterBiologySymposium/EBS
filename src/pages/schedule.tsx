import { CodeBlock, ContactForm, RemoteSchedule, RemoteSessions } from '../page-controls';

export default function PageContent() { return <div className="page-layout layout-schedule">
<section className={"page-heading"}>
<div className={"shell"}>
<h1>{"Symposium schedule"}</h1>
<p className={"lead"}>{"April 24th, 2027 · Phillips Exeter Academy and online. All times below are Eastern Time; sessions and locations are provisional."}</p>
</div>
</section>
<section className={"section"}>
<div className={"shell reading"}>
<div>
<div aria-label={"Scrollable symposium schedule"} className={"table-wrap"} role={"region"} tabIndex={0}>
<table aria-label={"Symposium day schedule with times, events, and locations"} className={"sched-table"}>
<thead>
<tr>
<th scope={"col"}>{"Time (Eastern Time)"}</th>
<th scope={"col"}>{"Event"}</th>
<th scope={"col"}>{"Location"}</th>
</tr>
</thead>
<RemoteSchedule><tbody id={"schedule-body"}>
<tr>
<td>{"8:00 – 9:00 AM"}</td>
<td>{"Registration"}</td>
<td>{"Phelps Lobby"}</td>
</tr>
<tr>
<td>{"9:00 – 9:30 AM"}</td>
<td>{"Opening Ceremony"}</td>
<td>{"Forum"}</td>
</tr>
<tr>
<td>{"9:30 – 11:30 AM"}</td>
<td>{"Morning Poster Session"}</td>
<td>{"Grainger"}</td>
</tr>
<tr>
<td>{"11:30 AM – 12:30 PM"}</td>
<td>{"Lunch"}</td>
<td>{"New Dining Hall"}</td>
</tr>
<tr>
<td>{"12:30 – 2:00 PM"}</td>
<td>{"Afternoon Poster Session"}</td>
<td>{"Grainger"}</td>
</tr>
<tr>
<td>{"2:00 – 2:30 PM"}</td>
<td>{"Cleanup / Judging Deliberation"}</td>
<td>{"Grainger"}</td>
</tr>
<tr>
<td>{"2:30 – 3:00 PM"}</td>
<td>{"Closing Ceremony"}</td>
<td>{"Forum"}</td>
</tr>
</tbody></RemoteSchedule>
</table>
</div>
<p className={"form-hint"}>{"Schedule is provisional and may shift slightly as final logistics are confirmed. Registered participants will receive the finalized schedule by email."}</p>
</div>
</div>
</section>
<section className={"section"}>
<div className={"shell"}>
<RemoteSessions><div className={"grid columns-4"} id={"session-info-grid"}>
<div className={"session-item"}>
<h3>{"Venue"}</h3>
<p>{"Phillips Exeter Academy — Phelps Lobby, Forum, Grainger, and the New Dining Hall."}</p>
</div>
<div className={"session-item"}>
<h3>{"Online Option"}</h3>
<p>{"Can't make it to campus? Join the livestreamed virtual track running alongside the in-person schedule throughout the day."}</p>
</div>
<div className={"session-item"}>
<h3>{"Who Should Attend"}</h3>
<p>{"Presenting students, judges, volunteers, guest speakers, and visiting school groups are all welcome, in-person or online."}</p>
</div>
</div></RemoteSessions>
</div>
</section>
<section className={"section"}>
<div className={"shell"}>
<div className={"next-step"}>
<h2>{"Register for updates"}</h2>
<p>{"Whether you're presenting, judging, or visiting with your school, register your interest to receive schedule updates."}</p>
<div className={"actions"}>
<a className={"button primary"} href={"register.html"}>{"Register Your Interest"}</a>
<a className={"button secondary"} href={"faq.html"}>{"Read the FAQ"}</a>
</div>
</div>
</div>
</section>
</div>; }
