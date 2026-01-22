# Task 7: Advanced Database & API Best Practices

## Part A: Database Indexing
- [x] Add unique index on product name in Product model
- [x] Verify text indexes for search

## Part B: Transactions
- [x] Update order controller: Use sessions for creating orders (reduce stock)
- [x] Update order controller: Use sessions for canceling orders (restore stock)

## Part C: Aggregation
- [x] Add /stats endpoint: Total products per category, avg/min/max prices
- [x] Add /top endpoint: Top 10 most expensive products
- [x] Add /low-stock endpoint: Low-stock alerts
- [x] Add /price-distribution endpoint: Price distribution stats

## Part D: Population & References
- [x] Create Review model
- [x] Create review controller
- [x] Create review routes
- [x] Add POST /api/v1/reviews endpoint
- [x] Add GET /api/v1/products/:productId/reviews endpoint (populated)
- [x] Add GET /api/v1/users/me/reviews endpoint (populated)

## Part E: Database Seeding
- [x] Create seed scripts: seed:users, seed:products, seed:reviews
- [x] Add npm scripts in package.json
- [x] Create seeding files

## Part F: API Best Practices
- [x] Enhance GET /api/v1/products: Add filtering (categoryId, inStock, priceMin/priceMax), sorting (price, createdAt, name), search (text), pagination
- [x] Add GET /api/v1/users: With pagination and sorting
