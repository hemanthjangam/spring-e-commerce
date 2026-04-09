# Spring E-Commerce Interview Guide

## 1. Project Summary

This project is a full-stack e-commerce application built with:

- Backend: Spring Boot 3.5, Spring Security, Spring Data JPA, Flyway, MySQL, Stripe, WebSocket/STOMP
- Frontend: React
- Authentication: JWT access token + refresh token cookie
- Database migration: Flyway
- File handling: local file storage for uploaded images

The application supports:

- user registration and login
- JWT-based authentication and role-based authorization
- category and product management
- cart management
- wishlist management
- checkout with Stripe
- order history
- profile and password updates
- image upload for products and categories

This guide is intentionally written for interview preparation. It explains both the current design and the important architectural gaps.

---

## 2. High-Level Architecture

## Backend Layers

The backend mostly follows a standard layered Spring Boot structure:

- `controller`: accepts HTTP requests and returns DTO responses
- `service`: contains business logic
- `repository`: handles database access through Spring Data JPA
- `entity`: database model
- `dto` + `mapper`: API contract and mapping between entity and response/request objects

The most important packages are:

- `auth`: login, JWT parsing, security context
- `users`: user CRUD and password change
- `products`: category/product catalog
- `carts`: anonymous or user-driven cart lifecycle
- `wishlist`: wishlist API
- `orders`: order history and order details
- `payments`: Stripe checkout and webhook handling
- `common`: global exception handling, file storage, logging

## Frontend Layers

The React frontend is organized into:

- `pages`: route-level screens
- `components`: reusable UI pieces
- `contexts`: auth and cart state
- `api.js` and `api/apiClient.js`: HTTP communication
- `utils`: helpers for media URL resolution, API error extraction, auth helpers

---

## 3. Main Request Flows

## 3.1 Authentication Flow

Important files:

- `src/main/java/com/hemanthjangam/store/auth/AuthController.java`
- `src/main/java/com/hemanthjangam/store/auth/JwtAuthenticationFilter.java`
- `src/main/java/com/hemanthjangam/store/auth/SecurityConfig.java`
- `src/main/java/com/hemanthjangam/store/auth/AuthService.java`

How it works:

1. User logs in through `/auth/login`.
2. Spring Security authenticates email/password through `AuthenticationManager`.
3. The app generates:
   - an access token returned in the response body
   - a refresh token stored as an HTTP-only cookie
4. On later requests, the frontend sends `Authorization: Bearer <token>`.
5. `JwtAuthenticationFilter` parses the token and sets the authenticated user id into Spring Security.
6. Services access the current user through `AuthService`.

Interview point:

- This app uses stateless access tokens for APIs, which scales better than server-side sessions.
- The authenticated principal stored in Spring Security is the user id, not a full `UserDetails` object. That simplifies downstream service access.

Current caveat:

- The refresh cookie is marked `Secure`, which is correct in production HTTPS, but may be awkward during local HTTP-only development.

---

## 3.2 Product and Category Flow

Important files:

- `src/main/java/com/hemanthjangam/store/products/ProductController.java`
- `src/main/java/com/hemanthjangam/store/products/ProductService.java`
- `src/main/java/com/hemanthjangam/store/products/ProductRepository.java`
- `src/main/java/com/hemanthjangam/store/products/CategoryService.java`
- `src/main/java/com/hemanthjangam/store/common/FileStorageService.java`

How it works:

- Public users can:
  - view all products
  - filter by category
  - search products
  - view categories
- Admin users can:
  - create products with multipart image upload
  - update products
  - delete products
  - create categories with image upload

Design notes:

- Controllers are relatively thin.
- Services own the logic.
- `ProductDto` is the public API contract.
- Uploaded files are stored on disk and exposed through `/images/**`.

Interview point:

- This is a good example of separating persistence models from API models.
- File upload is intentionally local and simple. For production, object storage like S3 would be better.

---

## 3.3 Cart Flow

Important files:

