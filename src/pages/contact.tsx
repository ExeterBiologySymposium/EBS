import { ContactForm } from '../page-controls';
export default function ContactPage() {
  return <div className="page-layout layout-contact">
    <section className="page-heading"><div className="shell"><p className="eyebrow">Get in touch</p><h1>Contact the EBS team</h1><p className="lead">Questions about account access, research, participation, or events? Send a message to the organizing team.</p></div></section>
    <section className="section"><div className="shell contact-page-grid"><div><h2>How can we help?</h2><p>If you are asking about account access, include the email address you use to sign in. Please do not include passwords or private research data.</p><p>You can also find answers on our <a href="faq.html">FAQ page</a>.</p></div><div className="contact-form-wrap"><ContactForm action="https://api.web3forms.com/submit" accessKey="2f40a3e9-3780-44bd-94c6-0762a55f64fb" /></div></div></section>
  </div>;
}
