import { RegistrationLink } from '../auth';

export default function PageContent() { return <div className="page-layout layout-judges">
  <section className="page-heading"><div className="shell">
    <h1>Judging at EBS</h1>
    <p className="lead">Give first-time student researchers thoughtful feedback on their biology posters, in person or online on April 25, 2027.</p>
    <p><a href="#judge-questions">Qualifications, commitment, and briefing</a></p>
  </div></section>
  <section className="section"><div className="shell">
    <div className="grid columns-2">
      <div>
        <h2>What judges do</h2>
        <p>Use the EBS rubric to assess students' methods, understanding, and scientific communication at a middle or high school level. Give written and verbal feedback, then submit your scoresheets by the end of the event.</p>
      </div>
      <div>
        <div className="text-block"><h3>Location</h3><p>Phillips Exeter Academy in Exeter, New Hampshire, or online. Campus venue and parking details will be shared with registered judges.</p></div>
        <div className="text-block"><h3>Recognition</h3><p>Judges are acknowledged in the symposium program and on this website.</p></div>
      </div>
    </div>
  </div></section>
  <section className="section" id="judge-questions" aria-labelledby="judge-questions-title"><div className="shell reading">
    <h2 id="judge-questions-title">Questions from judges</h2>
    <details className="disclosure" id="j1"><summary>Who can judge?</summary>
      <p>You should have at least an undergraduate degree in biology or a related STEM field. Graduate students, postdoctoral researchers, faculty, and industry professionals are welcome. You should be comfortable reviewing beginner research and giving constructive feedback.</p>
    </details>
    <details className="disclosure" id="j3"><summary>Can I judge online, and how much time is involved?</summary>
      <p>Yes. Judges can attend in person or online, for a full or half day based on availability. Expect to review 4–6 posters, about 15 minutes each. See the provisional <a href="schedule.html">Schedule</a> for event hours.</p>
    </details>
    <details className="disclosure" id="j2"><summary>What briefing will I receive?</summary>
      <p>A briefing packet includes the rubric, assigned project abstracts, schedule, venue information, and feedback guidance. A brief virtual orientation takes place in the week before the symposium.</p>
    </details>
  </div></section>
  <section className="section"><div className="shell"><div className="next-step">
    <h2>Register as a judge</h2>
    <p>Submit your interest form. The EBS team will confirm placement and send event details.</p>
    <div className="actions">
      <RegistrationLink className="button primary" href="https://docs.google.com/forms/d/e/1FAIpQLScEdi8TnCtiIfO9cD0fGQkLRkPcPeik3xHIPaZi87brvRiY2g/viewform?usp=dialog">Express judge interest</RegistrationLink>
      <a className="button secondary" href="contact.html">Contact EBS</a>
    </div>
  </div></div></section>
</div>; }
