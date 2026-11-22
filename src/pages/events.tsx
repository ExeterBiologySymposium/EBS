import { definition } from '../content/copy/events';
import { initialFields } from '../content/fields';
import { EditorialDefaults } from '../content/page-copy';
import Reader from '../content/readers/events';

const initial = initialFields(definition);
export default function EventsPage() {
  return <EditorialDefaults page="events" content={initial}><Reader /></EditorialDefaults>;
}
