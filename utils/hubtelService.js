import axios from "axios";

class HubtelService {
  constructor() {
    this.clientId = process.env.HUBTEL_CLIENT_ID;
    this.clientSecret = process.env.HUBTEL_CLIENT_SECRET;
    this.customCredentials = null;
  }

  // Use either env or custom credentials
  getCredentials() {
    return this.customCredentials || {
      clientId: this.clientId,
      clientSecret: this.clientSecret,
    };
  }

  getAuthHeader() {
    const { clientId, clientSecret } = this.getCredentials();
    if (!clientId || !clientSecret) {
      throw new Error("Hubtel credentials missing");
    }
    const token = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    return `Basic ${token}`;
  }


/** Check transaction status */
async checkTransactionStatus(transactionId) {
  try {
    const merchantAccount = process.env.HUBTEL_MERCHANT_ACCOUNT; 
    const clientId = process.env.HUBTEL_CLIENT_ID;
    const clientSecret = process.env.HUBTEL_CLIENT_SECRET;

    if (!merchantAccount) {
      throw new Error("Missing HUBTEL_MERCHANT_ACCOUNT in env");
    }

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const response = await axios.get(
      `https://api.hubtel.com/v1/merchantaccount/merchants/${merchantAccount}/transactions/${transactionId}/status`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    return response.data; // ✅ return API data
  } catch (error) {
    console.error("❌ Hubtel API error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url,
    });

    throw new Error("Failed to check transaction status");
  }
}


  /** Create checkout URL */
  async createCheckoutUrl({ totalAmount, description, callbackUrl, returnUrl, merchantAccountNumber, cancellationUrl, clientReference }) {
    const url = "https://payproxyapi.hubtel.com/items/initiate";

    const payload = {
      totalAmount: parseFloat(totalAmount),
      description,
      callbackUrl,
      returnUrl,
      merchantAccountNumber,
      cancellationUrl: cancellationUrl || returnUrl,
      clientReference,
    };

    const response = await axios.post(url, payload, {
      headers: {
        Authorization: this.getAuthHeader(),
        "Content-Type": "application/json",
      },
    });

    if (!response.data.checkoutUrl && !response.data.data?.checkoutUrl) {
      throw new Error("No checkout URL in Hubtel response");
    }

    return {
      checkoutUrl: response.data.checkoutUrl || response.data.data?.checkoutUrl,
      response: response.data,
    };
  }
}

export default new HubtelService();
