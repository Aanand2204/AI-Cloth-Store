import { state, logout } from '../../services/state.js';
import { deleteAccount } from '../../services/api_v2.js';

/**
 * Delete-account card. `showConfirm` controls whether the password-confirm
 * step is expanded (that toggle is owned by the caller).
 */
export function renderDangerZone(showConfirm) {
  return `
    <div style="background: white; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); padding: 2rem; margin-bottom: 1.5rem; border: 1px solid #FCA5A5;">
      <h2 style="font-size: 1.1rem; font-weight: bold; color: #DC2626; margin: 0 0 1rem;">Danger Zone</h2>
      ${showConfirm ? `
        <p style="color: #6B7280; margin-bottom: 1rem;">Enter your password to permanently delete your account. This cannot be undone.</p>
        <input type="password" placeholder="Password" class="form-input" id="deletePassword" style="width: 100%; margin-bottom: 1rem;" />
        <div style="display: flex; gap: 0.75rem;">
          <button id="confirmDeleteBtn" class="btn" style="flex: 1; background: #DC2626; color: white;">Permanently Delete</button>
          <button id="cancelDeleteBtn" class="btn btn-outline" style="flex: 1;">Cancel</button>
        </div>
      ` : `
        <button id="deleteAccountBtn" class="btn btn-outline" style="color: #DC2626; border-color: #DC2626;">Delete Account</button>
      `}
    </div>
  `;
}

/**
 * Wires the actual delete confirmation. Opening/cancelling the confirm step
 * is handled by the caller, which owns the `showConfirm` flag. `onDeleted`
 * runs right before navigating away, so the caller can reset that flag.
 */
export function setupDangerZoneEvents(onDeleted) {
  document.getElementById('confirmDeleteBtn')?.addEventListener('click', async () => {
    const password = document.getElementById('deletePassword').value;
    if (!password) {
      alert('Please enter your password.');
      return;
    }
    const btn = document.getElementById('confirmDeleteBtn');
    btn.textContent = 'Deleting...';
    btn.disabled = true;
    try {
      await deleteAccount(state.sessionId, password);
      logout();
      state.isAdmin = false;
      onDeleted();
      alert('Account deleted. Goodbye! 👋');
      window.location.hash = '#/';
    } catch (err) {
      alert(err.message);
      btn.textContent = 'Permanently Delete';
      btn.disabled = false;
    }
  });
}
