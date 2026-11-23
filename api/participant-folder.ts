import { clerkAccess, participantFolderSettings } from '../server/clerk.js';
import { createFolderHandlers } from '../server/participant-folders.js';
import { googleFolderRuntime } from '../server/drive/runtime.js';

export const maxDuration = 60;
export default createFolderHandlers({
  ...clerkAccess,
  participant: participantFolderSettings,
  googleFolder: googleFolderRuntime,
});
