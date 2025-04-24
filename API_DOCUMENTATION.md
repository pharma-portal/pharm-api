# Pharmacy API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
The API uses JWT (JSON Web Token) for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_token>
```

## User Endpoints

### Register User
- **URL**: `/users/register`
- **Method**: `POST`
- **Access**: Public
- **Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "123456",
  "phone": "1234567890",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  }
}
```
- **Success Response**: `201 Created`
```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "role": "user",
  "token": "jwt_token"
}
```

### Login User
- **URL**: `/users/login`
- **Method**: `POST`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "john@example.com",
  "password": "123456"
}
```
- **Success Response**: `200 OK`
```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "token": "jwt_token"
}
```

## Admin Endpoints

### Admin Login
- **URL**: `/admin/login`
- **Method**: `POST`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "admin@example.com",
  "password": "123456"
}
```
- **Success Response**: `200 OK`
```json
{
  "_id": "admin_id",
  "name": "Admin",
  "email": "admin@example.com",
  "role": "admin",
  "token": "jwt_token"
}
```

### Update Admin Password
- **URL**: `/admin/password`
- **Method**: `PUT`
- **Access**: Private/Admin
- **Request Body**:
```json
{
  "currentPassword": "123456",
  "newPassword": "newpassword"
}
```
- **Success Response**: `200 OK`
```json
{
  "message": "Password updated successfully"
}
```

## Drug Endpoints

### Get All Drugs
- **URL**: `/drugs`
- **Method**: `GET`
- **Access**: Public
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `keyword`: Search keyword
- **Success Response**: `200 OK`
```json
{
  "drugs": [
    {
      "_id": "drug_id",
      "name": "Drug Name",
      "description": "Drug Description",
      "price": 99.99,
      "brand": "Brand Name",
      "category": "prescription",
      "requiresPrescription": true,
      "inStock": 100,
      "dosageForm": "tablet",
      "strength": "500mg",
      "rating": 4.5,
      "numReviews": 10,
      "image": "/uploads/drugs/image.jpg"
    }
  ],
  "page": 1,
  "pages": 5
}
```

### Create Drug (Admin)
- **URL**: `/drugs`
- **Method**: `POST`
- **Access**: Private/Admin
- **Content-Type**: `multipart/form-data`
- **Request Body**:
```form-data
name: "Drug Name"
description: "Drug Description"
price: 99.99
brand: "Brand Name"
category: "prescription"
requiresPrescription: true
inStock: 100
dosageForm: "tablet"
strength: "500mg"
drugImage: [file]
```
- **Success Response**: `201 Created`

### Update Drug (Admin)
- **URL**: `/drugs/:id`
- **Method**: `PUT`
- **Access**: Private/Admin
- **Content-Type**: `multipart/form-data`
- **Request Body**: Same as Create Drug
- **Success Response**: `200 OK`

## Cart Endpoints

### Get Cart
- **URL**: `/cart`
- **Method**: `GET`
- **Access**: Private
- **Success Response**: `200 OK`
```json
{
  "items": [
    {
      "drug": {
        "_id": "drug_id",
        "name": "Drug Name",
        "price": 99.99,
        "image": "/uploads/drugs/image.jpg",
        "requiresPrescription": true
      },
      "quantity": 2,
      "price": 99.99,
      "prescription": "/uploads/prescriptions/prescription.pdf"
    }
  ],
  "totalAmount": 199.98
}
```

### Add to Cart
- **URL**: `/cart`
- **Method**: `POST`
- **Access**: Private
- **Content-Type**: `multipart/form-data`
- **Request Body**:
```form-data
drugId: "drug_id"
quantity: 2
prescription: [file] (required for prescription drugs)
```
- **Success Response**: `201 Created`

## Order Endpoints

### Create Order
- **URL**: `/orders`
- **Method**: `POST`
- **Access**: Private
- **Request Body**:
```json
{
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "paymentMethod": "credit_card"
}
```
- **Success Response**: `201 Created`

### Get User Orders
- **URL**: `/orders`
- **Method**: `GET`
- **Access**: Private
- **Success Response**: `200 OK`
```json
[
  {
    "_id": "order_id",
    "orderItems": [
      {
        "drug": "drug_id",
        "name": "Drug Name",
        "quantity": 2,
        "price": 99.99,
        "prescription": "/uploads/prescriptions/prescription.pdf"
      }
    ],
    "shippingAddress": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    },
    "paymentMethod": "credit_card",
    "totalPrice": 199.98,
    "status": "pending",
    "isPaid": false,
    "isDelivered": false
  }
]
```

## Testing with Postman

1. **Environment Setup**:
   - Create a new environment in Postman
   - Add variables:
     - `BASE_URL`: http://localhost:5000/api
     - `TOKEN`: (will be set after login)

2. **Collection Setup**:
   - Create a new collection "Pharmacy API"
   - Add folders:
     - Auth
     - Drugs
     - Cart
     - Orders
     - Admin

3. **Testing Flow**:

   a. Register a User:
   ```
   POST {{BASE_URL}}/users/register
   Body: raw (JSON)
   ```

   b. Login:
   ```
   POST {{BASE_URL}}/users/login
   Body: raw (JSON)
   ```
   - Save the token to environment variable:
   ```javascript
   pm.environment.set("TOKEN", pm.response.json().token);
   ```

   c. Add Authorization:
   - For protected routes, add header:
   ```
   Authorization: Bearer {{TOKEN}}
   ```

4. **Testing Prescription Drugs**:
   - When adding prescription drugs to cart:
     - Use form-data
     - Upload prescription file in PDF/image format
     - Set other fields as required

5. **Admin Testing**:
   - Register an admin user (manually set role to "admin" in database)
   - Use admin login endpoint
   - Test admin-specific endpoints with admin token

## Error Responses

All error responses follow this format:
```json
{
  "message": "Error message here",
  "stack": "Error stack trace (development only)"
}
```

Common HTTP Status Codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `404`: Not Found
- `500`: Server Error 