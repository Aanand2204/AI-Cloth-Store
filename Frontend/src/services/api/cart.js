import { API_BASE } from './common.js';

/**
 * Add an item to the shopping cart.
 */
export async function addToCart(userEmail, productName, quantity = 1) {
  const res = await fetch(`${API_BASE}/cart/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_email: userEmail, product_name: productName, quantity })
  });
  return await res.json();
}

/**
 * Fetch all items in the user's cart.
 */
export async function getCart(userEmail) {
  const res = await fetch(`${API_BASE}/cart/${userEmail}`);
  return await res.json();
}

/**
 * Clear the user's cart completely.
 */
export async function clearCart(userEmail) {
  const res = await fetch(`${API_BASE}/cart/${userEmail}`, { method: 'DELETE' });
  return await res.json();
}
