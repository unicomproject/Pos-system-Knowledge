import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Rule 3: Zero Quantity Edge Case
    content = content.replace("Opening Stock is required. Must be > 0 to proceed to Outlet Allocation.", "Opening Stock is required. Must be >= 0. If zero, bypass Outlet Allocation.")
    content = content.replace("Opening Quantity must be > 0", "Opening Quantity must be >= 0")
    content = content.replace("Opening Quantity > 0", "Opening Quantity >= 0")
    content = content.replace("Reject zero or negative values", "Reject negative values")
    content = content.replace("Reject zero (0) with validation error", "Zero (0) is valid")
    content = content.replace("Zero (0) is invalid", "Zero (0) is valid")
    content = content.replace("> 0 (greater than zero, not ≥ zero)", ">= 0")
    content = content.replace("Zero is invalid for Quantity tracking", "Zero is valid for Quantity tracking")
    
    content = content.replace("""Opening Quantity = 0
→ REJECT
→ Error: "Opening Quantity must be greater than 0"
→ Do NOT proceed to Outlet Allocation""", """Opening Quantity = 0
→ ACCEPT
→ Outlet Allocation Not Required
→ Proceed to Step 6""")

    content = content.replace("A product with zero opening stock **is not** valid during Product Setup Quantity flow.", "A product with zero opening stock **is** valid during Product Setup Quantity flow. Outlet allocation is skipped.")
    
    content = content.replace("Quantity tracking method is selected to track physical stock; zero quantity implies intent to track, but no initial quantity. This is a contradiction. Users should skip Product Tracking if no opening stock is intended.", "Zero quantity tracking implies intent to track stock in the future, starting from zero.")

    content = content.replace("Opening Quantity must be greater than 0", "Opening Quantity cannot be negative")

    # Rule 6: Skip Behavior
    content = content.replace("Do NOT add \"Skip for Now\" inside page body.", "Skip is allowed and clears inactive tracking intent.")
    content = content.replace("Skip disabled/hidden", "Skip enabled (acts as Skip Product Tracking)")

    # Rule 7: Stock Owner Lifecycle
    content = content.replace("ProductVariantId (the canonical default sellable variant for this SIMPLE product)", "SimpleStockOwnerReference (Backend implementation audit must determine if this maps to ProductId, draft Variant identifier, or existing ProductVariantId)")
    content = content.replace("Both identifiers must be resolved and validated", "Stock owner reference must be resolved")

    # Rule 8: Unit Cost Permission
    content = content.replace("Read-only, currency-formatted", "Read-only if actor has catalog.product_cost.view permission (or current equivalent). Otherwise hidden.")
    content = content.replace("Derived (Opening Quantity × Unit Cost) | Read-only, calculated, currency-formatted", "Derived | Display only if actor has cost permission. Do not leak restricted cost.")

    # Rule 12: Fix Allocation Edit Validation
    content = content.replace("newQuantity <= Remaining", "projectedAllocated <= openingQuantity")

    # Rule 13: Authorized Outlets API
    content = content.replace("GET /api/v1/tenant-admin/outlets?authorizedForUser={userId}", "GET /api/v1/tenant-admin/outlets (IMPLEMENTATION VERIFICATION REQUIRED for exact authorized query)")

    # Rule 15: DTO Names
    content = content.replace("trackingMethod", "trackingMethod (CONCEPTUAL PAYLOAD EXAMPLE)")
    content = content.replace("quantityTracking", "quantityTracking (CONCEPTUAL PAYLOAD EXAMPLE)")
    content = content.replace("openingQuantity", "openingQuantity (CONCEPTUAL PAYLOAD EXAMPLE)")
    content = content.replace("outletAllocations", "outletAllocations (CONCEPTUAL PAYLOAD EXAMPLE)")

    # Rule 16: Error Codes
    content = content.replace("product.quantity.opening_stock_required", "Use existing OneVerz error code (TO BE VERIFIED)")
    content = content.replace("product.quantity.outlet_allocation_mismatch", "Use existing OneVerz error code (TO BE VERIFIED)")
    content = content.replace("product.quantity.duplicate_outlet", "Use existing OneVerz error code (TO BE VERIFIED)")
    content = content.replace("product.quantity.outlet_unauthorized", "Use existing OneVerz error code (TO BE VERIFIED)")
    content = content.replace("product.quantity.opening_stock_zero", "Use existing OneVerz error code (TO BE VERIFIED)")
    content = content.replace("product.quantity.outlet_allocation_zero", "Use existing OneVerz error code (TO BE VERIFIED)")

    # Rule 17: Success Response
    content = content.replace("\"status\": \"SUCCESS\"", "\"status\": \"SUCCESS\" (TO BE VERIFIED)")

    # Rule 18: Publish Architecture
    content = content.replace("INSERT stock_movements", "Invoke existing Inventory domain/service (TO BE VERIFIED)")
    content = content.replace("UPDATE inventory_balances", "Establish resulting outlet/product stock balance (TO BE VERIFIED)")
    content = content.replace("reason = OPENING_STOCK", "use existing movement reason conventions (TO BE VERIFIED)")
    content = content.replace("audit event = PRODUCT_SETUP_PUBLISH_OPENING_STOCK_CREATED", "use existing audit conventions (TO BE VERIFIED)")

    # Rule 20: NFRs
    content = content.replace("Draft Save < 100ms", "Reuse existing system NFRs")
    content = content.replace("Outlet Dropdown < 200ms", "Reuse existing system NFRs")
    content = content.replace("Resume < 200ms", "Reuse existing system NFRs")
    content = content.replace("320px–1024px", "existing responsive target")

    # Rule 14: Permission Ownership
    content = content.replace("tenant.stock.opening", "tenant.stock.opening (IMPLEMENTATION VERIFICATION REQUIRED)")
    content = content.replace("inventory_tracking", "inventory_tracking (IMPLEMENTATION VERIFICATION REQUIRED)")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

process_file(r"C:\Users\user\Desktop\E-Pos\Pos-system-Knowledge\04_MODULE_KNOWLEDGE\10_Product_Core\Tenant_Admin_Add_Product_SIMPLE_Quantity_Opening_Stock_Outlet_Allocation_Specification.md")
process_file(r"C:\Users\user\Desktop\E-Pos\Pos-system-Knowledge\13_DECISIONS_AND_CHANGES\SIMPLE_QUANTITY_OPENING_STOCK_OUTLET_ALLOCATION_CANONICAL_DECISION_2026-09-24.md")
