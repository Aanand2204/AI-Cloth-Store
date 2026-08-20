import { state, login } from '../../services/state.js';
import { uploadAvatar, updateProfile } from '../../services/api_v2.js';

function avatarMarkup(avatarUrl) {
  if (avatarUrl) {
    return `<img src="${avatarUrl}" style="width: 96px; height: 96px; border-radius: 50%; object-fit: cover;" />`;
  }
  const initial = (state.username || '?').charAt(0).toUpperCase();
  return `
    <div style="width: 96px; height: 96px; border-radius: 50%; background: #4f46e5; color: white; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; font-weight: bold;">
      ${initial}
    </div>
  `;
}

/**
 * Avatar + collapsible edit-account-info card. `showEditForm` controls whether
 * the edit fields are expanded (the toggle itself is wired by the caller,
 * since it owns that flag).
 */
export function renderProfileCard(profile, showEditForm) {
  return `
    <div style="background: white; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); padding: 2rem; margin-bottom: 1.5rem;">
      <div style="display: flex; align-items: center; gap: 1.5rem;">
        ${avatarMarkup(profile.avatar)}
        <div style="flex: 1;">
          <p style="font-size: 1.25rem; font-weight: bold; color: #111827;">${state.username}</p>
          <p style="color: #9CA3AF; font-size: 0.9rem;">${state.sessionId}</p>
          <label class="btn btn-outline" style="display: inline-block; margin-top: 0.75rem; cursor: pointer; font-size: 0.85rem;">
            Change Photo
            <input type="file" id="avatarInput" accept="image/png, image/jpeg, image/jpg" style="display: none;" />
          </label>
        </div>
      </div>
    </div>

    <div style="background: white; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); padding: 2rem; margin-bottom: 1.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;" id="toggleEditForm">
        <h2 class="admin-form-title" style="margin: 0;">Edit Profile</h2>
        <span>${showEditForm ? '▲' : '▼'}</span>
      </div>
      ${showEditForm ? `
        <div style="margin-top: 1.5rem;">
          <input placeholder="Username" class="form-input" id="editUsername" style="width: 100%; margin-bottom: 1rem;" value="${state.username}" />
          <input type="email" placeholder="Email" class="form-input" id="editEmail" style="width: 100%; margin-bottom: 1rem;" value="${state.sessionId}" />
          <input type="password" placeholder="New password (leave blank to keep current)" class="form-input" id="editPassword" style="width: 100%; margin-bottom: 1rem;" />
          <input type="password" placeholder="Current password (required to save)" class="form-input" id="editCurrentPassword" style="width: 100%; margin-bottom: 1rem;" />
          <button id="saveProfileBtn" class="btn btn-primary" style="width: 100%;">Save Changes</button>
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Wires the avatar upload and save-changes actions. Toggling the edit form
 * open/closed is handled by the caller, which owns the `showEditForm` flag.
 * `onSaved` runs (instead of a plain rerender) after a successful save, so the
 * caller can collapse the edit form back down.
 */
export function setupProfileCardEvents(rerender, onSaved) {
  document.getElementById('avatarInput')?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadAvatar(state.sessionId, file);
      rerender();
    } catch (err) {
      alert(err.message);
    }
  });

  document.getElementById('saveProfileBtn')?.addEventListener('click', async () => {
    const newUsername = document.getElementById('editUsername').value.trim();
    const newEmail = document.getElementById('editEmail').value.trim();
    const newPassword = document.getElementById('editPassword').value;
    const currentPassword = document.getElementById('editCurrentPassword').value;

    if (!currentPassword) {
      alert('Please enter your current password to save changes.');
      return;
    }

    const btn = document.getElementById('saveProfileBtn');
    btn.textContent = 'Saving...';
    btn.disabled = true;
    try {
      const result = await updateProfile({
        currentEmail: state.sessionId,
        currentPassword,
        newUsername: newUsername !== state.username ? newUsername : null,
        newEmail: newEmail !== state.sessionId ? newEmail : null,
        newPassword: newPassword || null,
      });
      login(result.email, result.username);
      alert('Profile updated ✅');
      onSaved();
    } catch (err) {
      alert(err.message);
      btn.textContent = 'Save Changes';
      btn.disabled = false;
    }
  });
}
