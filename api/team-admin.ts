import { authenticateClerk } from '../server/clerk-config.js';
import { adminResponse, createAdminHandlers } from '../server/orgs/handlers.js';
import { organizationRuntime } from '../server/orgs/runtime.js';

export const maxDuration = 60;
export default {
  async fetch(request: Request): Promise<Response> {
    try {
      const { service, config } = organizationRuntime();
      return await createAdminHandlers({ authenticate: authenticateClerk, service, teamId: config.teamId }).fetch(request);
    } catch { return adminResponse(503, { state: 'configuration' }); }
  },
};
