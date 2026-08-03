<!-- title: Product Variant Selection Popup Feature -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-01 -->

# Product Variant Selection Popup Feature

## 1. Purpose

This is the authoritative specification for resolving a sellable product variant and its cart configuration before adding it to a Cashier New Sale cart. Placeholder names, prices, option values, colours, images and recommendations in a reference design are not production data; all content is backend-configured.

## 2. Release Scope

- Included in Release 1 as a production feature.
- The popup has one visible image slot, an optional product-line note, and manually configured Frequently Bought Together recommendations.
- Image galleries/carousels and AI/ML recommendations are excluded from this popup. Shared product-media multi-image support remains unchanged.
- Documentation Ready does not mean database, backend, Flutter, test or production completion.

## 3. Actors And Preconditions

The cashier is authenticated and passes the established feature-entitlement and sale/product permission contracts. The POS device is active and trusted; tenant, outlet, till and active POS sales-channel context are valid; the till session is open; and the product is active, sellable, visible and orderable. No new permission code is defined here.

## 4. Popup Opening And Direct-Add Rules

- An exact active sellable variant barcode/SKU may directly add the resolved variant without opening the popup.
- A product with exactly one valid sellable variant and no required configuration may directly add.
- Multiple valid variants, required option groups, and product-only or ambiguous search/barcode results open the popup.
- A configurable recommendation must resolve its required variant before addition.
- Inactive, unavailable, hidden, unpriced or unsellable products cannot enter the cart.

## 5. Functional Requirements

The popup loads product detail and shows name, optional description, product/resolved-variant SKU, one image, backend-authoritative price/currency, stock status, dynamic option groups, quantity, optional line note and up to three Frequently Bought Together choices. It filters valid combinations, supports valid manual quantity input, and provides Add to Cart and safe close/cancel actions. Initial loading, submission loading, error, retry and conflict states are required. Closing/cancelling never mutates the cart. Submission disables repeated Add actions.

## 6. Single-Image Rules

Resolve the one displayed image in this order:

1. Active POS-channel variant primary image.
2. Active global variant primary image.
3. Active POS-channel product primary image.
4. Active global product primary image.
5. Existing safe placeholder.

Selecting a variant may update this slot. A size-only change does not require another image unless configured for that variant. There is no thumbnail row, gallery, carousel, navigation arrow or multi-image browsing. The popup needs one resolved image reference even though shared `product_images`/media management may store multiple images for other surfaces.

## 7. Variant Option And Resolution Logic

- Selection and matching use option IDs and option-value IDs, never display text. Groups may represent Colour, Size, Style, Portion or any configured dimension.
- All required groups must be selected. Each selection filters remaining values; values that cannot produce an active sellable variant are disabled. When negative stock is not allowed, out-of-stock values are disabled.
- Changing a selection clears incompatible selections. Zero matches is invalid/unavailable; exactly one match resolves the variant; more than one exact match is a configuration-integrity error.
- A default may auto-select only when active, sellable, correctly mapped, priced and permitted by stock policy.
- The resolved variant controls variant ID/code/name, SKU, sales UOM, fractional-quantity rule, authoritative price, stock and displayed image.
- Add to Cart stays disabled until one valid variant is resolved.

## 8. Pricing Rules

Backend resolution requires the correct tenant, active price list, currency, variant, UOM and effective dates. Variant changes may change price. Flutter never authoritatively calculates price, discount, tax or totals; the cart calculation response is final. Preserve established decimal money precision (`numeric(18,4)` in documented snapshots); do not introduce integer rounding.

## 9. Stock And Quantity Rules

- Default quantity is `1`; minimum is the configured minimum or `1`. Zero/negative input is invalid.
- Available stock follows the Inventory module formula: `on_hand_quantity - reserved_quantity - damaged_quantity - quarantine_quantity`, with applicable channel allocation rules.
- When negative stock is disallowed, requested quantity plus the matching existing cart quantity cannot exceed availability. A tracked product without a valid balance has zero availability.
- Quantity is integer unless the resolved variant and UOM allow fractions. Decimal input and plus/minus step follow configured UOM/quantity rules. Manual input is validated; minus disables at minimum and plus at maximum.
- Non-stock-tracked products follow the existing non-stock availability rule.
- Displayed stock is informative. Backend revalidates at cart addition and checkout. A stock change returns a safe conflict and refresh/reselection path.

