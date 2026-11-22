import { definition } from '../content/copy/datasets';
import { initialFields } from '../content/fields';
import { EditorialDefaults } from '../content/page-copy';
import Reader from '../content/readers/datasets';

const initial = initialFields(definition);
export default function DatasetLibraryPage() {
  return <EditorialDefaults page="datasets" content={initial}><Reader /></EditorialDefaults>;
}
