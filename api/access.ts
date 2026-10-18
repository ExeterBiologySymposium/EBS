import { createAccessHandlers } from '../server/access.js';
import { clerkAccess } from '../server/clerk.js';

export default {
  fetch(request: Request) {
    const handlers = createAccessHandlers(clerkAccess);
    return request.method === 'POST' ? handlers.enroll(request) : handlers.status(request);
  },
};
