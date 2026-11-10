import { PublishedPage } from '../content/view';
import initial from '../content/researchers-default.json';
import type { ContentNode } from '../content/model';
export default function PageContent() { return <PublishedPage page="researchers" initial={initial as ContentNode[]} />; }
