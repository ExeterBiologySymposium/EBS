import { driveConfiguration } from './config.js';
import { ownerAccountDrive } from './google.js';
import { neonFolderStore } from './store.js';

export function googleFolderRuntime() {
  const config = driveConfiguration(process.env);
  return { store: neonFolderStore(config.connection, config.namespace), drive: ownerAccountDrive(config) };
}
