/**
 * Read-only order history list — no events to wire.
 */
export function renderOrderHistory(orders) {
  return `
    <div style="background: white; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); padding: 2rem; margin-bottom: 1.5rem;">
      <h2 class="admin-form-title" style="margin-top: 0;">Order History</h2>
      ${orders.length === 0 ? `
        <p style="color: #6B7280;">No orders yet.</p>
      ` : `
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          ${orders.map(o => `
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #E5E7EB; padding-bottom: 1rem;">
              <div>
                <p style="font-weight: bold; color: #111827;">${o.product_name}</p>
                <p style="color: #9CA3AF; font-size: 0.85rem;">Qty: ${o.quantity}${o.created_at ? ` • ${new Date(o.created_at).toLocaleDateString()}` : ''}</p>
              </div>
              <p style="font-weight: bold;">₹${o.price * o.quantity}</p>
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;
}