- `src/main/java/com/hemanthjangam/store/carts/CartService.java`
- `src/main/java/com/hemanthjangam/store/carts/Cart.java`
- `src/main/java/com/hemanthjangam/store/carts/CartItem.java`
- `store-frontend/src/contexts/CartContext.js`

How it works:

1. Frontend creates a cart through `POST /carts`.
2. A cart id is stored in browser storage.
3. Items are added through `POST /carts/{cartId}/items`.
4. Quantity updates happen through `PUT /carts/{cartId}/items/{productId}`.
5. The frontend refreshes the cart badge count after updates.

Good part:

- The frontend now self-recovers if a stale cart id exists in local storage.

Important limitation:

- Cart ownership is weak. A cart is identified only by UUID.
- There is no explicit server-side ownership check linking a cart to a user.
- If someone obtains a cart UUID, they could potentially access it.

Interview answer:

- For a demo project, UUID-based cart identification is acceptable.
- For production, a cart should either belong to:
  - an authenticated user
  - or a signed guest session token

---

## 3.4 Wishlist Flow

Important files:

- `src/main/java/com/hemanthjangam/store/wishlist/WishlistController.java`
- `src/main/java/com/hemanthjangam/store/wishlist/WishlistService.java`
- `src/main/java/com/hemanthjangam/store/wishlist/WishlistRepository.java`
- `src/main/java/com/hemanthjangam/store/wishlist/WishlistItemDto.java`

How it works:

- Only authenticated users can use wishlist APIs.
- Adding a duplicate product throws a conflict-style business exception.
- Removing a missing item throws a not found business exception.
- The API now returns DTOs instead of JPA entities.

Why that matters:

- `spring.jpa.open-in-view` is disabled.
- Returning lazy JPA entities directly from controllers can cause serialization failures.
- Switching to DTOs is the correct design.

Interview point:

- Returning DTOs instead of entities is not only cleaner API design, it also avoids lazy-loading and accidental data leakage problems.

---

## 3.5 Checkout and Order Flow

Important files:

- `src/main/java/com/hemanthjangam/store/payments/CheckoutService.java`
- `src/main/java/com/hemanthjangam/store/payments/StripePaymentGateway.java`
- `src/main/java/com/hemanthjangam/store/orders/Order.java`
- `src/main/java/com/hemanthjangam/store/orders/OrderService.java`
- `src/main/java/com/hemanthjangam/store/orders/OrderRepository.java`

How it works:

1. Authenticated user sends `POST /checkout` with a cart id.
2. Backend loads the cart.
3. If the cart is empty, checkout is rejected.
4. `Order.fromCart(...)` creates an order snapshot from cart items.
5. The order is saved.
6. Stripe checkout session is created.
7. Cart is cleared.
8. Stripe webhook updates order status later.

Good design choice:

- The order stores unit price and total price at checkout time.
- This protects historical order accuracy even if product price changes later.

Important limitation:

- There is no inventory reservation.
- There is no idempotency protection on checkout.
- There is no retry-safe order creation token.

Interview point:

- This project already separates payment session creation from final payment confirmation through webhooks, which is the correct direction.
- In production, checkout should usually be idempotent and inventory-aware.

---

## 4. Database and Migration Design

Important files:

- `src/main/resources/db/migration/V1__initial_migration.sql`
- `src/main/resources/db/migration/V9__fix_schema_and_seed_data.sql`
- `src/main/resources/db/migration/V10__set_demo_user_passwords.sql`
- `src/main/resources/db/migration/V11__seed_storefront_demo_data.sql`

Schema evolution highlights:

- `V1` created core tables
- `V2` added carts
- `V3` added user roles
- `V4` added orders
- `V5` and `V6` added normalized wishlist tables
- `V7` added image URLs
- `V9` fixed money type mismatch and seeded baseline data
- `V10` set known demo passwords
- `V11` seeded richer storefront data and order history

Important interview point:

- Flyway gives versioned, repeatable schema history.
- A key production rule is: do not edit old migrations after they are applied in shared environments.

This project already experienced that kind of risk around `V2`, so that is a real interview lesson.

---

## 5. Security Design

Important files:

