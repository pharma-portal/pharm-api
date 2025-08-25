import axios from 'axios';

class HubtelService {
  constructor() {
    this.baseURL = 'https://api-txnstatus.hubtel.com';
    this.clientId = process.env.HUBTEL_CLIENT_ID;
    this.clientSecret = process.env.HUBTEL_CLIENT_SECRET;
    this.customCredentials = null;
  }

  // Set custom API credentials
  setCredentials(clientId, clientSecret) {
    this.customCredentials = { clientId, clientSecret };
  }

  // Get authentication token
  async getAuthToken() {
    try {
      // Use custom credentials if provided, otherwise use environment variables
      const credentials = this.customCredentials || { 
        clientId: process.env.HUBTEL_CLIENT_ID || this.clientId, 
        clientSecret: process.env.HUBTEL_CLIENT_SECRET || this.clientSecret 
      };

      if (!credentials.clientId || !credentials.clientSecret) {
        throw new Error('Hubtel API credentials not provided. Set HUBTEL_CLIENT_ID and HUBTEL_CLIENT_SECRET environment variables or use setCredentials() method.');
      }

      const auth = Buffer.from(`${credentials.clientId}:${credentials.clientSecret}`).toString('base64');
      
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

  // Check transaction status using Basic Auth (same as payment initiation)
  async checkTransactionStatus(transactionId, clientReference = null, networkTransactionId = null) {
    try {
      // Use custom credentials if provided, otherwise use environment variables
      const credentials = this.customCredentials || { 
        clientId: process.env.HUBTEL_CLIENT_ID || this.clientId, 
        clientSecret: process.env.HUBTEL_CLIENT_SECRET || this.clientSecret 
      };

      if (!credentials.clientId || !credentials.clientSecret) {
        throw new Error('Hubtel API credentials not provided. Set HUBTEL_CLIENT_ID and HUBTEL_CLIENT_SECRET environment variables or use setCredentials() method.');
      }

      // Create Basic Auth header (same as your payment initiation)
      const auth = Buffer.from(`${credentials.clientId}:${credentials.clientSecret}`).toString('base64');
      
      // Build query parameters
      const params = {};
      if (clientReference) params.clientReference = clientReference;
      if (networkTransactionId) params.networkTransactionId = networkTransactionId;
      
      console.log('🔍 Checking transaction status with Basic Auth...');
      console.log('Transaction ID:', transactionId);
      console.log('Params:', params);
      
      const response = await axios.get(
        `${this.baseURL}/transactions/${transactionId}/status`,
        {
          params,
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          }
        }
      );
      
      console.log('✅ Transaction status response received');
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
        } else if (error.response.status === 401) {
          throw new Error('Authentication failed. Check your Hubtel credentials.');
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

  // Create Hubtel checkout URL
  async createCheckoutUrl(checkoutData) {
    try {
      const {
        totalAmount,
        description,
        callbackUrl,
        returnUrl,
        merchantAccountNumber,
        cancellationUrl,
        clientReference
      } = checkoutData;

      // Validate required fields
      if (!totalAmount || !description || !callbackUrl || !returnUrl || !merchantAccountNumber || !clientReference) {
        throw new Error('Missing required checkout fields: totalAmount, description, callbackUrl, returnUrl, merchantAccountNumber, clientReference');
      }

      // Get credentials for Basic Authentication
      const credentials = this.customCredentials || { 
        clientId: this.clientId, 
        clientSecret: this.clientSecret 
      };

      if (!credentials.clientId || !credentials.clientSecret) {
        throw new Error('Hubtel API credentials not provided. Set HUBTEL_CLIENT_ID and HUBTEL_CLIENT_SECRET environment variables or use setCredentials() method.');
      }

      // Create Basic Auth header (same as your Postman setup)
      const auth = Buffer.from(`${credentials.clientId}:${credentials.clientSecret}`).toString('base64');

      // Hubtel payment API endpoint for initiating payments
      const paymentApiUrl = 'https://payproxyapi.hubtel.com/items/initiate';

      // Prepare the payment initiation request payload according to Hubtel's API
      // Using the EXACT format that Hubtel expects (as confirmed by user)
      const paymentPayload = {
        totalAmount: parseFloat(totalAmount),
        description: description,
        callbackUrl: callbackUrl.replace('/api/orders/hubtel-callback', '/api/hubtel-callback'),
        returnUrl: returnUrl,
        merchantAccountNumber: merchantAccountNumber,
        cancellationUrl: cancellationUrl || returnUrl,
        clientReference: clientReference
      };

      // Alternative payload format (if the above doesn't work)
      const alternativePayload = {
        amount: parseFloat(totalAmount),
        description: description,
        callbackUrl: callbackUrl.replace('/api/orders/hubtel-callback', '/api/hubtel-callback'),
        returnUrl: returnUrl,
        merchantAccountNumber: merchantAccountNumber,
        cancellationUrl: cancellationUrl || returnUrl,
        clientReference: clientReference
      };

      console.log('📤 Sending payment initiation request to Hubtel:', JSON.stringify(paymentPayload, null, 2));
      console.log('🔑 Using Basic Auth with client ID:', credentials.clientId);
      console.log('🎯 This is the EXACT format Hubtel expects!');

      let response;
      let usedPayload = paymentPayload;

      try {
        // Try the full payload first
        response = await axios.post(paymentApiUrl, paymentPayload, {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        console.log('✅ Full payload worked');
      } catch (error) {
        if (error.response?.status === 400) {
          console.log('⚠️  Full payload failed, trying minimal payload...');
          try {
            // Try minimal payload
            response = await axios.post(paymentApiUrl, alternativePayload, {
              headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
              }
            });
            usedPayload = alternativePayload;
            console.log('✅ Minimal payload worked');
          } catch (minimalError) {
            console.log('❌ Both payload formats failed');
            throw minimalError;
          }
        } else {
          throw error;
        }
      }

      console.log('📥 Hubtel payment initiation response:', JSON.stringify(response.data, null, 2));

      // Extract the checkout URL from Hubtel's response
      let checkoutUrl = null;
      if (response.data.checkoutUrl) {
        checkoutUrl = response.data.checkoutUrl;
      } else if (response.data.url) {
        checkoutUrl = response.data.url;
      } else if (response.data.paymentUrl) {
        checkoutUrl = response.data.paymentUrl;
      } else if (response.data.redirectUrl) {
        checkoutUrl = response.data.redirectUrl;
      } else if (response.data.data && response.data.data.checkoutUrl) {
        checkoutUrl = response.data.data.checkoutUrl;
      } else if (response.data.data && response.data.data.url) {
        checkoutUrl = response.data.data.url;
      }

      if (!checkoutUrl) {
        console.warn('No checkout URL found in Hubtel response. Full response:', response.data);
        throw new Error('No checkout URL received from Hubtel. Please check the API response.');
      }

      // Return the checkout response
      return {
        success: true,
        checkoutUrl: checkoutUrl,
        checkoutData: usedPayload,
        hubtelResponse: response.data,
        paymentId: response.data.paymentId || response.data.id || response.data.data?.paymentId,
        status: response.data.status || response.data.data?.status
      };

    } catch (error) {
      console.error('Error creating Hubtel checkout URL:', error.message);
      
      if (error.response) {
        console.error('Hubtel API Error:', error.response.status, error.response.data);
        
        if (error.response.status === 401) {
          throw new Error('Invalid Hubtel API credentials. Please check your CLIENT_ID and CLIENT_SECRET.');
        } else if (error.response.status === 400) {
          const errorMessage = error.response.data.message || error.response.data.error || error.response.data.details || 'Invalid request parameters';
          throw new Error(`Hubtel API Error: ${errorMessage}`);
        } else if (error.response.status === 403) {
          throw new Error('Access denied. Please check your Hubtel account permissions.');
        } else if (error.response.status === 500) {
          throw new Error('Hubtel server error. Please try again later.');
        }
      }
      
      throw new Error(`Failed to create checkout URL: ${error.message}`);
    }
  }
}

export default new HubtelService(); 