import { API_BASE, adminHeaders } from './common.js';

/**
 * Fetch products, optionally filtering by category and/or price range.
 */
export async function fetchProducts(category = '', minPrice = null, maxPrice = null) {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (minPrice !== null) params.set('min_price', minPrice);
  if (maxPrice !== null) params.set('max_price', maxPrice);
  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${API_BASE}/products${query}`);
  return await res.json();
}

/**
 * Generate 500 demo products instantaneously via the backend Python script.
 */
export async function bulkGenerateProducts() {
  const res = await fetch(`${API_BASE}/products/bulk-generate-500`, {
    method: 'POST',
    headers: adminHeaders()
  });
  return await res.json();
}

/**
 * Add a new product to the database (requires FormData for image handling).
 */
export async function addProduct(formData) {
  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: adminHeaders(),
    body: formData
  });
  return await res.json();
}

/**
 * Bulk-add products from an Excel file plus a zip of images.
 * The Excel 'image' column values must match filenames inside the zip.
 */
export async function bulkUploadProducts(excelFile, zipFile) {
  const formData = new FormData();
  formData.append('excel_file', excelFile);
  formData.append('images_zip', zipFile);
  const res = await fetch(`${API_BASE}/products/bulk-upload`, {
    method: 'POST',
    headers: adminHeaders(),
    body: formData
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Bulk upload failed');
  }
  return await res.json();
}

/**
 * Update an existing product by its ID.
 */
export async function updateProduct(id, body, isFormData = false) {
  const options = {
    method: 'PUT',
    headers: adminHeaders(),
    body: isFormData ? body : JSON.stringify(body)
  };
  if (!isFormData) {
    options.headers = { ...options.headers, 'Content-Type': 'application/json' };
  }
  const res = await fetch(`${API_BASE}/products/${id}`, options);
  return await res.json();
}

/**
 * Delete a product by its ID.
 */
export async function deleteProduct(id) {
  const res = await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE', headers: adminHeaders() });
  return await res.json();
}

/**
 * Delete all products from the database.
 */
export async function deleteAllProducts() {
  const res = await fetch(`${API_BASE}/products`, { method: 'DELETE', headers: adminHeaders() });
  return await res.json();
}