- `src/main/java/com/hemanthjangam/store/auth/SecurityConfig.java`
- `src/main/java/com/hemanthjangam/store/auth/JwtAuthenticationFilter.java`
- feature rule classes like `AuthSecurityRules`, `CartSecurityRules`, `WishlistSecurityRules`

What is good:

- stateless security model
- password hashing with BCrypt
- route-level authorization rules
- role-based admin protection
- no plain password storage
- centralized exception handling

What should be improved:

- CORS is hardcoded to `http://localhost:3000`
- no rate limiting on login
- no account lockout / brute-force protection
- no refresh token rotation logic
- no audit trail for sensitive actions

Interview answer:

- For a learning project, this is a solid security baseline.
- For production, add defense-in-depth around token lifecycle, abuse prevention, and observability.

---

## 6. Concurrency and Edge Cases

This is the most important interview section.

## 6.1 If There Is Only 1 Stock Left and 2 Users Buy at the Same Time

Current answer:

- This project does not currently implement actual inventory.
- `Product` has no stock column.
- There is a `StockUpdateDto` and WebSocket publisher, but they are not connected to real stock persistence or checkout enforcement.

So the truthful answer is:

- right now, the system cannot prevent overselling because stock is not part of the domain model

That is the correct interview answer. Do not claim otherwise.

### How this should be designed in production

Add these pieces:

1. Add `stock_quantity` to `products`
2. At checkout or order placement, reduce stock inside a transaction
3. Use either:
   - optimistic locking with `@Version`, or
   - pessimistic locking with `SELECT ... FOR UPDATE`
4. Reject checkout if stock is insufficient
5. Optionally reserve stock for a short window before payment confirmation

### Recommended transaction strategy

For this kind of app, a practical solution is:

- lock the product row during stock deduction
- check `stock_quantity >= requested_quantity`
- decrement stock
- create order
- commit transaction

Example failure scenario:

- Product stock = 1
- User A and User B checkout at the same time
- Without locking:
  - both read stock = 1
  - both succeed
  - stock becomes invalid and oversell happens
- With row lock:
  - first transaction locks row and decrements to 0
  - second transaction waits, then sees 0 and fails

That is the interview-quality explanation.

---

## 6.2 Two Requests Add the Same Product to Wishlist at the Same Time

Current behavior:

- There is a unique key on `(user_id, product_id)`
- Service checks existence before insert

Risk:

- two concurrent requests could both pass the existence check before insert
- one insert succeeds
- the other fails at database uniqueness level

Current quality:

- functionally acceptable
- not perfectly exception-safe unless database uniqueness exception is mapped cleanly

Best production answer:

- rely on the DB unique constraint as the final source of truth
- catch `DataIntegrityViolationException`
- convert it to `AlreadyInWishlistException`

---

## 6.3 Two Checkout Requests for the Same Cart at the Same Time

Current behavior:

- cart is loaded
- order is created from cart
- Stripe session is created
- cart is cleared

Risk:

- without an idempotency key or explicit cart lock, two near-simultaneous checkout requests may create two orders from the same cart

Production-grade solution:

- lock the cart row during checkout
- mark cart as `CHECKOUT_IN_PROGRESS`
- or use an idempotency key per checkout request

Interview answer:

- This is not fully protected today.
- The correct production fix is idempotent checkout plus transactional cart locking.

---

## 6.4 Product Price Changes While an Item Is Already in Cart

Current behavior:

- cart line total is computed from live product price
- order item price is copied at checkout time

Meaning:

- cart reflects current product price
- order preserves historical checkout price

This is a reasonable choice for a demo and many real stores behave similarly.

Interview point:

- carts are usually not legal contracts
- the order snapshot is the important immutable financial record

---

## 6.5 User Deletes a Product That Exists in Old Orders

Current schema:

- `order_items.product_id` references `products.id`

Implication:

- deleting a referenced product may fail due to foreign key constraints

This is usually good because:

- historical orders should not lose product linkage accidentally

Production improvement:

- use soft delete for products
- keep old products hidden from catalog but retained for historical references

---

## 6.6 Stale Cart ID in Browser Storage

