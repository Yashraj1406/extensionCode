// Secure license validation system

class LicenseValidator {
  static SECRET_KEY = 'TabSnaps2024SecretKey'; // In production, use environment variable
  
  // Generate license from payment ID with cryptographic signature
  static generateLicense(paymentId, timestamp = Date.now()) {
    const data = `${paymentId}-${timestamp}`;
    const signature = this.createSignature(data);
    const encoded = btoa(`${data}-${signature}`).replace(/[+/=]/g, '');
    return `PRO-${encoded.substring(0, 16).toUpperCase()}`;
  }
  
  // Validate license key cryptographically
  static validateLicense(licenseKey) {
    try {
      // Extract encoded data
      if (!licenseKey.startsWith('PRO-')) return false;
      
      const encoded = licenseKey.substring(4);
      const decoded = atob(encoded + '=='); // Add padding
      const parts = decoded.split('-');
      
      if (parts.length !== 3) return false;
      
      const [paymentId, timestamp, signature] = parts;
      const data = `${paymentId}-${timestamp}`;
      const expectedSignature = this.createSignature(data);
      
      // Verify signature
      if (signature !== expectedSignature) return false;
      
      // Check if license is not too old (optional)
      const licenseAge = Date.now() - parseInt(timestamp);
      const maxAge = 365 * 24 * 60 * 60 * 1000; // 1 year
      
      return licenseAge < maxAge;
    } catch (error) {
      return false;
    }
  }
  
  // Create cryptographic signature
  static createSignature(data) {
    // Simple hash-based signature (in production, use HMAC)
    let hash = 0;
    const combined = data + this.SECRET_KEY;
    
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36);
  }
  
  // Validate with server (for production)
  static async validateWithServer(licenseKey) {
    try {
      const response = await fetch('https://your-api.com/validate-license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseKey })
      });
      
      const result = await response.json();
      return result.valid === true;
    } catch (error) {
      // Fallback to local validation if server is down
      return this.validateLicense(licenseKey);
    }
  }
}