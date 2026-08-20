import { state } from '../state.js';

// Use relative paths since the frontend is served directly by the backend!
export const API_BASE = "";

// Identifies the current user to the backend's admin-only routes.
export const adminHeaders = () => ({ 'X-User-Email': state.sessionId });
