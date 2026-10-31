import { privateHeaders } from '../server/access.js';
import { clerkAccess, participantGoogleEmail } from '../server/clerk.js';
import { createFolderHandlers } from '../server/participant-folders.js';
import { ownerAccountDrive } from '../server/drive/google.js';
import { driveConfiguration } from '../server/drive/config.js';
import { neonFolderStore } from '../server/drive/store.js';

export const maxDuration = 60;
export default {
  async fetch(request: Request): Promise<Response> {
    try {
      const config = driveConfiguration(process.env);
      return await createFolderHandlers({
        ...clerkAccess, recipient: participantGoogleEmail,
        store: neonFolderStore(config.connection, config.namespace),
        drive: ownerAccountDrive(config),
      }).fetch(request);
    } catch {
      return Response.json({ state: 'unavailable' }, { status: 503, headers: privateHeaders });
    }
  },
};
