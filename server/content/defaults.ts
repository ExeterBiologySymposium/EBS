// Initial content served until the EBS Team publishes a page. Member page content stays
// server-only so it never enters public JavaScript or prerendered HTML.
import type { LessonContent, PageContentMap } from '../../src/content/model.js';
import { researchersInitial } from '../../src/content/defaults/researchers.js';

const codingPlaceholder = (): LessonContent => ({
  eyebrow: 'Coming soon',
  title: 'Coding',
  lead: 'Coding lessons are coming soon. Check back for updates.',
  sections: [],
});

export const initialContent: PageContentMap = {
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
