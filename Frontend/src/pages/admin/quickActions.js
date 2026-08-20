import { deleteAllProducts, bulkGenerateProducts } from '../../services/api_v2.js';

/**
 * Header row: page title plus the "delete everything" / "generate demo data" buttons.
 */
export function renderQuickActions() {
  return `
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <h1 class="admin-title">Add / Manage Products</h1>
      <div style="display: flex; gap: 0.5rem;">
        <button id="deleteAllBtn" class="btn btn-danger" style="background: #ef4444; color: white; font-weight: bold;">🧨 Delete All Products</button>
        <button id="bulkGenBtn" class="btn btn-warning" style="background: #eab308; color: black; font-weight: bold;">⚡ Generate 500 Demo Products</button>
      </div>
    </div>
  `;
}

export function setupQuickActionsEvents(rerender) {
  document.getElementById('bulkGenBtn')?.addEventListener('click', async () => {
    const btn = document.getElementById('bulkGenBtn');
    btn.textContent = "⏳ Generating...";
    btn.disabled = true;
    try {
      await bulkGenerateProducts();
      alert('500 Products Generated Successfully! Images may take a moment to load from LoremFlickr.');
      rerender();
    } catch (e) {
      alert('Failed to generate products.');
      btn.textContent = "⚡ Generate 500 Demo Products";
      btn.disabled = false;
    }
  });

  document.getElementById('deleteAllBtn')?.addEventListener('click', async () => {
    if (confirm("Are you ABSOLUTELY sure you want to delete EVERY product in the store? This cannot be undone!")) {
      const btn = document.getElementById('deleteAllBtn');
      btn.textContent = "⏳ Deleting...";
      btn.disabled = true;
      try {
        await deleteAllProducts();
        alert('All products have been wiped from the database.');
        rerender();
      } catch (e) {
        alert('Failed to delete products.');
        btn.textContent = "🧨 Delete All Products";
        btn.disabled = false;
      }
    }
  });
}
