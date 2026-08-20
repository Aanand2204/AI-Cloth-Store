import { state, logout } from '../services/state.js';
import { getProfile, getOrderHistory, checkIsAdmin } from '../services/api_v2.js';
import { renderHeader } from '../components/Header.js';
import { renderAuthForms, setupAuthFormsEvents } from './profile/authForms.js';
import { renderProfileCard, setupProfileCardEvents } from './profile/profileCard.js';
import { renderOrderHistory } from './profile/orderHistory.js';
import { renderDangerZone, setupDangerZoneEvents } from './profile/dangerZone.js';

let showEditForm = false;      // toggles the edit-account-info form
let showDeleteConfirm = false; // toggles the delete-account confirmation

/**
 * Render the Profile page — email/username + password login & registration
 * when logged out, or the full account view (avatar, edit profile, order
 * history, delete account) when logged in.
 */
export async function renderProfile() {
  if (!state.isLoggedIn) {
    document.getElementById('app').innerHTML = `${renderHeader()}${renderAuthForms()}`;
    setupAuthFormsEvents(renderProfile);
    return;
  }

  let profile = { avatar: null };
  let orders = [];
  try {
    [profile, orders] = await Promise.all([
      getProfile(state.sessionId),
      getOrderHistory(state.sessionId),
    ]);
  } catch (err) {
    console.error('Failed to load profile data:', err);
  }

  document.getElementById('app').innerHTML = `
    ${renderHeader()}
    <div class="container" style="padding: 2rem 1rem; max-width: 640px; margin: 0 auto;">
      <h1 style="font-size: 2rem; font-weight: bold; margin-bottom: 2rem;">Your Profile</h1>
      ${renderProfileCard(profile, showEditForm)}
      ${renderOrderHistory(orders)}
      ${renderDangerZone(showDeleteConfirm)}
      <button id="logoutBtn" class="btn btn-outline" style="width: 100%;">Logout</button>
    </div>
  `;

  setupProfileEvents();
}

function setupProfileEvents() {
  document.getElementById('toggleEditForm')?.addEventListener('click', () => {
    showEditForm = !showEditForm;
    renderProfile();
  });
  setupProfileCardEvents(renderProfile, () => {
    showEditForm = false;
    renderProfile();
  });

  document.getElementById('deleteAccountBtn')?.addEventListener('click', () => {
    showDeleteConfirm = true;
    renderProfile();
  });
  document.getElementById('cancelDeleteBtn')?.addEventListener('click', () => {
    showDeleteConfirm = false;
    renderProfile();
  });
  setupDangerZoneEvents(() => {
    showDeleteConfirm = false;
  });

  document.getElementById('logoutBtn')?.addEventListener('click', async () => {
    logout();
    state.isAdmin = await checkIsAdmin(state.sessionId);
    showEditForm = false;
    showDeleteConfirm = false;
    renderProfile();
  });
}
