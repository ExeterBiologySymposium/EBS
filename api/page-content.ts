import { createContentHandlers } from '../server/content/handlers.js';
import { contentRuntime } from '../server/content/runtime.js';

export const maxDuration = 30;
export default {
  fetch(request: Request): Promise<Response> {
    return createContentHandlers(contentRuntime())(request);
  },
};