## 10. Product-Line Note Rules

The product-line note is optional plain text, distinct from order-level customer/internal notes. Maximum length is 500 characters. Trim leading/trailing whitespace; empty becomes `null`. It affects neither price, tax, discount, stock nor authorization and must not appear in normal application logs.

Target persistence path (pending implementation where not evidenced):

```text
Popup -> cart line request/state -> cart calculation -> supported park/hold snapshot
-> recall -> checkout -> sales-order line -> receipt snapshot -> order detail
```

The target is full preservation across this path. Existing local park/recall and older cart/variant code do not prove this target is implemented.

## 11. Frequently Bought Together Rules

Frequently Bought Together means tenant-maintained relationships from the selected source product; it is not the outlet/history-derived **Frequently Sold** discovery segment. Release 1 uses no AI/ML or association mining.

- Return at most three valid recommendations; none is preselected and the cashier must explicitly select each.
- A link may optionally be source-variant-specific and outlet/channel-restricted. Active status and effective dates apply.
- The main product cannot recommend itself; duplicate active relationships are prohibited.
- Each recommendation is a separate cart line with its own quantity and variant identity. A configurable recommendation must resolve its required variant and independently pass product, price and stock validation.
- Recommendations are not modifiers. A recommendation-load failure does not block the main product.
- Where supported, the main and selected recommendations are one logical cart-add operation. Main-product failure must cause no partial recommendation mutation. Cancel adds nothing.

## 12. Cart-Line Identity And Merge Rules

Logical identity comprises variant ID, UOM ID, normalized line note and any actual configurable-modifier identity supported by the product model. Equal identity may merge by quantity; different variants or notes remain separate. Recommendations remain separate lines. Backend recalculates totals after every add or merge.

## 13. API Contract Requirements

All contracts below are implementation targets unless separately verified.

### Product detail

Use or extend `GET /api/v1/pos/products/{productId}?deviceId={deviceId}`. It must return product ID/code/name/description, optional category, currency, `hasVariants`, `requiresConfiguration`, one resolved/fallback image, option groups (ID, code, name, input type, required, sort order), values (ID, code, display name, optional colour/display metadata, sort order), and variants (ID, code/name, SKU, option-value IDs, default/selectable state, unavailable reason, sales UOM, fractional flag, authoritative price, stock-tracked state, available quantity, stock status and resolved image). No image-gallery array is required for this popup.

### Frequently Bought Together

Target: `GET /api/v1/pos/products/{productId}/recommendations?deviceId={deviceId}&type=frequently-bought-together&limit=3`. Return relationship ID, product ID, optional resolved variant ID, name, optional variant name, one image, variant/configuration flags, price/currency, stock status, selectable state and unavailable reason.

### Cart calculation/addition

Use the established target `POST /api/v1/pos/cart/calculate`. Each request line needs client line ID, variant ID, quantity, UOM ID, normalized `lineNote`, source and optional recommendation-parent reference. Each response line needs resolved product/variant snapshots, SKU/name, quantity/UOM, unit price, discount, tax, line total, stock status, validation/conflict code and normalized `lineNote`. Preserve this line contract through checkout, supported park/recall, completed sale and receipt persistence.

## 14. Database Contract Requirements

Reuse existing `products`, `product_variants`, `product_options`, `product_option_values`, `product_variant_option_values`, `product_images`, `media_assets`, `product_barcodes`, `price_lists`, `price_list_items`, `product_inventory_settings`, `inventory_locations`, `inventory_balances` and `product_channel_visibility` contracts. Do not duplicate their fields.

Pending migration requirements (no migration is created by this documentation task):

- `shopping_cart_items.line_note varchar(500) NULL`.
- `checkout_session_lines.line_note varchar(500) NULL`.
- `sales_order_lines.line_note varchar(500) NULL`.
- Authoritative relationship definition: `product_recommendation_links` in [[../../06_DATABASE_KNOWLEDGE/Tables/11_Product_Mapping_Media_Attributes_And_Channel_Visibility_UPDATED]].

## 15. UI And Responsive Behaviour

Desktop and tablet landscape use a large centred dialog; tablet portrait uses an adaptive dialog/sheet; mobile uses a full-screen modal/sheet. The body scrolls while the main action remains reachable. Keyboard opening must not hide the note. Chips wrap, recommendation cards adapt, and content never clips. Back/Escape closes without mutation. Add stays disabled until the main product is valid; submission disables repeated interaction. Do not promote reference-screen pixel values into global tokens.

