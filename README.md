# Spring E-Commerce Store

Full-stack e-commerce application with a Spring Boot backend and a React storefront. The project covers catalog browsing, authentication, cart and wishlist management, checkout with Stripe, order history, image uploads, seeded demo data, and role-based admin catalog management.

## Overview

This repository contains two applications:

- `src/`: Spring Boot backend API and server-side infrastructure
- `store-frontend/`: React storefront client

The backend owns business logic, persistence, authentication, payments, and file handling. The frontend consumes the REST API to provide a storefront experience for customers and a lightweight catalog workflow for admins.

## Core Features

### Customer-facing features

- Browse all products or filter by category
- View product details with image, description, and price
- Search products by name through `/products/search`
- Create an account and log in with JWT-based authentication
- View account/profile data
- Maintain a shopping cart with quantity updates and item removal
- Persist cart identity in browser storage
- Save and remove wishlist items
- Start checkout from the cart
- View order history and individual order details
- Handle checkout success and cancel return flows

### Admin features

- Role-based admin access
- Create categories with image upload
- Create products with multipart form upload
- Edit existing products
- Delete products through the backend API

### Platform and backend features

- JWT access token authentication
- Refresh token endpoint backed by an HttpOnly cookie
- Spring Security authorization rules split by feature module
- MySQL persistence with Spring Data JPA
- Flyway database migrations and seed data
- Stripe checkout session creation
- Stripe webhook handling for order payment status updates
- Static image serving for uploaded files
- OpenAPI/Swagger UI integration
- Global exception handling with structured error responses
- Basic WebSocket/STOMP infrastructure for real-time updates
- H2-backed test profile for application tests

## Architecture

The application follows a modular monolith structure on the backend and a separate SPA frontend.

### High-level flow

1. React frontend calls the Spring Boot REST API.
2. Spring Security validates JWTs and applies feature-level access rules.
3. Controllers delegate to services for business logic.
4. Services use repositories for persistence and mappers for DTO conversion.
5. Flyway manages schema evolution and demo seed data.
6. Stripe checkout creates hosted payment sessions and webhooks update order status.
7. Uploaded product/category images are stored on disk and exposed under `/images/**`.

### Backend module layout

- `auth`: login, refresh, current-user lookup, JWT generation/parsing, auth filter, security config
- `users`: registration, profile data, user CRUD, password change, role model
- `products`: products, categories, search, DTO mapping, image-backed catalog management
- `carts`: cart creation, item add/update/remove, cart total composition
- `wishlist`: authenticated wishlist management
- `orders`: customer order history and order detail access control
- `payments`: checkout orchestration, Stripe gateway integration, webhook processing
- `common`: exception handling, file storage, logging, shared security contracts, real-time service
- `config`: MVC resource mapping, web security support, WebSocket configuration

### Request/response pattern

- Controllers expose REST endpoints.
- Services contain business rules and transactional work.
- Repositories handle database access.
- DTOs and MapStruct reduce entity leakage to the API layer.
- Security rules are kept close to features instead of centralized in one large policy file.

## Tech Stack

### Backend

- Java 21
- Spring Boot 3.5
- Spring Web
- Spring Data JPA
- Spring Security
- Spring Validation
- Spring WebSocket
- Thymeleaf
- Flyway
- MySQL
- H2 for tests
- MapStruct
- Lombok
- JJWT
- springdoc OpenAPI / Swagger UI
- Stripe Java SDK
- spring-dotenv
- Maven

### Frontend

- React 19
- React Router
- Axios
- Fetch API
- React Icons
- SockJS client
- STOMP client
- Create React App / react-scripts

## Repository Structure

```text
.
├── src/
│   ├── main/java/com/hemanthjangam/store/
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── carts/
│   │   ├── common/
│   │   ├── config/
│   │   ├── orders/
│   │   ├── payments/
│   │   ├── products/
│   │   ├── users/
│   │   └── wishlist/
│   └── main/resources/
│       ├── application*.yaml
│       └── db/migration/
├── store-frontend/
│   └── src/
│       ├── components/
│       ├── contexts/
│       ├── hooks/
│       ├── pages/
│       └── utils/
└── docs/
```

## Frontend Pages

- `/`: storefront landing page with featured catalog data
- `/collections`: category listing
- `/category/:categoryId`: category-scoped product listing
- `/products/:id`: product detail page
- `/search?q=`: search results page
- `/cart`: cart management and checkout entry
- `/wishlist`: saved items
- `/orders`: order history and order details
- `/profile`: customer account summary
- `/login`: sign-in page
- `/register`: registration page
- `/products/new`: admin-only create product page
- `/products/:id/edit`: admin-only edit product page
- `/categories/new`: admin-only create category page

## Main API Areas

### Public or mixed-access endpoints

- `GET /products`
- `GET /products/{id}`
- `GET /products/search?q=...`
- `GET /categories`
- `POST /carts`
- `GET /carts/{cartId}`
- `POST /carts/{cartId}/items`
- `PUT /carts/{cartId}/items/{productId}`
- `DELETE /carts/{cartId}/items/{productId}`
- `DELETE /carts/{cartId}/items`
- `POST /users`
- `POST /auth/login`
- `POST /auth/refresh`
- `GET /images/**`
- `POST /checkout/webhook`
- `GET /swagger-ui/index.html`

### Authenticated endpoints

- `GET /auth/me`
- `GET /profile`
- `GET /wishlist`
- `POST /wishlist/{productId}`
- `DELETE /wishlist/{productId}`
- `GET /orders`
- `GET /orders/{orderId}`
- `POST /checkout`

