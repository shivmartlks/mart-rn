# Quick-Commerce Product Flow Context

This file summarizes the implemented changes and rules for the shared Admin + User React/React Native codebase using the new schema.

Schema tables:
- products (core only)
- product_images (carousel)
- product_attributes (highlights, specs, long text)

Global rules:
- Do not implement Similar Products logic.
- Do not change existing cache keys.
- Do not introduce JSONB usage.
- Keep UI behavior unchanged except where specified.

User side (Product PDP):
- Initial load fetches ONLY products (core fields) and product_images.
- Renders image carousel, product name/price/discount, 3 static trust boxes, and a button labeled "More product details".
- product_attributes are NOT fetched at initial load.
- On clicking "More product details": lazy-fetch product_attributes unless already in cache; expand inline (no modal/bottom sheet).
- Attribute grouping normalization:
  - highlights: group_key === "highlights"
  - specs: group_key === "details"
  - description: group_key === "description"
  - nutrition: group_key === "nutrition"
- Expanded render order (locked): Highlights (bulleted) → Specifications (key/value) → Description (paragraph) → Nutrition (if present).
- Cache behavior: After first attribute fetch, merge into cached product as attributes; subsequent expands reuse cache without DB calls.

Admin side (Product Add/Edit):
- Mobile-first, single-column, scrollable UI.
- Form sections: Basic Info, Images, Highlights, Specifications, and an "Add more info" toggle (collapsed by default).
- Basic Info: Save ONLY core fields to products.
- Images: picker + reorder; save to product_images by deleting existing images and inserting new ones with sort_order; do NOT write images to products.
- Highlights: single-line repeater; save to product_attributes with key="highlight" and group_key="highlights".
- Specifications: repeater (key+value); save to product_attributes with group_key="details".
- Add more info toggle: Description (key="description", group_key="description") and Nutrition info (optional, key="nutrition_info", group_key="nutrition"); allow only ONE entry for each.
- Save order (locked): Save core product → product_images → product_attributes; delete old rows then insert new rows.
- Validation (UI level only): ignore empty highlights/specs; trim long text; prevent duplicate spec keys; do not block save for empty optional sections.

Implementation status in this workspace:
- User PDP (src/screens/user/ProductDetails.js):
  - Initial load requests products and product_images only; no attributes.
  - "More product details" inline expand triggers lazy load of product_attributes with normalization and caching under product:${productId}. Subsequent expands reuse cache and avoid DB calls.
  - Render order and grouping conform to spec.
  - Image carousel and static trust boxes rendered.
  - Cache keys unchanged.
- Admin Form (src/screens/admin/AdminForm.js):
  - Sections match requirements: Basic Info, Images, Highlights, Specifications, Add more info toggle.
  - Save logic: core product fields saved to products; images saved to product_images (delete then insert with sort_order); attributes saved to product_attributes with required group_key values; description and nutrition single entries; save order respected.
  - UI validation prevents duplicate spec keys, ignores empty entries, trims long text, and does not block save for optional sections.
  - No JSONB usage introduced; Similar Products logic untouched.

Notes:
- Existing cache keys like product:${productId} and cartqty:${userId}:${productId} are preserved.
- If any area already matched behavior, it was left unchanged.