import { PublishedPage } from '../content/view';
import { researchersInitial } from '../content/defaults/researchers';

// Public page: the build-time snapshot is prerendered, then replaced by the latest publication.
export default function PageContent() { return <PublishedPage page="researchers" initial={researchersInitial} />; }
