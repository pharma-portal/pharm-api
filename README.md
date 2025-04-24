# Pharmacy API

A RESTful API for a pharmacy management system built with Node.js, Express, and MongoDB.

## Features

- User Authentication (Login/Register)
- Admin Dashboard
- Drug Management (CRUD operations)
- Prescription Drug Management
- Shopping Cart
- Order Management
- Search and Category Functionality
- Drug Ratings and Reviews
- Brand Management

## Tech Stack

- Node.js
- Express.js
- MongoDB
- JWT Authentication
- ES6+ JavaScript

## Project Structure

```
pharma-api/
├── config/
│   └── db.js
├── controllers/
├── middleware/
├── models/
├── routes/
├── uploads/
├── .env
├── .gitignore
├── package.json
└── server.js
```

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/pharma-api
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRES_IN=30d
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Users
- POST /api/users/register - Register a new user
- POST /api/users/login - User login
- GET /api/users/profile - Get user profile
- PUT /api/users/profile - Update user profile

### Admin
- POST /api/admin/login - Admin login
- PUT /api/admin/password - Update admin password
- GET /api/admin/orders - View all orders
- PUT /api/admin/orders/:id - Update order status

### Drugs
- GET /api/drugs - Get all drugs
- GET /api/drugs/:id - Get single drug
- POST /api/drugs - Add new drug (Admin only)
- PUT /api/drugs/:id - Update drug (Admin only)
- DELETE /api/drugs/:id - Delete drug (Admin only)
- GET /api/drugs/search - Search drugs
- GET /api/drugs/category/:category - Get drugs by category

### Orders
- POST /api/orders - Create new order
- GET /api/orders - Get user orders
- GET /api/orders/:id - Get order details

### Cart
- GET /api/cart - Get user's cart
- POST /api/cart - Add item to cart
- PUT /api/cart/:id - Update cart item
- DELETE /api/cart/:id - Remove item from cart 