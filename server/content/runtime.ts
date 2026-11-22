import { authenticateClerk } from '../clerk-config.js';
import { clerkAccess } from '../clerk.js';
import { organizationRuntime } from '../orgs/runtime.js';
import { fetchScheduleFeed } from '../../src/schedule-feed.js';
import { validatePageContent } from '../../src/content/model.js';
import { editorialDefinitions, initialContent } from './defaults.js';
import { ContentProblem, type ContentDependencies } from './handlers.js';
import { neonContentStore } from './store.js';

// Reading published pages needs only the database. Team checks reuse the verified Production
// organization runtime, so editing is unavailable wherever participant administration is.
export function contentRuntime(env: Record<string, string | undefined> = process.env): ContentDependencies {
  let organizations: ReturnType<typeof organizationRuntime> | undefined;
  let schedule: { expires: number; data: Promise<{ content: unknown; source: 'current-schedule' | 'built-in-schedule' }> } | undefined;
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
    scheduleInitial() {
      if (schedule && schedule.expires > Date.now()) return schedule.data;
      const data = (async () => {
        try {
          const feed = await fetchScheduleFeed(AbortSignal.timeout(3500));
          if (feed.rows && feed.sessions) return {
            content: validatePageContent('schedule', { ...initialContent.schedule, ...feed }, editorialDefinitions.schedule),
            source: 'current-schedule' as const,
          };
        } catch { /* The editor labels the built-in schedule explicitly. */ }
        return { content: initialContent.schedule, source: 'built-in-schedule' as const };
      })();
      schedule = { expires: Date.now() + 15000, data };
      return data;
    },
  };
}
