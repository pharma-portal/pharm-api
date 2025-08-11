#!/bin/bash

# Hubtel Integration Testing with cURL
# Update these variables with your actual values

BASE_URL="http://localhost:5000/api"
AUTH_TOKEN="your_jwt_token_here"
ORDER_ID="your_order_id_here"
TRANSACTION_ID="your_hubtel_transaction_id_here"
CLIENT_REFERENCE="TEST_REF_123"

echo "🚀 Hubtel Integration Testing with cURL"
echo "========================================"

# Test 1: Get available orders
echo -e "\n📋 Test 1: Get Available Orders"
curl -X GET "${BASE_URL}/orders/myorders" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -H "Content-Type: application/json"

# Test 2: Check order Hubtel status
echo -e "\n\n🔍 Test 2: Check Order Hubtel Status"
curl -X GET "${BASE_URL}/orders/${ORDER_ID}/hubtel-status?clientReference=${CLIENT_REFERENCE}" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -H "Content-Type: application/json"

# Test 3: Update order with Hubtel transaction
echo -e "\n\n💳 Test 3: Update Order with Hubtel Transaction"
curl -X PUT "${BASE_URL}/orders/${ORDER_ID}/hubtel-transaction" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"transactionId\": \"${TRANSACTION_ID}\",
    \"clientReference\": \"${CLIENT_REFERENCE}\",
    \"networkTransactionId\": \"NETWORK_TXN_456\"
  }"

# Test 4: Direct transaction status check
echo -e "\n\n🔎 Test 4: Direct Transaction Status Check"
curl -X GET "${BASE_URL}/orders/hubtel/status/${TRANSACTION_ID}?clientReference=${CLIENT_REFERENCE}" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -H "Content-Type: application/json"

# Test 5: Get all orders with Hubtel status (Admin)
echo -e "\n\n📊 Test 5: Get All Orders with Hubtel Status (Admin)"
curl -X GET "${BASE_URL}/orders/hubtel/all?page=1&limit=5" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -H "Content-Type: application/json"

echo -e "\n\n✨ Testing completed!" 