import { clerkAccess, participantFolderSettings } from '../server/clerk.js';
import { createFolderHandlers } from '../server/participant-folders.js';
import { ownerAccountDrive } from '../server/drive/google.js';
import { driveConfiguration } from '../server/drive/config.js';
import { neonFolderStore } from '../server/drive/store.js';

export const maxDuration = 60;
export default createFolderHandlers({
  ...clerkAccess,
  participant: participantFolderSettings,
  googleFolder() {
    const config = driveConfiguration(process.env);
    return { store: neonFolderStore(config.connection, config.namespace), drive: ownerAccountDrive(config) };
  },
});
