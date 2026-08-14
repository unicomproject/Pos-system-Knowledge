<!-- title: E-Commerce Implementation Status -->
<!-- status: Active -->
<!-- system: E-Commerce Click & Collect -->
<!-- last_updated: 2026-07-29 -->

# E-Commerce Implementation Status

## Purpose

Track current development progress for the E-Commerce Click & Collect web
application across backend APIs, Angular storefront UI, and user journeys.

This document is the full-stack summary. Backend-specific implementation and QA
status must still live in the backend and testing folders.

## Current Summary

| Area | Status | Notes |
|---|---|---|
| Customer Authentication | Testing | Register, verify email, resend, login, refresh, logout, forgot/reset password, and profile tracking is documented. Latest regression evidence still pending. |
| Storefront Browse | Testing | Tenant resolve, banners, categories, products, best sellers, search, product detail, and category-by-slug tracking is documented. |
| Storefront Fulfillment | Testing | Public fulfillment store and collection-option APIs are documented. Relational repository and entitlement evidence still pending. |
| Catalog Media / Images | Testing | Product, variant, category, and brand image/media asset integration is documented. Azure/manual verification and legacy-column removal are still pending. |
| Storefront Cart | Testing | Cart test matrix and backend status docs are added. Latest regression evidence still pending. |
| Cart Checkout | Implemented | CustomerOnly checkout/click-and-collect flow is documented. |
| Wishlist | Testing | CustomerOnly wishlist APIs and implementation tracking are documented. Latest focused regression evidence still pending. |
| Product Reviews | Testing | Public read and CustomerOnly mutation flows are documented. Latest focused regression evidence still pending. |
| Orders and Tracking | Implemented | My Orders, order detail, cancellation, and tenant status update docs exist. |
| POS Customer / Customer Profile | Testing | Tenant/POS customer creation, update, lookup, order summary, and attach-to-sale tracking is documented. |
| Angular Storefront | Implemented / migrated | Core account and storefront components are built; signal modernization is frontend code status. |

## 1. Customer Authentication

Reference: [[../../03_USER_JOURNEYS/E-commerce/04_New_Customer_Registration_Flow]]

| Capability | Current Status | Tracking |
|---|---|---|
| Login | Testing | [[../Backend/ECommerce/Customer_Auth_Implementation_Status]] |
| Registration | Testing | [[../Backend/ECommerce/Customer_Auth_Implementation_Status]] |
| Verify / Resend Email | Testing | [[../../10_TESTING_QA/Test_Case/22_ECommerce/Customer_Auth_Test_Cases]] |
| Forgot / Reset Password | Testing | [[../../12_INTEGRATIONS/Email_Service_Integration]] |
| Customer Profile | Testing | [[../Backend/ECommerce/Customer_Auth_Implementation_Status]] |

## 2. Storefront Browse And Fulfillment

Reference: [[../../03_USER_JOURNEYS/E-commerce/01_New_Customer_Order_Flow]]

| Capability | Current Status | Tracking |
|---|---|---|
| Tenant resolve, banners, categories, products, best sellers | Testing | [[../Backend/ECommerce/Storefront_Browse_Implementation_Status]] |
| Product detail | Testing | [[../../10_TESTING_QA/Test_Case/22_ECommerce/ECommerce_Storefront_API_Test_Cases]] |
| Search | Testing | [[../Backend/ECommerce/Storefront_Browse_Implementation_Status]] |
| Category by slug | Testing | [[../Backend/ECommerce/Storefront_Browse_Implementation_Status]] |
| Fulfillment stores and collection options | Testing | [[../Backend/ECommerce/Storefront_Fulfillment_Implementation_Status]] |
| Currency pipeline | Implemented | [[../Backend/ECommerce/Storefront_Currency_Pipeline_Implementation_Status]] |

## 3. Catalog Media And Images

| Capability | Current Status | Tracking |
|---|---|---|
| Product image upload/projection | Testing | [[../Backend/ECommerce/Catalog_Media_Image_Implementation_Status]] |
| Variant image upload/projection | Testing | [[../Backend/ECommerce/Catalog_Media_Image_Implementation_Status]] |
| Category image upload/projection | Testing | [[../Backend/ECommerce/Catalog_Media_Image_Implementation_Status]] |
| Brand logo upload/projection | Testing | [[../Backend/ECommerce/Catalog_Media_Image_Implementation_Status]] |
| Azure Blob storage integration | Testing | [[../Backend/ECommerce/Catalog_Media_Image_Implementation_Status]] |

## 4. Cart And Checkout

| Capability | Current Status | Tracking |
|---|---|---|
| Cart read/add/update/remove/clear | Testing | [[../Backend/ECommerce/Storefront_Cart_Implementation_Status]] / [[../../10_TESTING_QA/Test_Case/21_Cart_Checkout/Storefront_Cart_Test_Cases]] |
| Checkout from cart/read/update/confirm | Implemented | [[../Backend/ECommerce/Storefront_Checkout_Implementation_Status]] / [[../../10_TESTING_QA/Test_Case/21_Cart_Checkout/Storefront_Checkout_Test_Cases]] |

## 5. Wishlist, Reviews, Orders And Customers

| Backend Feature | Current Status | Tracking |
|---|---|---|
| Customer Wishlist | Testing | [[../Backend/ECommerce/Customer_Wishlist_Implementation_Status]] / [[../Backend/Customer_Wishlist_API_Testing_Status]] |
| Product Reviews | Testing | [[../Backend/ECommerce/Product_Review_Implementation_Status]] / [[../Backend/Product_Review_API_Testing_Status]] |
| Customer Orders / Cancellation | Implemented | [[../Backend/ECommerce/Customer_Orders_Implementation_Status]] |
| POS Customer / Customer Profile | Testing | [[../Backend/ECommerce/Customer_Profile_Pos_Customer_Implementation_Status]] |

## Completion Gate

Do not mark the full e-commerce feature `Completed` unless all of the following
are recorded:

- Backend implementation status exists for each feature.
- Test-case markdown exists for each feature.
- Latest test commands and results are recorded.
- PR/commit reference is recorded.
- CustomerAuth, cart, search, category-by-slug, wishlist, reviews, fulfillment,
  and catalog media QA gaps are closed or accepted.
- No unsupported delivery, online payment gateway, coupon, AI, or supplier scope
  is added.

## Related Files

- [[../../03_USER_JOURNEYS/E-commerce/00_ECommerce_User_Flow_Analysis]]
- [[../Backend/ECommerce/Customer_Auth_Implementation_Status]]
- [[../Backend/ECommerce/Storefront_Browse_Implementation_Status]]
- [[../Backend/ECommerce/Storefront_Fulfillment_Implementation_Status]]
- [[../Backend/ECommerce/Catalog_Media_Image_Implementation_Status]]
- [[../Backend/ECommerce/Storefront_Cart_Implementation_Status]]
- [[../Backend/ECommerce/Customer_Wishlist_Implementation_Status]]
- [[../Backend/ECommerce/Product_Review_Implementation_Status]]
- [[../Backend/ECommerce/Customer_Profile_Pos_Customer_Implementation_Status]]
- [[../../10_TESTING_QA/Test_Case/21_Cart_Checkout/Storefront_Cart_Test_Cases]]
- [[../../10_TESTING_QA/Test_Case/22_ECommerce/ECommerce_Storefront_API_Test_Cases]]
- [[../Full_Feature_Status_Index]]

*Tags: #e-commerce #implementation-tracking #status #click-and-collect*