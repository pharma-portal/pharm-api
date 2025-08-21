# Hubtel Status Check Endpoints - Test Commands

## Prerequisites
1. **Login first** to get a JWT token
2. **Replace placeholders** with actual values
3. **Use port 5600** (not 5000)

## 1. Login to Get JWT Token

```bash
curl -X POST http://localhost:5600/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Save the token** from the response for the next requests.

## 2. Test Order Hubtel Status

```bash
curl -X GET http://localhost:5600/api/orders/YOUR_ORDER_ID/hubtel-status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Replace:**
- `YOUR_ORDER_ID` with actual order ID
- `YOUR_JWT_TOKEN` with token from login

## 3. Test Hubtel Transaction Status

```bash
curl -X GET http://localhost:5600/api/orders/hubtel/status/YOUR_TRANSACTION_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Replace:**
- `YOUR_TRANSACTION_ID` with actual Hubtel transaction ID
- `YOUR_JWT_TOKEN` with token from login

## 4. Test All Orders Hubtel Status

```bash
curl -X GET http://localhost:5600/api/orders/hubtel/all \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Replace:**
- `YOUR_JWT_TOKEN` with token from login

## 5. Postman Collection

You can also import these into Postman:

### Login Request
- **Method**: POST
- **URL**: `http://localhost:5600/api/users/login`
- **Body**: 
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

### Order Hubtel Status
- **Method**: GET
- **URL**: `http://localhost:5600/api/orders/{{orderId}}/hubtel-status`
- **Headers**: `Authorization: Bearer {{token}}`

### Hubtel Transaction Status
- **Method**: GET
- **URL**: `http://localhost:5600/api/orders/hubtel/status/{{transactionId}}`
- **Headers**: `Authorization: Bearer {{token}}`

### All Orders Hubtel Status
- **Method**: GET
- **URL**: `http://localhost:5600/api/orders/hubtel/all`
- **Headers**: `Authorization: Bearer {{token}}`

## 6. How to Get Test Data

### Order ID
- Create an order first using the checkout endpoint
- Check your database for existing orders
- Use the order ID from the response

### Transaction ID
- Get this from Hubtel after a successful payment
- Check your database for orders with `hubtelTransactionId`
- Use the transaction ID from the checkout response

## 7. Expected Responses

### Success Response
```json
{
  "success": true,
  "data": {
    "orderId": "order_id",
    "hubtelStatus": "success",
    "isPaid": true,
    "transactionId": "hubtel_txn_id"
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

## 8. Quick Test with Node.js

```bash
# Update the test data in test-hubtel-status-endpoints.js first
node test-hubtel-status-endpoints.js
```

## Troubleshooting

- **401 Unauthorized**: Check your JWT token
- **404 Not Found**: Check the order ID or transaction ID
- **500 Server Error**: Check server logs for details
- **Port issues**: Make sure you're using port 5600
