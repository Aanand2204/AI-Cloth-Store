import { state, login } from '../../services/state.js';
import { loginUser, registerUser, checkIsAdmin } from '../../services/api_v2.js';
import { renderGoogleSignIn, setupGoogleSignIn } from './googleSignIn.js';

let authMode = 'login'; // 'login' | 'register'

/**
 * Email/username + password login & registration forms, shown when logged out.
 */
export function renderAuthForms() {
  return `
    <div class="container" style="padding: 2rem 1rem; max-width: 480px; margin: 0 auto;">
      <h1 style="font-size: 2rem; font-weight: bold; margin-bottom: 2rem;">Your Profile</h1>
      <div style="background: white; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); padding: 2rem;">
        ${authMode === 'login' ? `
          <h2 class="admin-form-title" style="margin-top: 0;">Login</h2>
          ${renderGoogleSignIn()}
          <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; color: #9CA3AF; font-size: 0.8rem;">
            <div style="flex: 1; border-top: 1px solid #E5E7EB;"></div>
            or
            <div style="flex: 1; border-top: 1px solid #E5E7EB;"></div>
          </div>
          <input placeholder="Email or username" class="form-input" id="loginIdentifier" style="width: 100%; margin-bottom: 1rem;" />
          <input type="password" placeholder="Password" class="form-input" id="loginPassword" style="width: 100%; margin-bottom: 1rem;" />
          <button id="loginBtn" class="btn btn-primary" style="width: 100%;">Login</button>
          <p style="text-align: center; margin-top: 1rem; font-size: 0.9rem;">
            No account? <a href="#" id="showRegister" style="color: #2563eb;">Register</a>
          </p>
        ` : `
          <h2 class="admin-form-title" style="margin-top: 0;">Register</h2>
          <input placeholder="Username" class="form-input" id="regUsername" style="width: 100%; margin-bottom: 1rem;" />
          <input type="email" placeholder="Email" class="form-input" id="regEmail" style="width: 100%; margin-bottom: 1rem;" />
          <input type="password" placeholder="Password (min 6 characters)" class="form-input" id="regPassword" style="width: 100%; margin-bottom: 1rem;" />
          <button id="registerBtn" class="btn btn-success" style="width: 100%;">Create Account</button>
          <p style="text-align: center; margin-top: 1rem; font-size: 0.9rem;">
            Already have an account? <a href="#" id="showLogin" style="color: #2563eb;">Login</a>
          </p>
        `}
      </div>
    </div>
  `;
}

export function setupAuthFormsEvents(rerender) {
  if (authMode === 'login') {
    setupGoogleSignIn(rerender);
  }

  document.getElementById('showRegister')?.addEventListener('click', (e) => {
    e.preventDefault();
    authMode = 'register';
    rerender();
  });

  document.getElementById('showLogin')?.addEventListener('click', (e) => {
    e.preventDefault();
    authMode = 'login';
    rerender();
  });

  document.getElementById('loginBtn')?.addEventListener('click', async () => {
    const identifier = document.getElementById('loginIdentifier').value.trim();
    const password = document.getElementById('loginPassword').value;
    if (!identifier || !password) {
      alert('Please enter your email/username and password.');
      return;
    }
    const btn = document.getElementById('loginBtn');
    btn.textContent = 'Logging in...';
    btn.disabled = true;
    try {
      const result = await loginUser(identifier, password);
      login(result.email, result.username);
      state.isAdmin = await checkIsAdmin(state.sessionId);
      rerender();
    } catch (e) {
      alert(e.message);
      btn.textContent = 'Login';
      btn.disabled = false;
    }
  });

  document.getElementById('registerBtn')?.addEventListener('click', async () => {
    const username = document.getElementById('regUsername').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    if (!username || !email || !password) {
      alert('Please fill in username, email, and password.');
      return;
    }
    const btn = document.getElementById('registerBtn');
    btn.textContent = 'Creating account...';
    btn.disabled = true;
    try {
      const result = await registerUser(username, email, password);
      login(result.email, result.username);
      state.isAdmin = await checkIsAdmin(state.sessionId);
      alert('Account created! You are now logged in.');
      rerender();
    } catch (e) {
      alert(e.message);
      btn.textContent = 'Create Account';
      btn.disabled = false;
    }
  });
}
