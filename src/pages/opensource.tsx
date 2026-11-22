import { definition } from '../content/copy/opensource';
import { initialFields } from '../content/fields';
import { EditorialDefaults } from '../content/page-copy';
import Reader from '../content/readers/opensource';

const initial = initialFields(definition);
export default function OpenSourcePage() {
  return <EditorialDefaults page="opensource" content={initial}><Reader /></EditorialDefaults>;
}