### Admin-restricted endpoints

- `POST /products`
- `PUT /products/{id}`
- `DELETE /products/{id}`
- `POST /categories`

## Authentication and Authorization

- Login returns an access token in the response body.
- A refresh token is also issued as an HttpOnly cookie scoped to `/auth/refresh`.
- Access tokens include user id, email, name, and role claims.
- Roles currently include `USER` and `ADMIN`.
- Feature-specific security rules are registered module by module.
- The frontend stores access-token state in `localStorage`.

## Data and Persistence

- Primary runtime database: MySQL
- Test database: in-memory H2
- Schema changes are tracked through Flyway migrations in `src/main/resources/db/migration`
- Seed data includes demo categories, products, users, wishlist entries, and order history
- Uploaded images are stored in a configurable local directory and served back through Spring MVC

## Seeded Demo Accounts

The repository seeds at least these accounts:

- `demo@store.local` / `demo123`
- `admin@store.local` / `demo123`

The storefront login page also defaults to the demo customer account.

## Environment Variables and Config

The backend reads configuration from `application.yaml`, profile overrides, and environment variables.

### Required or commonly used backend variables

- `JWT_SECRET`: signing key for JWT tokens
- `STRIPE_SECRET_KEY`: Stripe API secret key
- `STRIPE_WEBHOOK_SECRET_KEY`: Stripe webhook signing secret
- `SPRING_DATASOURCE_URL`: MySQL JDBC URL
- `SPRING_DATASOURCE_USERNAME`: database username
- `SPRING_DATASOURCE_PASSWORD`: database password
- `FILE_UPLOAD_DIR`: local directory for uploaded images

### Important backend defaults

- Backend port: `8080` unless overridden by Spring Boot config
- Active profile: `dev`
- Default dev database URL: `jdbc:mysql://localhost:3306/store?createDatabaseIfNotExist=true`
- Default upload directory: `uploads`
- Default `websiteUrl`: `http://localhost:4242`

### Frontend config

- `REACT_APP_API_BASE_URL`: backend base URL, defaults to `http://localhost:8080`

Note: the frontend dev server runs on `3000` by default, while the backend checkout redirect config currently defaults `websiteUrl` to `http://localhost:4242`. If you test Stripe redirects locally, make sure `websiteUrl` matches the actual frontend host you are using.

## Running Locally

### Prerequisites

- Java 21
- Maven
- Node.js and npm
- MySQL
- Stripe test keys if you want to exercise checkout

### 1. Start MySQL

Create or allow the backend to create a database named `store`.

### 2. Configure backend secrets

Example environment setup:

```bash
export JWT_SECRET=replace-with-a-long-random-secret
export STRIPE_SECRET_KEY=sk_test_xxx
export STRIPE_WEBHOOK_SECRET_KEY=whsec_xxx
export SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/store?createDatabaseIfNotExist=true
export SPRING_DATASOURCE_USERNAME=root
export SPRING_DATASOURCE_PASSWORD=
export FILE_UPLOAD_DIR=uploads
```

### 3. Run the backend

```bash
./mvnw spring-boot:run
```

Backend URLs:

- API: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger-ui/index.html`

### 4. Run the frontend

```bash
cd store-frontend
npm install
npm start
```

Frontend URL:

- Storefront: `http://localhost:3000`

## Checkout Flow

1. Customer signs in.
2. Customer creates or reuses a cart.
3. Cart page posts to `POST /checkout`.
4. Backend converts the cart into an order.
5. Stripe checkout session is created through the payment gateway abstraction.
6. Frontend redirects to Stripe-hosted checkout.
7. Stripe webhook posts back to `/checkout/webhook`.
8. Backend updates order payment status.

## File Uploads and Media

- Category creation requires an image file.
- Product creation requires an image file.
- Product editing can replace the existing image.
- Uploaded files are stored in the configured upload directory.
- Media is served from `/images/**`.
- Seed data also references hosted image URLs for demo catalog entries.

## Real-Time Support

The project includes WebSocket/STOMP infrastructure:

- SockJS endpoint: `/ws`
- Broker prefix: `/topic`
- Application prefix: `/app`

There is also a `RealTimeService` for publishing stock updates. The backend support is present, but the current storefront primarily uses REST flows.

## Testing

Backend test support includes:

- `@SpringBootTest` application context test
- H2 in-memory test profile
- Test-specific upload directory under the JVM temp directory

Run backend tests with:

```bash
./mvnw test
```

Run frontend tests with:

```bash
cd store-frontend
npm test
```

## Implementation Notes

- DTO mapping is handled with MapStruct.
- Passwords are encoded with BCrypt.
- CORS currently allows `http://localhost:3000`.
- The frontend handles unauthorized API responses by clearing local auth state.
- Cart state is persisted with `localStorage`, including per-user cart restoration after login.
- Search suggestions in the navbar are debounced on the client and backed by the server search API.

## Current Limitations / Observations

- The root repository README was previously empty; this document now reflects the code currently in the repository.
- Stripe checkout requires valid Stripe credentials and webhook configuration to work end to end.
- Refresh-token cookies are marked `Secure`, which is appropriate for HTTPS deployments and something to keep in mind for local testing.
- WebSocket support exists in the backend and frontend utilities, but the main storefront flow is still centered on REST endpoints.

## Future Documentation Ideas

- Add a Postman collection or OpenAPI examples
- Add Docker setup for MySQL, backend, and frontend
- Add deployment instructions for production
- Add screenshots of key storefront flows
