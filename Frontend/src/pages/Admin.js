import { state } from '../services/state.js';
import { fetchProducts } from '../services/api_v2.js';
import { renderHeader } from '../components/Header.js';
import { renderQuickActions, setupQuickActionsEvents } from './admin/quickActions.js';
import { renderBulkImport, setupBulkImportEvents } from './admin/bulkImport.js';
import { renderProductForm, setupProductFormEvents } from './admin/productForm.js';
import { renderProductList, setupProductListEvents } from './admin/productList.js';

/**
 * Render the Admin dashboard page to manage products.
 */
export async function renderAdmin() {
  const data = await fetchProducts();
  state.productList = data;

  document.getElementById('app').innerHTML = `
    ${renderHeader()}
    <div class="admin-page">
      ${renderQuickActions()}
      ${renderBulkImport()}
      ${renderProductForm()}
      ${renderProductList()}
    </div>
  `;

  setupQuickActionsEvents(renderAdmin);
  setupBulkImportEvents(renderAdmin);
  setupProductFormEvents(renderAdmin);
  setupProductListEvents(renderAdmin);
}
