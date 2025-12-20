Admin & Product Architecture Context

1. PRODUCT DATA MODEL

- products table: core fields only (name, price, mrp, unit, brand, group_id, visibility)
- product_images table: image_url + sort_order
- product_attributes table: key, value, group_key, sort_order

2. ATTRIBUTE CONVENTIONS

- Highlights:
  key = "highlight"
  group_key = "highlights"
  multiple rows allowed

- Specifications:
  key = snake_case (fabric, gsm, size, etc.)
  group_key = "details"

- Description:
  key = "description"
  group_key = "description"
  only ONE row allowed

- Nutrition:
  key = "nutrition_info"
  group_key = "nutrition"
  only ONE row allowed

3. ADMIN PRODUCT FORM (FINAL UX)

- Mobile-first, scrollable
- Sections:
  a) Basic Info
  b) Images (reorder supported)
  c) Highlights (repeater, value only)
  d) Specifications (key-value repeater)
  e) "Add more info" toggle:
  - Description textarea
  - Nutrition textarea

4. ADMIN SAVE ORDER (LOCKED)
   On Save Product:

1) Save core product → products
2) Save images → product_images (delete + insert)
3) Save attributes → product_attributes (delete + insert)

No JSONB usage anywhere.

5. USER PDP BEHAVIOR

- Initial load:
  - Fetch products (core)
  - Fetch product_images
- Render:

  - Image carousel
  - Name, price, discount
  - 3 trust boxes
  - "More product details" button

- On "More product details":
  - Lazy fetch product_attributes
  - Group attributes:
    highlights → details → description → nutrition
  - Cache attributes with product
  - Do not refetch again

6. CACHE RULES

- Cache key: product:{productId}
- Cached product must contain:
  images: [{ uri }]
  highlights
  specs
  description
  nutrition

- UI must NEVER read raw DB rows.

7. WHAT MUST NOT CHANGE

- Table names
- Attribute keys & group_key values
- Save order
- Cache keys
- PDP rendering order

8. FUTURE NOTES

- Admin Web app will reuse this exact model
- Mobile admin may be frozen later
- Similar Products logic is intentionally excluded

This document is the single source of truth for Product & Admin behavior across platforms.
