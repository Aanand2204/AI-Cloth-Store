import { router } from './router.js';
import { state } from './services/state.js';
import { checkIsAdmin, initIngestionApiBase } from './services/api_v2.js';

// Initialize application - listen for hash changes to navigate pages
window.addEventListener('hashchange', router);

window.addEventListener('DOMContentLoaded', async () => {
  // Resolve the ingestion service's real URL and admin status before the
  // first render, so write calls and admin-gated routes/links are correct
  // from the very first paint.
  await initIngestionApiBase();
  state.isAdmin = await checkIsAdmin(state.sessionId);
  router();
});