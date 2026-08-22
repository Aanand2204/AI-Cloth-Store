# Product Routes (products.py)

## Purpose

Manages all product-related operations: adding, viewing, updating, deleting, and bulk-adding products.

## What It Does

1. **Add Product** — Creates a new product with image upload
2. **Get Products** — Retrieves products filtered by category and/or price range
3. **Update Product** — Modifies an existing product's fields
4. **Delete Product** — Removes a single product from the database

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/products` | Add a new product |
| GET | `/products` | Get products (optional filters) |
| PUT | `/products/{id}` | Update a product |
| DELETE | `/products/{id}` | Delete a product |
| DELETE | `/products` | Delete all products |
| POST | `/products/bulk` | Add multiple products at once |

## Filtering

`GET /products` supports three optional query params:

| Param | Type | Example | Description |
|-------|------|---------|-------------|
| `category` | string | `men` | Filter by category (men, women, kids) |
| `min_price` | int | `500` | Minimum price in ₹ |
| `max_price` | int | `2000` | Maximum price in ₹ |

**Examples:**
- `GET /products?category=women` → all women's products
- `GET /products?max_price=1000` → all products under ₹1000
- `GET /products?category=men&max_price=2000` → men's products under ₹2000

## Image Handling

Uploaded product images are stored as Base64 in MongoDB (`data:image/jpeg;base64,...`) and served to the frontend accordingly.
