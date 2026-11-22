import { usePageCopy, safeCopyUrl } from '../content/page-copy';
import { definition } from '../content/copy/contact';
import { ContactForm } from '../page-controls';
export default function ContactPage() {
  const editorial = usePageCopy('contact', definition);
  return <div className="page-layout layout-contact">
    <section className="page-heading"><div className="shell"><p className="eyebrow">{editorial.pageHeading.getTouch}</p><h1>{editorial.pageHeading.title}</h1><p className="lead">{editorial.pageHeading.questionsAboutAccountAccessResearchParticipation}</p></div></section>
    <section className="section"><div className="shell contact-page-grid"><div><h2>{editorial.howCanWeHelp.howCanWeHelp}</h2><p>{editorial.howCanWeHelp.ifAreAskingAboutAccountAccess}</p><p>{editorial.howCanWeHelp.canAlsoFindAnswersOur + " "}<a href={safeCopyUrl(editorial.howCanWeHelp.hrefFaqPage)}>{editorial.howCanWeHelp.faqPage}</a>.</p></div><div className="contact-form-wrap"><ContactForm action="https://api.web3forms.com/submit" accessKey="2f40a3e9-3780-44bd-94c6-0762a55f64fb" /></div></div></section>
  </div>;
}