Current behavior:

- frontend recovers from stale cart id
- it resets local cart state and creates a new cart

This is a good UX hardening improvement already present in the project.

---

## 6.7 Expired Access Token During Wishlist or Cart Action

Current behavior:

- frontend clears auth storage when API returns `401` or `403`
- user is effectively logged out and must authenticate again

Production improvement:

- silent token refresh using refresh token flow before forcing logout

---

## 7. Real-Time Updates

Important files:

- `src/main/java/com/hemanthjangam/store/common/RealTimeService.java`
- `src/main/java/com/hemanthjangam/store/config/WebSocketConfig.java`
- `store-frontend/src/utils/useWebSocket.js`

Current reality:

- WebSocket/STOMP infrastructure exists
- a stock update DTO exists
- but real stock persistence does not exist

Interview answer:

- The app contains the real-time communication foundation, but inventory broadcasting is only partially implemented.
- This is a useful talking point: the transport exists, but the business capability is incomplete.

That is a better answer than pretending inventory is done.

---

## 8. API and DTO Design

Good practices already visible:

- DTOs for product, cart, order, and wishlist APIs
- centralized exception handling through `GlobalExceptionHandler`
- validation annotations on request DTOs
- MapStruct for mapping

Why this matters:

- controllers stay small
- API contracts remain stable even if entities change
- sensitive fields like password are not exposed

Interview point:

- DTOs are especially important once lazy JPA relations and serialization enter the picture

---

## 9. Important Technical Strengths

These are strong talking points in an interview:

- Spring Boot layered architecture
- JWT stateless security
- Flyway migration-based schema control
- DTO and mapper-based API design
- Stripe webhook-driven payment status updates
- React frontend integrated with backend DTOs
- graceful frontend recovery for stale cart state
- seeded demo data for end-to-end testing
- order snapshot preserves historical price accuracy

---

## 10. Important Technical Weaknesses

These are the honest limitations to mention if asked:

- no real inventory model
- no oversell prevention
- cart ownership model is weak
- checkout is not idempotent
- no soft delete strategy for products
- minimal automated test coverage
- refresh token lifecycle is basic
- local file storage is not cloud-ready
- WebSocket inventory updates are not fully connected to business logic

Being able to explain these clearly is better than over-claiming production readiness.

---

## 10.1 Existing System vs Improvement Plan

This section is useful when an interviewer asks:

- "What is already implemented?"
- "What would you improve next?"
- "What is the gap between the current system and a production system?"

## Authentication

Existing system:

- login is implemented with JWT access token
- refresh token flow exists
- passwords are hashed with BCrypt
- role-based authorization exists for admin endpoints

Needs improvement:

- refresh token rotation can be made stronger
- login throttling and brute-force protection should be added
- better audit logging for sensitive actions would help

## Product Catalog

Existing system:

- categories and products are implemented
- search is implemented
- admin can create/update/delete products
- image upload is implemented
- DTO-based APIs are in place

Needs improvement:

- soft delete should be used instead of hard delete for products
- search can be improved with ranking/full-text capabilities
- pagination should be added for large catalogs

## Inventory

Existing system:

- a stock update DTO exists
- WebSocket infrastructure exists
- there is a real-time service for stock update publishing

Needs improvement:

- there is no actual stock column in the product model
- there is no inventory deduction logic
- there is no concurrency control for overselling
- stock reservation on checkout is not implemented

Interview-safe summary:

- "The real-time foundation exists, but true inventory management is still a planned improvement."

## Cart

Existing system:

- cart creation works
- add/update/remove/clear cart works
- frontend handles stale cart ids better now
- totals are calculated dynamically from cart items

Needs improvement:

- cart ownership should be stronger
- server-side validation should tie guest carts or user carts more safely to the requester
- cart expiration and cleanup strategy can be added

## Wishlist

Existing system:

- authenticated wishlist APIs exist
- duplicate prevention exists
- wishlist now returns DTOs instead of raw entities
- frontend can add/remove items cleanly

Needs improvement:

- database uniqueness violations should be translated explicitly in case of race conditions
- wishlist could support bulk actions or move-to-cart flow

