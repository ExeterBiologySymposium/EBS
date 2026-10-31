import { LegalPage, type LegalSection } from '../legal-page';

const sections: LegalSection[] = [
  {
    id: "welcome-and-scope",
    title: "Welcome and scope",
    content: <>
      <p>Welcome to the Exeter Biology Symposium (EBS) website. EBS is a student-run educational program organized by the Genetics and Biotechnology Club at Phillips Exeter Academy, with faculty guidance. In these Terms, “EBS,” “we,” “our,” and “us” refer to the symposium organizing team in connection with its website and program.</p>
      <p>These Terms cover the EBS website, account features, learning resources, registration links, research tools, and related online activities that link to them (the “Services”). Please read them before using the Services. If you do not agree to these Terms, do not use the Services. Separate event permissions, school requirements, and third-party service terms may also apply.</p>
      <p>If you act for a school, organization, or another person, you must have permission to do so. Nothing in these Terms authorizes you to accept obligations on another person's behalf without that authority.</p>
    </>,
  },
  {
    id: "our-purpose",
    title: "Our purpose",
    content: <>
      <p>EBS helps middle and high school students take their first steps in biological research. Through free learning resources, structured guidance, and a supportive symposium, students develop research questions, analyze evidence, and present original dry-lab biological research to peers and judges.</p>
      <p>Dry-lab research uses computers, public datasets, statistical methods, computational tools, and published literature rather than physical laboratory experiments. Our aim is to make rigorous research more accessible to students who may not have laboratory access or prior research experience, while encouraging curiosity, academic integrity, and clear scientific communication.</p>
      <p>EBS participation is free. Participants remain responsible for their own equipment, internet access, travel, and other personal expenses unless we expressly state otherwise. Participation does not guarantee a presentation place, award, publication, academic credit, or admission to Phillips Exeter Academy or another institution.</p>
    </>,
  },
  {
    id: "students-age-requirements-and-supervision",
    title: "Students, age requirements, and supervision",
    content: <>
      <p>The program welcomes middle and high school students. Eligibility for the program is separate from eligibility to create an online account or use a third-party service.</p>
      <p>You must be at least 13 to create your own EBS account or submit personal information directly through our online forms, and must meet any higher age requirement of the service you use. Users aged 13–15 must use these features with a parent or guardian's supervision. If you are a minor, review these Terms and the Privacy Notice with your parent or guardian and obtain any required permission before participating.</p>
      <p>If you are under 13, please do not create an account or submit personal information yourself. A parent or guardian should contact the EBS team before providing information about you so that an appropriate participation arrangement and any necessary consent can be considered. A teacher's involvement does not automatically replace parental permission.</p>
      <p>Every in-person presenter must be accompanied by an adult chaperone. Visiting schools determine who may serve as a chaperone under their own policies and remain responsible for supervising their students and for incidents involving their groups, as described in the participation requirements. Online research guidance does not replace adult supervision or a school's responsibilities.</p>
    </>,
  },
  {
    id: "privacy",
    title: "Privacy",
    content: <>
      <p>Our <a href="privacy.html">Privacy Notice</a> explains how information is collected, used, and shared in connection with EBS. Please review it before creating an account, sending a message, or submitting research. Posting this notice does not replace any separate consent required for a particular activity.</p>
    </>,
  },
  {
    id: "accounts-and-access",
    title: "Accounts and access",
    content: <>
      <p>Some resources, events, and research tools require an account and approval from the EBS team. Provide accurate information, keep your contact details current, and use only an account you are authorized to access. Creating an account or submitting an application does not by itself mean you have been accepted.</p>
      <p>Protect your sign-in credentials and do not share your account. Notify us if you suspect unauthorized access. We may restrict or suspend access to address misuse, security concerns, eligibility issues, or violations of these Terms. Contact us if you believe an access decision is mistaken.</p>
    </>,
  },
  {
    id: "respectful-and-secure-use",
    title: "Respectful and secure use",
    content: <>
      <p>Use the Services lawfully and respectfully. You must not:</p>
      <ul>
        <li>Harass, threaten, discriminate against, or impersonate another person.</li>
        <li>Submit fraudulent applications, misleading information, spam, or content that infringes another person's rights.</li>
        <li>Collect, disclose, or misuse someone else's private information.</li>
        <li>Access another participant's account, research folder, or other restricted materials without permission.</li>
        <li>Upload malicious software, disrupt the website, or overload its systems.</li>
        <li>Bypass access controls or probe or test systems without prior authorization from the responsible operator.</li>
        <li>Help another person carry out any of these activities.</li>
      </ul>
      <p>Report concerns to the EBS team. We may investigate reports, remove material, or limit access as appropriate, but cannot promise to review every submission or interaction.</p>
    </>,
  },
  {
    id: "research-integrity-and-appropriate-projects",
    title: "Research integrity and appropriate projects",
    content: <>
      <p>Research submitted to EBS must follow the published project requirements. Describe your own contributions accurately, acknowledge collaborators and assistance, cite sources, and comply with dataset and software licenses. Do not plagiarize, fabricate or falsify data, or present another person's work as your own.</p>
      <p>Keep records sufficient to explain your methods and support your results. Explain limitations and do not present exploratory findings as established conclusions. Disclose assistance from software, automated tools, or other people where required by the submission instructions or needed to make your contribution clear.</p>
      <p>EBS supports dry-lab research. Participation does not provide approval to conduct experiments involving people, animals, biological specimens, or hazardous materials, or to use restricted data. Obtain any required ethical, institutional, data-access, or other permissions independently before beginning work that requires them. Do not upload identifiable patient records, private genetic information, passwords, or other sensitive information to EBS tools.</p>
    </>,
  },
  {
    id: "website-materials-and-educational-use",
    title: "Website materials and educational use",
    content: <>
      <p>Website text, images, videos, logos, code, and teaching materials belong to their respective owners. Access to the website does not transfer ownership or give permission to use Phillips Exeter Academy or EBS branding as an endorsement.</p>
      <p>You may read and use materials for your personal learning, subject to any license or notice attached to them. Keep source acknowledgments and copyright notices. Materials published under an open license remain governed by that license, including any permissions for reuse, modification, and redistribution. Contact us before using other materials in a way that requires permission. Nothing here restricts uses permitted by applicable law.</p>
    </>,
  },
  {
    id: "your-research-and-other-submissions",
    title: "Your research and other submissions",
    content: <>
      <p>You retain ownership of the original work you submit, subject to the rights of collaborators, institutions, data providers, and other rights holders. You must have permission to submit the material and to authorize its use for EBS.</p>
      <p>By submitting work for participation, you give EBS a nonexclusive, royalty-free permission to receive, store, copy, and share it with organizers, advisors, and judges as reasonably needed to administer the program, review your work, provide feedback, and deliver the presentation for which you submitted it. This permission is limited to those purposes and the necessary service providers supporting them.</p>
      <p>Submitting a project does not automatically license it for unrelated commercial use or publication in an open-source repository. Public posting outside the presentation or another clearly identified submission purpose, promotional reuse, and recordings require any additional permission applicable to that use. You may submit your work elsewhere, subject to those venues' rules.</p>
    </>,
  },
  {
    id: "research-folders-and-your-copies",
    title: "Research folders and your copies",
    content: <>
      <p>When available, the research-folder feature creates a Google Drive folder and a starter document under an EBS-controlled Google account and shares them with your linked Google account. Authorized EBS team members can access the folder. Other participants are not automatically given access. Google Drive's own terms and sharing settings also apply.</p>
      <p>Keep your own copies of important research and submissions. The website is not a guaranteed permanent archive. Removing an EBS account or changing website approval status does not automatically delete Google files or revoke permissions already granted in Drive. Contact the team for help with access changes or deletion requests.</p>
    </>,
  },
  {
    id: "external-services-and-links",
    title: "External services and links",
    content: <>
      <p>EBS uses third-party services for functions such as sign-in, forms, messaging, file storage, hosting, and website measurement. Links may also lead to independent resources, datasets, or tools. Their terms, privacy notices, and age requirements apply to your use of those services.</p>
      <p>A link does not guarantee the accuracy, safety, availability, or suitability of external content. Check permissions before sharing information or using third-party materials.</p>
    </>,
  },
  {
    id: "program-changes-and-availability",
    title: "Program changes and availability",
    content: <>
      <p>Resources, deadlines, schedules, speakers, formats, and capacity may change. We may update or discontinue website features or restrict access when needed. We will communicate material program changes through the website or participant communications where practicable. Refer to current instructions before making arrangements or submitting work.</p>
    </>,
  },
  {
    id: "educational-information-and-limitations",
    title: "Educational information and limitations",
    content: <>
      <p>EBS materials and student research are for education and scientific discussion. They are not medical advice, diagnosis, treatment, or a substitute for professional advice. A project's acceptance, presentation, or award is not independent verification of every result or endorsement of a clinical claim.</p>
      <p>To the extent permitted by law, the Services are provided as available, without a guarantee of uninterrupted operation, error-free information, or any particular research outcome. We do not exclude rights or obligations that applicable law does not allow us to exclude.</p>
    </>,
  },
  {
    id: "responsibility-and-disputes",
    title: "Responsibility and disputes",
    content: <>
      <p>You are responsible for your own conduct, submissions, permissions, and compliance with these Terms. Notify the team promptly about participation concerns so they can be considered. Separate school, travel, venue, and event agreements continue to apply where relevant.</p>
      <p>To the extent permitted by applicable law, EBS and its organizers are not responsible for indirect or consequential losses arising from use of the website or reliance on its educational materials. This provision does not exclude liability that cannot lawfully be excluded or override rights a participant has under applicable law.</p>
    </>,
  },
  {
    id: "copyright-and-other-concerns",
    title: "Copyright and other concerns",
    content: <>
      <p>If you believe material on the EBS website infringes your rights, email the team with a description of the work, the location of the material, your contact details, and an explanation of the concern. We may request additional information and restrict access while the matter is reviewed. This contact route does not identify the student team as the Academy's designated legal or copyright agent.</p>
    </>,
  },
  {
    id: "communications-and-updates-to-these-terms",
    title: "Communications and updates to these Terms",
    content: <>
      <p>We may communicate about your application, access, research, deadlines, and participation by email or through the website. These Terms do not subscribe you to text messaging or unrelated promotional communications.</p>
      <p>We may revise these Terms and will update the date above. Material changes will be identified on the website or communicated to affected participants as appropriate. Changes do not replace any notice, agreement, or consent required by law. Stop using the Services if you do not agree to the revised Terms.</p>
    </>,
  },
  {
    id: "general-provisions",
    title: "General provisions",
    content: <>
      <p>These Terms concern the EBS Services and do not replace Academy-wide policies or a separate agreement that expressly applies to an activity. If a provision is unenforceable, the remaining provisions continue to apply to the extent permitted by law. Rights and obligations that by their nature continue after access ends, including ownership and applicable limits on use, continue as appropriate.</p>
    </>,
  },
  {
    id: "contact",
    title: "Contact",
    content: <>
      <p>For questions about these Terms, research permissions, or participation, contact the Exeter Biology Symposium organizing team at <a href="mailto:exeterbiologysymposium@gmail.com">exeterbiologysymposium@gmail.com</a> or use the <a href="contact.html">Contact page</a>.</p>
    </>,
  }
];

export default function TermsPage() {
  return <LegalPage title="Terms of Use" lead="Our purpose, participation expectations, and terms for using the Exeter Biology Symposium website and research resources." sections={sections} />;
}
