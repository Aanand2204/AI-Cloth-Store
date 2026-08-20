import { API_BASE } from './common.js';

/**
 * Check whether the given email is a configured admin.
 */
export async function checkIsAdmin(email) {
  if (!email) return false;
  const res = await fetch(`${API_BASE}/auth/is-admin?email=${encodeURIComponent(email)}`);
  const data = await res.json();
  return !!data.is_admin;
}

/**
 * Register a new account (username, email, password) — stored in MongoDB.
 */
export async function registerUser(username, email, password) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Registration failed');
  return data;
}

/**
 * Log in with an email or username, plus password.
 */
export async function loginUser(identifier, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Login failed');
  return data;
}

/**
 * Fetch a user's public profile (username, email, avatar).
 */
export async function getProfile(email) {
  const res = await fetch(`${API_BASE}/auth/profile?email=${encodeURIComponent(email)}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to load profile');
  return data;
}

/**
 * Edit username/email/password. currentPassword must be correct to authorize the change.
 */
export async function updateProfile({ currentEmail, currentPassword, newUsername, newEmail, newPassword }) {
  const res = await fetch(`${API_BASE}/auth/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      current_email: currentEmail,
      current_password: currentPassword,
      new_username: newUsername || null,
      new_email: newEmail || null,
      new_password: newPassword || null,
    })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Profile update failed');
  return data;
}

/**
 * Upload/replace the current user's avatar image.
 */
export async function uploadAvatar(email, file) {
  const formData = new FormData();
  formData.append('email', email);
  formData.append('avatar', file);
  const res = await fetch(`${API_BASE}/auth/avatar`, { method: 'POST', body: formData });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Avatar upload failed');
  return data;
}

/**
 * Permanently delete an account (requires password confirmation).
 */
export async function deleteAccount(email, password) {
  const res = await fetch(`${API_BASE}/auth/account`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Account deletion failed');
  return data;
}
