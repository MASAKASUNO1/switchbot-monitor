const axios = require('axios');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

class SwitchBotAPI {
  constructor(token, secret) {
    this.token = token;
    this.secret = secret;
    this.baseURL = 'https://api.switch-bot.com/v1.1';
  }

  generateSignature() {
    const timestamp = Date.now().toString();
    const nonce = uuidv4();
    const stringToSign = this.token + timestamp + nonce;
    const signature = crypto.createHmac('sha256', this.secret)
                           .update(stringToSign)
                           .digest('base64');

    return {
      signature,
      timestamp,
      nonce
    };
  }

  async makeRequest(endpoint) {
    const { signature, timestamp, nonce } = this.generateSignature();
    
    const config = {
      headers: {
        'Authorization': this.token,
        'sign': signature,
        'nonce': nonce,
        't': timestamp,
        'Content-Type': 'application/json'
      }
    };

    try {
      const response = await axios.get(`${this.baseURL}${endpoint}`, config);
      
      if (response.data.statusCode === 100) {
        return response.data.body;
      } else {
        throw new Error(`API Error: ${response.data.message}`);
      }
    } catch (error) {
      if (error.response) {
        throw new Error(`HTTP ${error.response.status}: ${error.response.statusText}`);
      }
      throw error;
    }
  }

  async getDevices() {
    const data = await this.makeRequest('/devices');
    return data.deviceList || [];
  }

  async getDeviceStatus(deviceId) {
    const data = await this.makeRequest(`/devices/${deviceId}/status`);
    return data;
  }
}

module.exports = SwitchBotAPI;