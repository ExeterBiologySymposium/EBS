import { adminResponse } from '../server/orgs/handlers.js';
import { organizationRuntime } from '../server/orgs/runtime.js';
import { createRegistrationStatusHandler } from '../server/registration-status.js';

export const maxDuration = 60;
export default { async fetch(request: Request): Promise<Response> {
  try {
    return await createRegistrationStatusHandler({
      token: process.env.EBS_REGISTRATION_STATUS_TOKEN,
      service: () => organizationRuntime().service,
    }).fetch(request);
  } catch {
    return adminResponse(503, { state: 'configuration' });
  }
} };