## 16. Loading, Error And Conflict States

Support initial loading, image fallback, product-detail failure/retry, unavailable product, no sellable variants, incomplete or invalid selection, ambiguous match, missing price, out of stock, invalid quantity, overlong note, changed price/stock, recommendation-only failure, permission denial, invalid/untrusted device, closed till, offline/stale cache, timeout and duplicate-Add prevention. Cached price/stock never overrides backend-final validation.

## 17. Security And Access Control

Enforce authentication, entitlement, established permissions, tenant/outlet isolation, trusted active device, open till, POS channel visibility/orderability and server-side price/stock validation. Reject cross-tenant IDs. Treat notes as untrusted plain text, enforce length/normalization server-side and exclude note text from normal logs.

## 18. Non-Functional Requirements

- Batch product-detail dependencies; no N+1 queries and no unnecessary repeated calls. Filter option combinations in memory after detail load.
- Ensure cancellation/disposal safety, duplicate-tap protection, concurrency-safe backend revalidation and structured logging without line-note text.
- Meet the current POS product-detail performance target; if no numeric target is approved, measure and approve one before implementation rather than inventing it.
- Provide accessible contrast, minimum 44x44 touch targets, keyboard and screen-reader support. Colour selection must also use text/shape/state, never colour alone.

## 19. Testing Requirements

Backend unit tests cover context validation, product/channel validity, ID mapping, zero/one/multiple variant resolution, default selection, price/stock/quantity/note rules, recommendation links and merge identity. API integration tests cover detail, recommendations, cart calculation, checkout, supported hold/recall, completed order/receipt, price/stock conflicts and tenant/permission/device/till rejection. Flutter tests cover direct-add/popup routing, dynamic groups, disabled/reset values, SKU/price/stock/image changes, one-image-only rendering, quantity/note/recommendations, configurable recommendations, loading/error/retry, duplicate submission, cancel, responsiveness, accessibility and overflow. End-to-end coverage follows product tile/search/scan -> popup when required -> variant -> quantity/note/recommendations -> cart -> payment -> completed sale -> receipt.

## 20. Definition Of Done

Do not mark complete until documentation is approved; migrations, backend contracts, Flutter popup and persistence integrations are implemented; automation passes; physical tablet validation passes; price/stock conflicts and permission/device/till/tenant cases pass; and Second Brain tracking matches code evidence.

## 21. Current Status

| Area | Status |
|---|---|
| Documentation | Documentation Ready after this update |
| Database implementation | Implementation Pending |
| Backend implementation | Pending verification/implementation |
| Flutter implementation | Partial existing variant-sheet/direct-add evidence; production popup Implementation Pending |
| Automated tests | Pending |
| Production validation | Pending |

An older `PosProductVariantSheet` reference is evidence of partial selection UI only, not proof of this production feature.

## 22. Related Files

- [[../../01_RELEASE_SCOPE/Release_1_Scope]]
- [[../../03_USER_JOURNEYS/Cashier/04_Start_Sale_Flow]]
- [[../11_Product_Media_Attributes_Channel_Visibility/02_Functional_Rules]]
- [[../12_Product_Option_Variant_Configuration/02_Functional_Rules]]
- [[../14_Pricing_Tax_Management/02_Functional_Rules]]
- [[../16_Inventory_Foundation_Stock_Availability/02_Functional_Rules]]
- [[../20_Unified_Order_Sales/02_Functional_Rules]]
- [[../../05_BACKEND_ARCHITECTURE/API_ENDPOINTS]]
- [[../../06_DATABASE_KNOWLEDGE/Tables/22_Cart_And_Checkout_UPDATED]]
- [[../../07_UI_UX_KNOWLEDGE/POS_App_UI_Rules]]
- [[../../08_FLUTTER_POS_KNOWLEDGE/Flutter_Product_Variant_Popup_Implementation_Specification]]
- [[../../10_TESTING_QA/Test_Case/21_POS_Operations/POS_Product_Variant_Selection_Popup_Test_Cases]]
- [[../../15_IMPLEMENTATION_TRACKING/Flutter/Sales/Product_Variant_Popup_Implementation_Status]]
- [[../../15_IMPLEMENTATION_TRACKING/Backend/CatalogProduct/Pos_Product_Variant_Detail_Implementation_Status]]
