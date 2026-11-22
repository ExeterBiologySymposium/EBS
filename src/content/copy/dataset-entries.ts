import { datasets, fields } from '../../learning/datasets/catalog.js';
import { toolChoices, toolGuides, toolLabels } from '../../learning/datasets/tools.js';
import { copy, entries, group, locked, url } from '../fields.js';

const words = (label: string) => copy(label, '', { multiline: true });
const link = group('Link', { label: copy('Link text'), url: url('Link destination') });
const code = group('Code example', {
  language: copy('Language', '', { options: { '': 'No example', R: 'R', Python: 'Python' } }),
  text: copy('Code example', '', { multiline: true, optional: true }),
});
const defaultCode = { language: '', text: '' };
export const datasetEntries = {
  catalog: entries('Datasets', group('Dataset', {
    id: locked('Identifier'), field: locked('Research field'), level: locked('Level'), tools: locked('Recommended tools'),
    name: copy('Dataset name'), provider: copy('Provider'), summary: words('Description'),
    format: words('Data format'), access: words('Access and license'), question: words('Starter question'),
    url: url('Dataset URL'), steps: entries('Steps', words('Instruction'), [], { min: 1, max: 20 }),
    caution: copy('Caution', '', { multiline: true, optional: true }), code,
    links: entries('Additional links', link, [], { max: 12, titleKey: 'label' }),
  }), datasets.map(dataset => ({ ...dataset, caution: dataset.caution ?? '', code: dataset.code ?? defaultCode, links: dataset.links ?? [] })), {
    fixed: true, max: 200, titleKey: 'name',
  }),
  datasetFields: entries('Research fields', group('Field', { key: locked('Identifier'), name: copy('Field name'), summary: words('Description') }), fields, { fixed: true, titleKey: 'name' }),
  guides: entries('Tool guides', group('Tool guide', {
    key: locked('Identifier'), name: copy('Tool name'), tagline: words('Tagline'), summary: words('Description'),
    bestFor: words('Best for'), accepts: words('Data it accepts'), runsIn: words('Runs in'), account: words('Account'),
    steps: entries('Steps', group('Step', { title: copy('Step title'), detail: words('Instructions'), code }), [], { min: 1, titleKey: 'title' }),
    tips: entries('Tips', words('Tip'), []), links: entries('Tool links', link, [], { min: 1, titleKey: 'label' }),
  }), toolGuides.map(({ steps, ...guide }) => ({
    ...guide, steps: steps.map(step => ({ ...step, code: step.code ?? defaultCode })),
  })), { fixed: true, titleKey: 'name' }),
  toolChoices: entries('Tool chooser', group('Tool choice', {
    tool: locked('Tool identifier'), name: copy('Tool name'), data: words('Data type'), place: words('Where it runs'), example: words('Example'),
  }), toolChoices.map(choice => ({ ...choice, name: toolLabels[choice.tool] })), { fixed: true, titleKey: 'name' }),
};