## Checkout and Orders

Existing system:

- checkout API exists
- cart is converted into an order snapshot
- Stripe checkout session is created
- webhook updates final payment status
- order history works

Needs improvement:

- checkout should be idempotent
- order creation should be protected against duplicate concurrent requests
- inventory validation should happen before checkout confirmation
- payment retry handling can be more robust

## Database and Migrations

Existing system:

- Flyway is in place
- schema is versioned
- seed/demo data exists
- order price type mismatch was fixed in later migrations

Needs improvement:

- old migrations should never be edited once shared
- test data and production data strategy should be separated more clearly
- migration validation and repair process should be documented for teams

## File Storage

Existing system:

- multipart file upload works
- uploaded files are served through a static resource mapping

Needs improvement:

- local disk storage should be replaced with cloud/object storage in production
- image validation and resizing can be added
- cleanup of orphaned files can be automated

## Testing

Existing system:

- application boot test passes
- frontend build and test pass
- major flows were manually validated

Needs improvement:

- integration tests should cover login, cart, wishlist, checkout, and orders
- concurrency tests should be added for inventory and checkout
- API contract tests would improve regression safety

## Frontend

Existing system:

- React storefront is rebuilt with a cleaner UI
- cart, wishlist, login, register, profile, orders, and search are implemented
- image URL handling is more robust
- stale auth/cart recovery is improved

Needs improvement:

- silent refresh can improve session continuity
- better loading skeletons and optimistic UI can improve UX
- component-level tests should be expanded

## Best Interview Answer Format

When asked to compare current system and improvement plan, use this structure:

1. "Currently, the system supports X, Y, and Z."
2. "The main limitation today is A."
3. "The next improvement would be B, because it solves A safely."

Example:

> Currently, the system supports cart, checkout, and order creation. The main limitation is that inventory is not implemented, so overselling is still possible. The next improvement would be adding transactional stock deduction with locking so concurrent checkouts cannot buy the same final unit.

---

## 11. How to Explain Design Patterns Used

Patterns visible in the project:

- Layered Architecture
  - controller -> service -> repository
- DTO Pattern
  - decouples entities from API responses
- Mapper Pattern
  - MapStruct handles repetitive conversion
- Strategy/Abstraction Pattern
  - `PaymentGateway` abstraction allows Stripe implementation to be swapped
- Exception Translation
  - global exception handler converts Java exceptions to HTTP responses

Interview phrasing:

- "I kept the project in a clean layered architecture, used DTOs and mappers to avoid leaking JPA entities, and introduced an abstraction around payment gateway integration so the checkout flow is not tightly coupled to Stripe."

---

## 12. If an Interviewer Asks “What Would You Improve Next?”

A strong answer:

1. Add real inventory with row-level locking or optimistic locking
2. Make checkout idempotent
3. Bind carts to authenticated users or signed guest sessions
4. Add integration tests for auth, checkout, wishlist, and order flows
5. Move file storage to cloud object storage
6. Add observability:
   - structured logs
   - request tracing
   - metrics
7. Add soft delete and admin audit logs

That roadmap shows you understand the difference between a clean demo and a production system.

---

## 13. Short Interview Pitch

Use this if you need to summarize the project quickly:

> This is a Spring Boot e-commerce application with JWT authentication, role-based admin flows, product and category management, cart and wishlist modules, Stripe checkout integration, and order history. I structured it using controller-service-repository layers, DTOs, and Flyway migrations. One thing I’m careful to explain is that while the app supports checkout and real-time infrastructure, true inventory locking is not implemented yet, so oversell prevention would be the next production-grade improvement.

---

## 14. Final Honest Assessment

This project is good for interviews because it demonstrates:

- full-stack thinking
- backend modularity
- authentication and authorization
- relational data modeling
- payment integration
- migration-based schema evolution
- practical frontend/backend integration

It is not yet a production-hardened commerce platform, mainly because inventory concurrency and checkout idempotency are still missing.

That is exactly the kind of honest, technically mature assessment interviewers usually appreciate.
