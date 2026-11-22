import { ResearchFolder } from '../research-folder';
import { definition } from '../content/copy/accepted-account';
import { initialFields } from '../content/fields';
import { EditorialDefaults } from '../content/page-copy';
import ParticipantHelp from '../content/readers/participant-help';

const initial = { participantHelp: initialFields(definition) };
export default function AcceptedAccount() {
  return <><ResearchFolder /><EditorialDefaults page="account" content={initial}><ParticipantHelp /></EditorialDefaults></>;
}
