// Initial content served until the EBS Team publishes a page. Member page content stays
// server-only so it never enters public JavaScript or prerendered HTML.
import { group, initialFields, type Field } from '../../src/content/fields.js';
import type { EditorialPage } from '../../src/content/pages.js';
import { definition as index } from '../../src/content/copy/index.js';
import { definition as about } from '../../src/content/copy/about.js';
import { definition as team } from '../../src/content/copy/team.js';
import { definition as schedule } from '../../src/content/copy/schedule.js';
import { definition as faq } from '../../src/content/copy/faq.js';
import { definition as contact } from '../../src/content/copy/contact.js';
import { definition as register } from '../../src/content/copy/register.js';
import { definition as studentSignup } from '../../src/content/copy/student-signup.js';
import { definition as schools } from '../../src/content/copy/schools.js';
import { definition as judges } from '../../src/content/copy/judges.js';
import { definition as projects } from '../../src/content/copy/projects.js';
import { definition as events } from '../../src/content/copy/events.js';
import { definition as opensource } from '../../src/content/copy/opensource.js';
import { definition as datasets } from '../../src/content/copy/datasets.js';
import { definition as participantHelp } from '../../src/content/copy/accepted-account.js';
import { definition as account } from '../../src/content/copy/account.js';
import { definition as acceptInvitation } from '../../src/content/copy/accept-invitation.js';
import { definition as admin } from '../../src/content/copy/admin.js';
import { definition as terms } from '../../src/content/copy/terms.js';
import { definition as privacy } from '../../src/content/copy/privacy.js';
import type { LessonContent, PageContentMap } from '../../src/content/model.js';
import { researchersInitial } from '../../src/content/defaults/researchers.js';

export const editorialDefinitions = {
  index,
  about,
  team,
  schedule,
  faq,
  contact,
  register,
  'student-signup': studentSignup,
  schools,
  judges,
  projects,
  events,
  opensource,
  datasets,
  account: group('Account', { ...account.fields, participantHelp }),
  'accept-invitation': acceptInvitation,
  admin,
  terms,
  privacy,
} satisfies Record<EditorialPage, Field>;

const editorialDefaults = Object.fromEntries(Object.entries(editorialDefinitions).map(([page, definition]) =>
  [page, initialFields(definition)])) as Record<EditorialPage, object>;

const codingPlaceholder = (): LessonContent => ({
  eyebrow: 'Coming soon',
  title: 'Coding',
  lead: 'Coding lessons are coming soon. Check back for updates.',
  sections: [],
});

export const initialContent: PageContentMap = {
  ...editorialDefaults,
  researchers: researchersInitial,
  resources: {
    eyebrow: 'For EBS participants',
    title: 'Resources',
    lead: 'Explore example posters from the EBS team. Research guides and tools are coming soon.',
    sections: [{
      type: 'images',
      heading: 'Example posters',
      intro: 'Posters from two members of the organizing team, to show what a finished EBS project can look like.',
      images: [
        { src: '/images/Poster/Luke Poster.jpeg', alt: 'Student research poster about fungal enzyme inhibitors', caption: 'Luke Wang — fungal enzyme inhibitors' },
        { src: '/images/Poster/Reya Poster.png', alt: 'Student research poster about circadian clock genes and traumatic brain injury', caption: 'Reya Satam — circadian clock genes and traumatic brain injury' },
      ],
    }],
  },
  datascience: codingPlaceholder(),
  python: codingPlaceholder(),
  rstudio: codingPlaceholder(),
};
