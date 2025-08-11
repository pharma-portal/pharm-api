import axios from 'axios';

class HubtelService {
  constructor() {
    this.baseURL = 'https://api-txnstatus.hubtel.com';
    this.clientId = process.env.HUBTEL_CLIENT_ID;
    this.clientSecret = process.env.HUBTEL_CLIENT_SECRET;
  }

  // Get authentication token
  async getAuthToken() {
    try {
      const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      
      const response = await axios.post(`${this.baseURL}/oauth2/token`, 
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      
      return response.data.access_token;
    } catch (error) {
      console.error('Error getting Hubtel auth token:', error.message);
      throw new Error('Failed to authenticate with Hubtel');
    }
  }

  // Check transaction status using the new API endpoint
  async checkTransactionStatus(transactionId, clientReference = null, networkTransactionId = null) {
    try {
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
    } catch (error) {
      console.error('Error checking Hubtel transaction status:', error.message);
      
      if (error.response) {
        // Handle specific HTTP errors based on Hubtel documentation
        if (error.response.status === 404) {
          throw new Error('Transaction not found');
        } else if (error.response.status === 403) {
          throw new Error('IP address not whitelisted. Please contact Hubtel to whitelist your IP.');
        } else if (error.response.status === 400) {
          throw new Error('Invalid parameters provided');
        }
      }
      
      throw new Error('Failed to check transaction status');
    }
  }

  // Map Hubtel status to our internal status
  mapHubtelStatus(hubtelStatus) {
    const statusMap = {
      'SUCCESS': 'success',
      'FAILED': 'failed',
      'PENDING': 'pending',
      'CANCELLED': 'cancelled',
      'TIMEOUT': 'failed'
    };
    
    return statusMap[hubtelStatus] || 'pending';
  }

  // Update order with Hubtel status
  async updateOrderWithHubtelStatus(order, transactionId, clientReference = null, networkTransactionId = null) {
    try {
      const hubtelResponse = await this.checkTransactionStatus(transactionId, clientReference, networkTransactionId);
      
      const mappedStatus = this.mapHubtelStatus(hubtelResponse.status);
      
      // Update order with Hubtel status
      order.hubtelStatus = mappedStatus;
      order.hubtelTransactionId = transactionId;
      
      // Store additional transaction details
      if (clientReference) order.hubtelClientReference = clientReference;
      if (networkTransactionId) order.hubtelNetworkTransactionId = networkTransactionId;
      
      // If payment is successful, mark order as paid
      if (mappedStatus === 'success' && !order.isPaid) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
          id: transactionId,
          status: hubtelResponse.status,
          update_time: new Date().toISOString(),
          email_address: order.user?.email || 'hubtel@payment.com',
          clientReference: clientReference,
          networkTransactionId: networkTransactionId
        };
      }
      
      await order.save();
      
      return {
        order,
        hubtelResponse,
        mappedStatus
      };
    } catch (error) {
      console.error('Error updating order with Hubtel status:', error.message);
      throw error;
    }
  }
}

export default new HubtelService(); 