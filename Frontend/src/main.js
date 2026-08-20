import { router } from './router.js';
import { state } from './services/state.js';
import { checkIsAdmin } from './services/api_v2.js';

// Initialize application - listen for hash changes to navigate pages
window.addEventListener('hashchange', router);

window.addEventListener('DOMContentLoaded', async () => {
  // Resolve admin status before the first render so admin-only routes/links are gated correctly
  state.isAdmin = await checkIsAdmin(state.sessionId);
  router();
});