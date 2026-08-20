# Bulk Upload Products via CSV/Excel Implementation Plan

This plan outlines how to add support for uploading a CSV or Excel file to automatically add multiple products to the store. We will use the **Frontend Parsing approach** to take advantage of the existing `/bulk` backend endpoint.

## 1. Create the Upload Placeholder (Frontend)
- **Target File:** `Frontend/src/pages/Admin.js`
- **Action:** Add a new UI section labeled "Bulk Import (CSV/Excel)" in the admin dashboard.
- **Details:** 
  - Add an HTML file input element: `<input type="file" id="bulkUploadInput" accept=".csv, .xlsx" />`.
  - Add a "Upload & Process" button next to it.
  - When the button is clicked, it will grab the file from the input and start the parsing process.

## 2. Parse the File in the Browser
- **Libraries Required:** 
  - `PapaParse` (for CSVs)
  - `SheetJS / xlsx` (for Excel files)
- **Action:** Include these libraries in your frontend via CDN links in `Frontend/index.html`.
- **Details:** 
  - Create a JavaScript function `parseFile(file)` that reads the uploaded file.
  - If the file ends with `.csv`, use `Papa.parse()`.
  - If the file ends with `.xlsx`, use `XLSX.read()`.
  - Convert the parsed rows and columns into an array of JavaScript objects. Example output:
    ```json
    [
      { "name": "Classic T-Shirt", "description": "Cotton tee", "price": 499, "category": "men", "size": "M,L", "color": "Black" }
    ]
    ```

## 3. Format the Data
- **Target File:** `Frontend/src/pages/Admin.js` (inside your parsing function)
- **Action:** Clean up the parsed JSON so it matches the backend model.
- **Details:**
  - Loop through the array of parsed objects.
  - Split comma-separated fields like `size` ("M,L" -> `["M", "L"]`) and `color` ("Black,Blue" -> `["Black", "Blue"]`).
  - Convert `price` strings into numbers.
  - Ensure required fields (`name`, `description`, `price`, `category`) are present.

## 4. Send Data to the Backend
- **Target File:** `Frontend/src/services/api_v2.js`
- **Action:** Add a new API call function `bulkUploadProducts(productsList)`.
- **Details:**
  - The function will take the formatted JSON array and send a `POST` request to the existing backend endpoint: `/products/bulk`.
  - Set the headers to `{'Content-Type': 'application/json'}`.
  - Pass the JSON array in the request body.

## 5. Refresh Admin Dashboard
- **Target File:** `Frontend/src/pages/Admin.js`
- **Action:** Handle the success response.
- **Details:**
  - Once the backend confirms the products were added, show a success alert to the user.
  - Call the `renderAdmin()` function to refresh the product list on the dashboard, displaying the newly uploaded items.




# Handling Images in Bulk Upload

When uploading a CSV or Excel file, you cannot easily embed raw image files directly into the spreadsheet rows. Here are the three primary strategies to handle product images during a bulk upload, ranked by ease of implementation:

## 1. Image URLs (Recommended & Easiest)
This approach leverages the fact that the backend `Product` model already accepts a standard URL string for the `image` property.
- **How it works:** 
  - Add a column named `image` to your CSV/Excel template.
  - Users paste a public web link to their image (e.g., hosted on AWS S3, Imgur, or an existing CDN) into this column.
  - The frontend parser simply passes this string directly to the backend `/products/bulk` endpoint.
- **Pros:** Zero backend changes required. Extremely fast to parse. Standard practice for e-commerce platforms like Shopify.
- **Cons:** Requires the user to host the images somewhere else first.

## 2. Auto-Generate Placeholder Images
This is best if the upload is purely for testing, or if the user plans to manually edit the products later to add real images.
- **How it works:**
  - During the frontend parsing step, check if the `image` field is blank or missing.
  - If it is missing, use JavaScript to inject a placeholder URL (e.g., `https://loremflickr.com/400/500/clothing?lock=${Math.random()}`).
- **Pros:** Prevents broken images on the storefront. Zero backend changes required.
- **Cons:** Products won't have their actual images until manually updated.

## 3. ZIP File Upload (Advanced)
This approach allows users to upload local image files alongside their spreadsheet, but requires significant architectural changes.
- **How it works:**
  - The user creates a `.zip` file containing their CSV and a folder of images (e.g., `shirt.png`, `pants.jpg`).
  - In the CSV, the `image` column simply references the filename (e.g., `shirt.png`).
  - The frontend sends the `.zip` file to a brand new backend endpoint (e.g., `POST /bulk-zip-upload`).
  - The backend unzips the file, reads the CSV, matches the filenames to the actual extracted images, converts the images to Base64 (to match the existing MongoDB schema), and saves them.
- **Pros:** Users don't need to host images externally.
- **Cons:** Requires building a complex backend route, handling zip extraction, and managing file matching logic. 
