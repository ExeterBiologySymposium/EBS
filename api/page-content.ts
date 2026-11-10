import { createContentHandlers } from '../server/content/handlers.js';
import { contentRuntime } from '../server/content/runtime.js';

export const maxDuration = 30;
// One handler per function instance, so validated built-in and published content is reused.
const handler = createContentHandlers(contentRuntime());
export default {
  fetch(request: Request): Promise<Response> {
    return handler(request);
  },
};
