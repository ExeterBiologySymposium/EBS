import { ContactForm } from '../page-controls';

export default function PageContent() { return <div className="page-layout layout-faq">
  <section className="page-heading"><div className="shell">
    <p className="eyebrow">FAQ</p>
    <h1>Questions about EBS?</h1>
    <p className="lead">Start here for the basics, then find help for your next step.</p>
    <p><a href="account.html">Account help</a> · <a href="schools.html#school-questions">For schools</a> · <a href="judges.html#judge-questions">For judges</a></p>
  </div></section>
  <section className="section"><div className="shell">
    <nav className="faq-nav" aria-label="Jump to FAQ section">
      <a className="faq-nav__link" href="#general">About EBS</a>
      <a className="faq-nav__link" href="#students">Taking part</a>
      <a className="faq-nav__link" href="#registration">Getting started</a>
    </nav>
    <section className="faq-section" id="general" aria-labelledby="general-title">
      <h2 className="faq-section__title" id="general-title">About EBS</h2>
      <div className="accordion">
        <details className="disclosure" id="g1"><summary>What is EBS, and when is it?</summary>
          <p id="g3"><a id="g4" href="team.html">EBS</a> has two parts: a <a href="researchers.html">year-long dry-lab biology research program</a> for students of all levels, followed by poster presentations at Phillips Exeter Academy in Exeter, New Hampshire, or online on April 25, 2027. The full-day event includes a keynote and two poster sessions. See the <a href="schedule.html">Schedule</a>.</p>
        </details>
        <details className="disclosure" id="s2"><summary>Who can take part?</summary>
          <p id="s1">All middle and high school students from any school are welcome, with no prior research experience required. International students may participate online only in 2027.</p>
        </details>
        <details className="disclosure" id="g5"><summary>What does it cost?</summary>
          <p id="sy-travel">Participation and in-person poster printing are free. Participants cover travel, lodging, and meals outside the event. EBS does not provide travel funding or housing; online presentation is available if you cannot travel.</p>
        </details>
        <details className="disclosure" id="research"><summary>What research can I present?</summary>
          <p id="r1"><span id="g2">Original dry-lab biology research uses public data, published studies, or computational methods instead of physical lab experiments.</span> Biology-related product design supported by research also qualifies. Wet-lab experiments are not accepted, and reviewers must be able to verify your methods and evidence. See <a href="researchers.html">project examples</a>.</p>
        </details>
      </div>
    </section>
    <section className="faq-section" id="students" aria-labelledby="students-title">
      <h2 className="faq-section__title" id="students-title">Taking part</h2>
      <div className="accordion">
        <details className="disclosure" id="s3"><summary>How much time will I need?</summary>
          <p>Most students spend 1–2 hours per week throughout the year. Work through the research document and its exercises at your own pace, with email support, regular office hours, and progress check-ins from the EBS team.</p>
        </details>
        <details className="disclosure" id="s4"><summary>Can I work in a team?</summary>
          <p>Yes. Work alone or in a team of up to three students. Each member registers individually, contributes meaningfully, and should be able to explain any part of the project.</p>
        </details>
        <details className="disclosure" id="international"><summary>Can I present online?</summary>
          <p id="i1"><span id="sy0">Yes, including poster presentation and judging. International students may attend online only in 2027.</span> Presentations are in English, and the <a id="i3" href="schedule.html">schedule</a> uses Eastern Time. Choosing online does not affect acceptance.</p>
        </details>
        <details className="disclosure" id="symposium"><summary>What do I need to attend in person?</summary>
          <p id="sy-chaperone">You must be able to travel to Exeter, cover your travel costs, and attend with an adult chaperone. Your school decides whether a parent, guardian, or teacher can chaperone; it remains responsible for student supervision and liability for incidents involving its group. International participants attend online only in 2027.</p>
        </details>
        <details className="disclosure" id="s5"><summary>Can I submit my project elsewhere?</summary>
          <p>Yes. You can also submit your EBS research to other science fairs, competitions, and academic journals.</p>
        </details>
      </div>
    </section>
    <section className="faq-section" id="registration" aria-labelledby="registration-title">
      <h2 className="faq-section__title" id="registration-title">Getting started</h2>
      <div className="accordion">
        <details className="disclosure" id="registration-steps"><summary>How do I sign up?</summary>
          <p>Sign in or create an account, then open <a href="student-signup.html">Student registration</a> and submit the Google Form using your account email. Every researcher applies individually. Creating an account or opening the form does not submit your application.</p>
        </details>
        <details className="disclosure" id="application-process"><summary>What happens after I apply?</summary>
          <p>The EBS team reviews your application and emails you if approved. Check your status on your <a href="account.html">Account page</a>. Accepted accounts can create a research folder and access Events and available member resources; account help explains the next steps.</p>
        </details>
        <details className="disclosure" id="orientation-meetings"><summary>What is the orientation meeting?</summary>
          <p>A 20-minute Zoom introduction to EBS, getting started with research, and where to find support. You can ask questions, too. An EBS team member arranges the meeting by email; <a href="mailto:exeterbiologysymposium@gmail.com">email EBS</a> to coordinate.</p>
        </details>
      </div>
    </section>
    <div className="reading">
      <p id="schools"><span id="school-registration">School signup, school contact roles, and faculty-advisor contact: <a id="faculty-advisor-contact" href="schools.html#school-questions">Questions from schools</a>.</span></p>
      <p id="judges">Qualifications, time commitment, and briefing: <a href="judges.html#judge-questions">Questions from judges</a>.</p>
      <p id="pending-access"><span id="approved-access">Application status, resources, and folder help: <a id="research-folder" href="account.html">Your Account page</a>.</span></p>
    </div>
  </div></section>
  <section className="section" id="contact"><div className="shell">
    <div className="section-header"><h2>Still have a question?</h2><p>Send a message below or visit our <a href="contact.html">Contact page</a>.</p></div>
    <div className="reading"><div className="contact-form-wrap">
      <ContactForm action="https://api.web3forms.com/submit" accessKey="2f40a3e9-3780-44bd-94c6-0762a55f64fb" />
    </div></div>
  </div></section>
</div>; }
