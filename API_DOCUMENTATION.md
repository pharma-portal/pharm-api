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
    "isDelivered": false,
    "hubtelTransactionId": "hubtel_transaction_id",
    "hubtelStatus": "pending"
  }
]
```

### Check Hubtel Transaction Status
- **URL**: `/orders/:id/hubtel-status`
- **Method**: `GET`
- **Access**: Private
- **Success Response**: `200 OK`
```json
{
  "order": {
    "_id": "order_id",
    "hubtelTransactionId": "hubtel_transaction_id",
    "hubtelStatus": "success",
    "isPaid": true,
    "paidAt": "2024-01-01T00:00:00.000Z",
    "paymentResult": {
      "id": "hubtel_transaction_id",
      "status": "SUCCESS",
      "update_time": "2024-01-01T00:00:00.000Z",
      "email_address": "user@example.com"
    }
  },
  "hubtelStatus": "success",
  "hubtelResponse": {
    "status": "SUCCESS",
    "transactionId": "hubtel_transaction_id",
    "amount": 199.98,
    "currency": "GHS"
  }
}
```

### Update Order with Hubtel Transaction ID
- **URL**: `/orders/:id/hubtel-transaction`
- **Method**: `PUT`
- **Access**: Private
- **Request Body**:
```json
{
  "transactionId": "hubtel_transaction_id"
}
```
- **Success Response**: `200 OK`
```json
{
  "order": {
    "_id": "order_id",
    "hubtelTransactionId": "hubtel_transaction_id",
    "hubtelStatus": "success",
    "isPaid": true
  },
  "hubtelStatus": "success",
  "hubtelResponse": {
    "status": "SUCCESS",
    "transactionId": "hubtel_transaction_id",
    "amount": 199.98,
    "currency": "GHS"
  }
}
```

### Get All Orders with Hubtel Status (Admin Only)
- **URL**: `/orders/hubtel/all`
- **Method**: `GET`
- **Access**: Private/Admin
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
- **Success Response**: `200 OK`
```json
{
  "orders": [
    {
      "_id": "order_id",
      "hubtelTransactionId": "hubtel_transaction_id",
      "hubtelStatus": "success",
      "user": {
        "_id": "user_id",
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ],
  "page": 1,
  "pages": 5,
  "total": 50
}
```

### Create Hubtel Checkout URL
- **URL**: `/orders/checkout-url`
- **Method**: `POST`
- **Access**: Private
- **Purpose**: Creates a Hubtel payment session and returns a checkout URL for frontend integration

**Request Body**:
```json
{
  "totalAmount": 0.10,
  "description": "Online Checkout Test",
  "callbackUrl": "http://13.62.90.17:5600/api/orders/hubtel-callback",
  "returnUrl": "https://alleypharmacy.netlify.app",
  "merchantAccountNumber": "2030840",
  "cancellationUrl": "https://alleypharmacy.netlify.app",
  "clientReference": "test14082025",
  "apiUsername": "your_hubtel_api_username",
  "apiKey": "your_hubtel_api_key"
}
```

**Authentication Options:**
- **Method 1**: Set `HUBTEL_CLIENT_ID` and `HUBTEL_CLIENT_SECRET` environment variables
- **Method 2**: Include `apiUsername` and `apiKey` in the request body

**Required Fields:**
- `totalAmount`: Payment amount
- `description`: Payment description
- `callbackUrl`: URL for payment callbacks
- `returnUrl`: URL to redirect after payment
- `merchantAccountNumber`: Your Hubtel merchant account number
- `clientReference`: Unique reference for the transaction

**Optional Fields:**
- `cancellationUrl`: URL to redirect if payment is cancelled
- `apiUsername`: Your Hubtel API username (if not using environment variables)
- `apiKey`: Your Hubtel API key (if not using environment variables)

**What Happens:**
1. Authenticates with Hubtel using your API credentials
2. Calls `https://payproxyapi.hubtel.com/items/initiate` to create payment session
3. Returns checkout URL for frontend integration

**Success Response**: `200 OK`
```json
{
  "success": true,
  "message": "Hubtel checkout URL created successfully",
  "checkoutUrl": "https://payproxyapi.hubtel.com/checkout/session_id",
  "checkoutData": {
    "amount": 0.10,
    "description": "Online Checkout Test",
    "callbackUrl": "http://13.62.90.17:5600/api/hubtel-callback",
    "returnUrl": "https://alleypharmacy.netlify.app",
    "merchantAccountNumber": "2030840",
    "cancellationUrl": "https://alleypharmacy.netlify.app",
    "clientReference": "test14082025",
    "currency": "GHS",
    "items": [
      {
        "name": "Online Checkout Test",
        "quantity": 1,
        "unitPrice": 0.10,
        "totalPrice": 0.10
      }
    ]
  },
  "hubtelResponse": {
    "status": "success",
    "paymentId": "payment_123456",
    "checkoutUrl": "https://payproxyapi.hubtel.com/checkout/session_id"
  },
  "paymentId": "payment_123456",
  "status": "success"
}
```

**Frontend Integration:**
Use the `checkoutUrl` to redirect users to Hubtel's payment interface:
```javascript
// Redirect user to Hubtel payment
window.location.href = response.data.checkoutUrl;
```

### Hubtel Payment Callback
- **URL**: `/hubtel-callback`
- **Method**: `POST`
- **Access**: Public (called by Hubtel)
- **Purpose**: Receives payment status updates from Hubtel

**Callback Data Structure** (from Hubtel):
```json
{
  "transactionId": "HUBTEL_TXN_123",
  "clientReference": "test14082025",
  "status": "SUCCESS",
  "amount": 0.10,
  "currency": "GHS",
  "networkTransactionId": "NETWORK_TXN_789",
  "description": "Online Checkout Test",
  "responseCode": "0000",
  "responseMessage": "Transaction successful",
  "hubtelTransactionId": "HUBTEL_TXN_123",
  "merchantAccountNumber": "2030840"
}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "message": "Callback processed successfully",
  "orderId": "order_id",
  "clientReference": "test14082025",
  "status": "success",
  "isPaid": true
}
```

**What Happens:**
1. Hubtel sends payment status to this endpoint
2. System finds order by `clientReference`
3. Updates order with payment details
4. Marks order as paid if successful
5. Returns confirmation to Hubtel

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