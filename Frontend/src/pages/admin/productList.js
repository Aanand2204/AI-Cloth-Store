import { state } from '../../services/state.js';
import { deleteProduct } from '../../services/api_v2.js';
import { editProduct } from './productForm.js';

/**
 * The grid of existing products with Edit/Delete actions.
 */
export function renderProductList() {
  return `
    <h2 class="product-list-title">Product List</h2>
    <div class="product-list-grid">
      ${state.productList.map(p => `
        <div class="product-list-item">
          <img src="${p.image}" alt="${p.name}" />
          <h3>${p.name}</h3>
          <p>${p.description}</p>
          <p class="price">₹${p.price}</p>
          <p class="meta">Category: ${p.category}</p>
          <p class="meta">Sizes: ${p.size?.join(', ') || 'N/A'}</p>
          <div class="product-actions">
            <button class="edit-btn" data-id="${p.id}">Edit</button>
            <button class="delete-btn" data-id="${p.id}">Delete</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

export function setupProductListEvents(rerender) {
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const product = state.productList.find(p => String(p.id) === String(btn.dataset.id));
      if (product) editProduct(product, rerender);
    });
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => handleDeleteProduct(btn.dataset.id, rerender));
  });
}

async function handleDeleteProduct(id, rerender) {
  await deleteProduct(id);
  state.productList = state.productList.filter(p => String(p.id) !== String(id));
  rerender();
}
