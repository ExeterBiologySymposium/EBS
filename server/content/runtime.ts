import { authenticateClerk } from '../clerk-config.js';
import { clerkAccess } from '../clerk.js';
import { organizationRuntime } from '../orgs/runtime.js';
import { initialContent } from './defaults.js';
import { ContentProblem, type ContentDependencies } from './handlers.js';
import { neonContentStore } from './store.js';

// Reading published pages needs only the database. Team checks reuse the verified Production
// organization runtime, so editing is unavailable wherever participant administration is.
export function contentRuntime(env: Record<string, string | undefined> = process.env): ContentDependencies {
  let organizations: ReturnType<typeof organizationRuntime> | undefined;
  const team = () => organizations ??= organizationRuntime();
  return {
    enabled: env.EBS_CONTENT_ENABLED === 'true',
    authenticate: authenticateClerk,
    isTeam: userId => team().service.isTeam(userId),
    isAccepted: async userId => await clerkAccess.membership(userId) === 'accepted',
    async editorName(userId) {
      const user = await team().gateway.user(userId);
      return user.name || user.verifiedEmails[0] || '';
    },
    store() {
      const connection = env.EBS_ORG_DATABASE_URL || env.EBS_DRIVE_DATABASE_URL;
      const instance = env.EBS_ORG_INSTANCE_ID;
      if (!connection || !instance || !/^ins_[A-Za-z0-9]+$/.test(instance)) throw new ContentProblem('configuration');
      return neonContentStore(connection, instance);
    },
    initial: page => initialContent[page],
  };
}
