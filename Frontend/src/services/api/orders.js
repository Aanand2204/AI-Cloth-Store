import { API_BASE } from './common.js';

/**
 * Place a new order directly.
 */
export async function placeOrder(userEmail, productName, quantity = 1, price = 0) {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_email: userEmail, product_name: productName, quantity, price })
  });
  return await res.json();
}

/**
 * Fetch a user's past orders, most recent first.
 */
export async function getOrderHistory(email) {
  const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(email)}`);
  return await res.json();
}
