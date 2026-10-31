import { LegalPage, type LegalSection } from '../legal-page';

const sections: LegalSection[] = [
  {
    id: "about-this-notice",
    title: "About this notice",
    content: <>
      <p>Exeter Biology Symposium (EBS) is a free, student-run dry-lab biology research program and symposium organized by the Genetics and Biotechnology Club at Phillips Exeter Academy, with faculty guidance. We help middle and high school students learn research skills, develop original projects, and present their work.</p>
      <p>This notice explains how the EBS organizing team collects, uses, and shares personal information in connection with the EBS website, accounts, applications, contact messages, research tools, and related program activities. Personal information means information that identifies you or can reasonably be linked to you.</p>
      <p>Read this notice alongside our <a href="terms.html">Terms of Use</a>. It describes our practices; it does not substitute for any separate consent required for an activity. Phillips Exeter Academy also publishes an <a href="https://exeter.edu/privacy-notice/">Academy Privacy Notice</a>, which addresses the Academy's broader activities. This EBS notice focuses on the symposium and its website.</p>
    </>,
  },
  {
    id: "information-you-provide",
    title: "Information you provide",
    content: <>
      <p>Depending on how you participate, information may include:</p>
      <ul>
        <li><strong>Account information:</strong> your name, email address, account identifier, linked sign-in profile, and membership or approval status. Authentication is handled through Clerk.</li>
        <li><strong>Applications and participation:</strong> the information requested in the student, school, or judge application you choose to complete, such as contact details, school affiliation, participation role, research interests, and attendance preferences. The form shows the fields requested before you submit it.</li>
        <li><strong>Messages:</strong> your name, email, optional role, subject, message, and information you include in correspondence with the team.</li>
        <li><strong>Research:</strong> project titles, abstracts, posters, code, research documents, progress information, feedback, and other materials you submit or place in an EBS research folder.</li>
        <li><strong>Program arrangements:</strong> information you or an authorized adult provides to coordinate participation, supervision, or a requested accommodation. Contact us before sending sensitive details so we can discuss what is necessary and an appropriate way to provide them.</li>
      </ul>
      <p>Please provide only information needed for the relevant activity. Do not send passwords, government identification numbers, payment details, identifiable patient data, or private genetic information through contact forms or research folders. EBS participation is free; the website does not request payment information for participation.</p>
    </>,
  },
  {
    id: "information-collected-when-you-use-the-website",
    title: "Information collected when you use the website",
    content: <>
      <p>The website and its providers may process technical information such as IP address, browser and device characteristics, requested pages, referring pages, timestamps, security events, and service errors as part of delivering and protecting the Services.</p>
      <p>The site includes Vercel Web Analytics and Speed Insights to understand page use and website performance where enabled. These features can process page URLs, referring pages, approximate country, browser and device information, and performance measurements. Vercel describes Web Analytics as using a temporary identifier rather than analytics cookies, and Speed Insights as recording performance data without identifying an individual visitor. This does not mean that sign-in, security tools, hosting, or external services are cookie-free. See <a href="https://vercel.com/docs/analytics/privacy-policy">Vercel Web Analytics privacy information</a> and <a href="https://vercel.com/docs/speed-insights/privacy-policy">Speed Insights privacy information</a>.</p>
      <p>Contact pages load hCaptcha to help prevent automated abuse. That service may process network, device, and interaction information when its verification tool loads or is used. Linked or embedded resources can also receive technical information when your browser connects to them.</p>
    </>,
  },
  {
    id: "where-information-comes-from",
    title: "Where information comes from",
    content: <>
      <p>We receive information directly from you, from a parent or guardian or school representative acting with appropriate authority, from your use of the website, and from services you choose to use with EBS. For example, a linked sign-in provider can supply account information, and your Google account email is used to share a research folder when that feature is available.</p>
      <p>The application forms, research tools, and links you use may collect different information. Review their instructions and privacy information before submitting data.</p>
    </>,
  },
  {
    id: "how-we-use-information",
    title: "How we use information",
    content: <>
      <p>We use information to:</p>
      <ul>
        <li>Respond to questions and communicate about EBS.</li>
        <li>Process applications, manage accounts, and determine access to restricted resources and events.</li>
        <li>Provide learning resources, research guidance, project review, judging, and feedback.</li>
        <li>Create and manage research folders where that feature is available.</li>
        <li>Coordinate presentations, attendance, chaperone arrangements, and program logistics.</li>
        <li>Maintain the website, understand its use, diagnose problems, and prevent fraud or misuse.</li>
        <li>Address safety concerns, enforce participation requirements, and meet applicable legal obligations.</li>
      </ul>
      <p>Information submitted for research is used to support the program; submitting it does not automatically authorize unrelated research studies, commercial reuse, or public release of private working files.</p>
    </>,
  },
  {
    id: "who-can-receive-information",
    title: "Who can receive information",
    content: <>
      <p>Information may be made available to EBS organizers, faculty advisors, and judges who need it for their roles, and to service providers supporting the activity. A school representative, parent, or guardian may receive information where authorized or otherwise appropriate under applicable requirements.</p>
      <p>The website's integrations include:</p>
      <ul>
        <li><strong>Clerk:</strong> sign-in, account management, and membership information. See <a href="https://clerk.com/legal/privacy">Clerk's privacy information</a>.</li>
        <li><strong>Google:</strong> application forms, email communications, linked Google sign-in, and Drive/Docs research files where used. See <a href="https://policies.google.com/privacy">Google's Privacy Policy</a>.</li>
        <li><strong>Web3Forms and hCaptcha:</strong> delivery of contact-form messages and protection against automated submissions. See <a href="https://web3forms.com/privacy">Web3Forms' Privacy Policy</a> and <a href="https://www.hcaptcha.com/privacy">hCaptcha's privacy information</a>.</li>
        <li><strong>Vercel:</strong> website hosting, request handling, analytics, and performance measurement. See <a href="https://vercel.com/legal/privacy-policy">Vercel's Privacy Notice</a>.</li>
        <li><strong>Neon:</strong> storage of the records connecting an accepted participant's account to their research folder, when the folder feature is enabled. See <a href="https://neon.com/privacy-policy">Neon's Privacy Policy</a>.</li>
        <li><strong>Appwrite:</strong> delivery of schedule and session information, which can involve requests from your browser. See <a href="https://appwrite.io/privacy">Appwrite's Privacy Policy</a>.</li>
      </ul>
      <p>Providers process information according to the applicable service arrangements and their own notices where relevant. A provider's general privacy policy does not replace EBS's responsibility for information handled on its behalf.</p>
      <p>We may also disclose information when required by law or reasonably necessary to address safety, security, fraud, or the protection of legal rights. We do not sell participant information or use it to build advertising profiles. Operational sharing with providers is described above.</p>
    </>,
  },
  {
    id: "research-folders-and-google-accounts",
    title: "Research folders and Google accounts",
    content: <>
      <p>When enabled, the research-folder feature uses the verified email of a Google account linked to your EBS sign-in to share a folder and a starter document. Files are created under an EBS-controlled Google account. The participant and authorized EBS team members can access that folder; the feature does not automatically give other participants access or make it public.</p>
      <p>The supporting database stores your EBS account identifier, recipient email, folder and document identifiers, and records needed to prepare and recover the folder. Your research content is held in Google Drive, rather than copied into that mapping database by this feature.</p>
      <p>Linking a Google sign-in account for this feature does not require you to give EBS access to all the files in your own Google Drive. Files you put into the EBS folder are accessible under that folder's sharing permissions. Changes made separately in Google Drive can affect who can see them.</p>
      <p>Deleting an account, unlinking Google, or losing website approval does not automatically remove existing files or revoke Drive permissions. Contact the team about those changes and any related privacy request.</p>
    </>,
  },
  {
    id: "presentations-public-materials-and-recordings",
    title: "Presentations, public materials, and recordings",
    content: <>
      <p>A presentation is intended to be viewed by its session audience, which may include judges, other participants, and attendees. Include only material you are authorized and comfortable to present. Do not place private information about yourself or others on a public poster.</p>
      <p>Private working files are not automatically published by submitting a project or creating a research folder. Any publication of identifiable project materials outside the stated presentation purpose, promotional use, photography, or recording must be covered by the notice and any permission applicable to that activity. These Terms and this notice do not themselves provide a blanket photo or recording release.</p>
    </>,
  },
  {
    id: "cookies-browser-controls-and-external-resources",
    title: "Cookies, browser controls, and external resources",
    content: <>
      <p>Sign-in and security providers may use cookies, browser storage, or similar technologies to keep sessions working and prevent abuse. You can manage these technologies through your browser and any controls a provider offers. Blocking them may prevent sign-in, verification, or other features from working. Contact the team by email if a form is unavailable.</p>
      <p>The EBS website does not currently change its behavior in response to the legacy Do Not Track browser setting. Applicable privacy rights and any legally required treatment of other opt-out signals continue to apply. Contact us with questions or to exercise a right.</p>
      <p>External sites, social networks, videos, and research tools have their own practices. Opening a link or loading an embed can disclose technical information to that operator. Review its privacy notice before signing in or sharing information.</p>
    </>,
  },
  {
    id: "children-and-younger-participants",
    title: "Children and younger participants",
    content: <>
      <p>EBS is intended to support middle and high school students, including younger learners. Program eligibility does not automatically establish eligibility to use an online account or third-party service.</p>
      <p>Direct EBS account creation and personal-information submissions through our online forms are for users aged 13 or older, subject to any higher provider requirement. Users aged 13–15 must use these features with parent or guardian supervision. Minors should review this notice with a parent or guardian before participating and obtain any permission required for the activity.</p>
      <p>Children under 13 should not create an account or submit personal information themselves. A parent or guardian should contact the EBS team before sending information about a younger child so that an appropriate participation arrangement and any necessary consent can be considered. We do not treat ordinary website use or acceptance of these Terms as verified parental consent.</p>
      <p>If you believe a child has provided information without the required permission, contact us using the email below so the matter can be reviewed and appropriate action taken. This notice does not promise that technical age verification is performed on every visitor.</p>
    </>,
  },
  {
    id: "retention-and-deletion",
    title: "Retention and deletion",
    content: <>
      <p>Information is retained according to its purpose, the applicable service arrangements, and legal or institutional requirements. Relevant purposes include administering the current program, providing feedback, resolving access issues, maintaining necessary program records, and addressing safety or legal concerns. There is no single automatic deletion date covering all EBS accounts, messages, applications, and research files.</p>
      <p>You can ask about retention or request deletion using the contact details below. We will assess what can be deleted and explain relevant limitations. Removing an account does not automatically remove information from applications, correspondence, research folders, or third-party systems. Copies may remain where required for a legitimate purpose, in provider backups, or in material already lawfully shared. Keep your own copies of research you wish to retain.</p>
    </>,
  },
  {
    id: "your-choices-and-requests",
    title: "Your choices and requests",
    content: <>
      <p>You can browse public information without creating an EBS account. Account or application information is necessary for features that require identification or approval. You may update available profile details through your account settings and contact us to correct application or program records.</p>
      <p>Depending on the law that applies to you, you may have rights to access, correct, delete, or obtain a copy of information; restrict or object to certain processing; withdraw consent where processing relies on it; or challenge a response to a privacy request. These rights depend on the circumstances and applicable exceptions. Where available, you may also raise concerns with the relevant supervisory authority.</p>
      <p>Email the team with “Privacy request” in the subject line and describe what you need. Parents, guardians, and authorized representatives may contact us on another person's behalf. We may request proportionate information to verify identity or authority before releasing or changing records. Do not send an identification document or password with your initial request. We will respond under the requirements applicable to the request.</p>
      <p>To stop optional program announcements, follow an available unsubscribe instruction or email us. Essential messages about an active application, account, security issue, or participation may still be necessary. This notice does not sign you up for SMS messages.</p>
    </>,
  },
  {
    id: "international-access",
    title: "International access",
    content: <>
      <p>EBS is organized in New Hampshire, United States. The team and service providers may process information in the United States and other countries where they operate, whose privacy rules may differ from those where you live. Contact us if you need information about a particular provider or transfer before using a feature. This notice does not itself establish a legal basis for an international transfer or claim that EBS has entered into particular transfer agreements.</p>
    </>,
  },
  {
    id: "security",
    title: "Security",
    content: <>
      <p>Website features use access controls and provider security features to help protect information, but no website, email service, or storage system is completely secure. Protect your account, check sharing permissions, and avoid placing sensitive information in messages or research folders. Report suspected unauthorized access to the team promptly. We will not ask for your password by email or through a contact message.</p>
    </>,
  },
  {
    id: "changes-to-this-notice",
    title: "Changes to this notice",
    content: <>
      <p>We may update this notice as the program, website, or applicable requirements change. We will revise the date above and provide additional notice of material changes as appropriate. An update does not replace any separate permission required for a new use of information.</p>
    </>,
  },
  {
    id: "contact",
    title: "Contact",
    content: <>
      <p>For questions, corrections, or privacy requests, contact the Exeter Biology Symposium organizing team at <a href="mailto:exeterbiologysymposium@gmail.com">exeterbiologysymposium@gmail.com</a> with “Privacy request” in the subject line, or visit our <a href="contact.html">Contact page</a>.</p>
      <p>For questions about the Academy's wider practices, consult the contact details in <a href="https://exeter.edu/privacy-notice/">Phillips Exeter Academy's Privacy Notice</a>.</p>
    </>,
  }
];

export default function PrivacyPage() {
  return <LegalPage title="Privacy Notice" lead="How Exeter Biology Symposium collects, uses, and shares information through its website and research program." sections={sections} />;
}
