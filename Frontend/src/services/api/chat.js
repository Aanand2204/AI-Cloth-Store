import { API_BASE } from './common.js';

/**
 * Send a message to the AI Chatbot and await its semantic response.
 */
export async function sendChatMessage(message) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  return await res.json();
}
