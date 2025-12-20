Shared Admin/Web Package Plan

Purpose

- Ensure the web admin reuses the same product schema, attribute conventions, cache rules, and UI tokens/components without losing context.

Artifacts to carry over

- Context docs: admin-context.md, CONTEXT_PROMPT.md (source of truth)
- Theme tokens: src/theme/\* (colors, spacing, typography, variants, shadows, radius)
- UI primitives: src/components/ui/\* (Button, Card, Input, Switch, Chip, Badge, BottomSheet, Divider, QuantitySelector)
- Contracts: Supabase tables and save order from admin-context.md

Package layout (recommended)

- packages/
  - ui/
    - theme/ (colors.js, spacing.js, typography.js, tokens.js, variants.js, etc.)
    - components/ (Button.js, Card.js, Input.js, Switch.js, Chip.js, Badge.js, BottomSheet.js, Divider.js, QuantitySelector.js)
    - README.md (usage guidelines)
  - context/
    - admin-context.md
    - CONTEXT_PROMPT.md

Rules to preserve

- Table names and attribute keys/group_key values
- Save order: products → product_images (delete+insert) → product_attributes (delete+insert)
- Cache key: product:{productId}
- PDP expanded render order: Highlights → Specifications → Description → Nutrition
- No JSONB; Similar Products excluded

Integration checklist (Web Admin)

- Configure Supabase client with same tables
- Port Admin Product Form sections (Basic Info, Images, Highlights, Specs, Add more info)
- Keep UI validation: ignore empty rows, trim long text, prevent duplicate spec keys, optional sections don’t block save
- Implement image reorder and persist sort_order
- Attributes write: use exact keys/group_key per admin-context.md
- Cache: when previewing PDP-like views, respect product:{productId} cache contract

Migration steps

1. Copy admin-context.md and CONTEXT_PROMPT.md
2. Copy src/theme/\* to packages/ui/theme
3. Copy src/components/ui/\* to packages/ui/components
4. Reference tokens/components from the web admin (import from packages/ui)
5. Implement the Admin Product flow per admin-context.md

Notes

- Keep both context files in the repo root or packages/context for easy discovery
- Mobile Admin may be frozen later; web admin becomes primary for product management
- Any deviation must be updated in admin-context.md first
