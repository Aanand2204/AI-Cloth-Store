import { state, resetAdminForm } from '../../services/state.js';
import { addProduct, updateProduct } from '../../services/api_v2.js';

/**
 * The add/edit product form card.
 */
export function renderProductForm() {
  return `
    <div class="admin-form">
      <h2 class="admin-form-title">${state.isEditing ? 'Edit Product' : 'Add New Product'}</h2>
      <div class="form-grid">
        <input placeholder="Name" class="form-input" id="adminName" value="${state.adminForm.name}" />
        <input placeholder="Description" class="form-input" id="adminDesc" value="${state.adminForm.description}" />
        <input placeholder="Price" type="number" class="form-input" id="adminPrice" value="${state.adminForm.price || ''}" />

        <div class="form-col-span">
          <label class="form-label">Category:</label>
          <div class="category-buttons" id="adminCategoryButtons">
            ${['men', 'women', 'kids'].map(cat => `
              <button class="category-btn ${state.adminForm.category === cat ? 'active' : ''}" data-cat="${cat}">${cat.charAt(0).toUpperCase() + cat.slice(1)}</button>
            `).join('')}
          </div>
        </div>

        <div class="form-col-span">
          <label class="form-label">${state.isEditing ? 'Change Image (optional):' : 'Product Image:'}</label>
          <input type="file" accept="image/png, image/jpeg, image/jpg" id="adminImage" class="form-input" style="width: 100%;" />
          ${state.adminForm.image && !state.imageFile ? `<p style="font-size: 0.875rem; color: #6b7280; margin-top: 0.5rem;">Current image: ${state.adminForm.image}</p>` : ''}
        </div>

        <div class="form-col-span">
          <label class="form-label">Select Sizes:</label>
          <div class="checkbox-group">
            ${['S', 'M', 'L', 'XL', 'XXL'].map(size => `
              <label class="checkbox-label">
                <input type="checkbox" ${state.adminForm.size?.includes(size) ? 'checked' : ''} data-size="${size}" />
                <span>${size}</span>
              </label>
            `).join('')}
          </div>
        </div>

        <div class="form-col-span">
          <label class="form-label">Color:</label>
          <input placeholder="Enter color (e.g., Black, Blue, Red)" class="form-input" style="width: 100%;" id="adminColor" value="${Array.isArray(state.adminForm.color) ? state.adminForm.color.join(', ') : state.adminForm.color || ''}" />
        </div>
      </div>

      <div class="form-actions">
        ${state.isEditing ? `
          <button id="updateProductBtn" class="btn btn-blue">Update Product</button>
          <button id="cancelEditBtn" class="btn btn-outline">Cancel</button>
        ` : `
          <button id="addProductBtn" class="btn btn-success">Add Product</button>
        `}
      </div>
    </div>
  `;
}

export function setupProductFormEvents(rerender) {
  document.querySelectorAll('[data-cat]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.adminForm.category = btn.dataset.cat;
      rerender();
    });
  });

  document.querySelectorAll('[data-size]').forEach(cb => {
    cb.addEventListener('change', () => {
      const size = cb.dataset.size;
      const currentSizes = state.adminForm.size || [];
      if (cb.checked) {
        state.adminForm.size = [...currentSizes, size];
      } else {
        state.adminForm.size = currentSizes.filter(s => s !== size);
      }
    });
  });

  document.getElementById('adminImage')?.addEventListener('change', (e) => {
    state.imageFile = e.target.files?.[0] || null;
  });

  document.getElementById('addProductBtn')?.addEventListener('click', () => handleAddProduct(rerender));
  document.getElementById('updateProductBtn')?.addEventListener('click', () => handleUpdateProduct(rerender));
  document.getElementById('cancelEditBtn')?.addEventListener('click', () => {
    resetAdminForm();
    rerender();
  });
}

/**
 * Prepopulate the form for editing an existing product.
 */
export function editProduct(product, rerender) {
  state.isEditing = true;
  state.editId = product.id;
  state.imageFile = null;
  const colorValue = product.color ? (typeof product.color === 'string' ? product.color.split(',').map(c => c.trim()) : product.color) : [];
  state.adminForm = {
    name: product.name,
    description: product.description,
    price: product.price,
    category: product.category,
    image: product.image,
    size: product.size || [],
    color: colorValue
  };
  rerender();
}

async function handleAddProduct(rerender) {
  const adminForm = state.adminForm;
  adminForm.name = document.getElementById('adminName').value;
  adminForm.description = document.getElementById('adminDesc').value;
  adminForm.price = Number(document.getElementById('adminPrice').value);
  adminForm.color = document.getElementById('adminColor').value.split(',').map(c => c.trim()).filter(c => c);

  if (!adminForm.name || !adminForm.description || !adminForm.price || !adminForm.category) {
    alert('Please fill in all fields');
    return;
  }

  const formData = new FormData();
  formData.append('name', adminForm.name);
  formData.append('description', adminForm.description);
  formData.append('price', String(adminForm.price));
  formData.append('category', adminForm.category);
  formData.append('size', adminForm.size?.join(',') || 'M,L');
  formData.append('color', adminForm.color?.join(', ') || 'Black');
  if (state.imageFile) formData.append('image', state.imageFile);

  await addProduct(formData);
  alert('Product Added ✅');
  resetAdminForm();
  rerender();
}

async function handleUpdateProduct(rerender) {
  const adminForm = state.adminForm;
  adminForm.name = document.getElementById('adminName').value;
  adminForm.description = document.getElementById('adminDesc').value;
  adminForm.price = Number(document.getElementById('adminPrice').value);
  adminForm.color = document.getElementById('adminColor').value.split(',').map(c => c.trim()).filter(c => c);

  if (!adminForm.name || !adminForm.description || !adminForm.price || !adminForm.category) {
    alert('Please fill in all fields');
    return;
  }

  if (state.imageFile) {
    const formData = new FormData();
    formData.append('name', adminForm.name);
    formData.append('description', adminForm.description);
    formData.append('price', String(adminForm.price));
    formData.append('category', adminForm.category);
    formData.append('size', adminForm.size?.join(',') || 'M,L');
    formData.append('color', adminForm.color?.join(', ') || 'Black');
    formData.append('image', state.imageFile);
    await updateProduct(state.editId, formData, true);
  } else {
    await updateProduct(state.editId, { ...adminForm, size: adminForm.size || ['M', 'L'], color: adminForm.color || ['Black'] });
  }

  alert('Product Updated ✅');
  resetAdminForm();
  rerender();
}
