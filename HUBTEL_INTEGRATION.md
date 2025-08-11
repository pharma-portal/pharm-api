# Hubtel Transaction Status Check API Integration

This document describes the integration of Hubtel's Transaction Status Check API into the Pharmacy API.

## Overview

The Hubtel Transaction Status Check API allows you to verify the status of transactions without requiring authentication tokens. The API only requires IP whitelisting for security.

## API Endpoint

**Base URL:** `https://api-txnstatus.hubtel.com`

**Status Check Endpoint:** `GET /transactions/{POS_Sales_ID}/status`

## Authentication

- **No Client ID/Secret Required**: This API does not require authentication tokens
- **IP Whitelisting**: Your server's IP address must be whitelisted with Hubtel
- **403 Forbidden**: Requests from non-whitelisted IPs will receive a 403 error

## Parameters

### Required Parameters
- `clientReference` (String, Mandatory): The client reference of the transaction specified in the request payload

### Optional Parameters
- `hubtelTransactionId` (String, Optional): The transaction ID from Hubtel after successful payment
- `networkTransactionId` (String, Optional): The transaction reference from the mobile money provider

## API Integration in Pharmacy API

### Updated HubtelService

The `utils/hubtelService.js` has been updated to support the new API format:

```javascript
// Check transaction status using the new API endpoint
async checkTransactionStatus(transactionId, clientReference = null, networkTransactionId = null) {
  // Build query parameters
  const params = {};
  if (clientReference) params.clientReference = clientReference;
  if (networkTransactionId) params.networkTransactionId = networkTransactionId;
  
  const response = await axios.get(
    `${this.baseURL}/transactions/${transactionId}/status`,
    {
      params,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
  
  return response.data;
}
```

### API Endpoints

#### 1. Check Order Hubtel Status
**GET** `/api/orders/:id/hubtel-status`

Checks the Hubtel status for a specific order.

**Query Parameters:**
- `clientReference` (optional): Client reference for the transaction
- `networkTransactionId` (optional): Network transaction ID

**Response:**
```json
{
  "order": {
    "_id": "order_id",
    "hubtelStatus": "success",
    "hubtelTransactionId": "transaction_id",
    "isPaid": true
  },
  "hubtelStatus": "success",
  "hubtelResponse": {
    "status": "SUCCESS",
    "data": {...}
  }
}
```

#### 2. Update Order with Hubtel Transaction
**PUT** `/api/orders/:id/hubtel-transaction`

Updates an order with Hubtel transaction details and checks status.

**Request Body:**
```json
{
  "transactionId": "required_transaction_id",
  "clientReference": "optional_client_reference",
  "networkTransactionId": "optional_network_transaction_id"
}
```

#### 3. Check Transaction Status (Direct)
**GET** `/api/orders/hubtel/status/:transactionId`

Directly check the status of a Hubtel transaction without requiring an order.

**Query Parameters:**
- `clientReference` (optional): Client reference for the transaction
- `networkTransactionId` (optional): Network transaction ID

**Response:**
```json
{
  "transactionId": "transaction_id",
  "hubtelResponse": {
    "status": "SUCCESS",
    "data": {...}
  },
  "mappedStatus": "success"
}
```

## Status Mapping

The API maps Hubtel statuses to internal statuses:

| Hubtel Status | Internal Status |
|---------------|-----------------|
| SUCCESS       | success         |
| FAILED        | failed          |
| PENDING       | pending         |
| CANCELLED     | cancelled       |
| TIMEOUT       | failed          |

## Error Handling

The integration handles the following error scenarios:

- **404 Not Found**: Transaction not found
- **403 Forbidden**: IP address not whitelisted
- **400 Bad Request**: Invalid parameters provided

## Usage Examples

### Example 1: Check Order Status
```bash
curl -X GET "http://localhost:5000/api/orders/order_id/hubtel-status?clientReference=REF123" \
  -H "Authorization: Bearer your_token"
```

### Example 2: Update Order with Transaction
```bash
curl -X PUT "http://localhost:5000/api/orders/order_id/hubtel-transaction" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_token" \
  -d '{
    "transactionId": "HUBTEL_TXN_123",
    "clientReference": "ORDER_REF_456",
    "networkTransactionId": "NETWORK_TXN_789"
  }'
```

### Example 3: Direct Transaction Status Check
```bash
curl -X GET "http://localhost:5000/api/orders/hubtel/status/HUBTEL_TXN_123?clientReference=REF123" \
  -H "Authorization: Bearer your_token"
```

## Setup Requirements

1. **IP Whitelisting**: Contact Hubtel to whitelist your server's IP address
2. **Environment Variables**: Ensure your environment is properly configured
3. **Error Monitoring**: Monitor for 403 errors which indicate IP whitelisting issues

## Security Considerations

- All endpoints require authentication via JWT tokens
- IP whitelisting is handled by Hubtel
- No sensitive credentials are stored in the application
- All API calls are logged for monitoring purposes

## Testing

To test the integration:

1. Ensure your IP is whitelisted with Hubtel
2. Use the provided endpoints with valid transaction IDs
3. Monitor the response status and error handling
4. Verify that order statuses are properly updated

## Troubleshooting

### Common Issues

1. **403 Forbidden Error**
   - Contact Hubtel to whitelist your IP address
   - Verify the IP address being used by your server

2. **404 Not Found Error**
   - Verify the transaction ID is correct
   - Check if the transaction exists in Hubtel's system

3. **400 Bad Request Error**
   - Verify all required parameters are provided
   - Check parameter format and values

### Support

For issues with the Hubtel API:
- Contact Hubtel support for IP whitelisting
- Refer to Hubtel's official API documentation
- Check Hubtel's status page for service updates 