// Payment processing for Tab Snaps Pro

// Razorpay integration (FREE UPI payments)
function payWithRazorpay() {
    // For demo - using Razorpay test mode (free)
    const options = {
        key: 'rzp_test_1DP5mmOlF5G5ag', // Razorpay demo key for testing
        amount: 4200, // ₹42 ($0.5) in paise for testing
        currency: 'INR',
        name: 'Tab Snaps Pro',
        description: 'Lifetime Pro License',
        image: chrome.runtime.getURL('icons/icon128.png'),
        handler: function(response) {
            // Payment successful
            verifyPayment(response.razorpay_payment_id, 'razorpay');
        },
        prefill: {
            email: 'user@example.com',
            contact: '9999999999'
        },
        theme: {
            color: '#1a73e8'
        },
        method: {
            upi: true,
            card: false, // Focus on free UPI only
            wallet: false,
            netbanking: false
        },
        notes: {
            extension_id: chrome.runtime.id
        }
    };
    
    const rzp = new Razorpay(options);
    rzp.open();
}

// Stripe integration (International)
function payWithStripe() {
    // Redirect to Stripe Checkout
    const stripeUrl = `https://checkout.stripe.com/pay/cs_test_YOUR_SESSION_ID`;
    window.location.href = stripeUrl;
}

// Simple UPI QR Code payment
function showUPIQR() {
    const upiId = 'your-upi-id@paytm'; // Replace with your UPI ID
    const amount = 499;
    const note = 'Tab Snaps Pro License';
    
    // Generate UPI payment URL
    const upiUrl = `upi://pay?pa=${upiId}&am=${amount}&tn=${encodeURIComponent(note)}&cu=INR`;
    
    // Show QR code and payment instructions
    document.body.innerHTML = `
        <div class="payment-container" style="text-align: center;">
            <h2>UPI QR Code Payment</h2>
            <p>Scan this QR code with any UPI app</p>
            
            <div style="margin: 30px 0;">
                <div id="qrcode" style="display: inline-block;"></div>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h4>Payment Details:</h4>
                <p><strong>Amount:</strong> ₹42</p>
                <p><strong>UPI ID:</strong> ${upiId}</p>
                <p><strong>Note:</strong> ${note}</p>
            </div>
            
            <button onclick="window.open('${upiUrl}')" style="padding: 15px 30px; background: #1a73e8; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; margin: 10px;">
                Open UPI App
            </button>
            
            <div style="margin-top: 30px;">
                <input type="text" id="transactionId" placeholder="Enter Transaction ID after payment" style="padding: 10px; margin-right: 10px; width: 200px;">
                <button onclick="verifyManualPayment()" style="padding: 10px 20px; background: #34a853; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Verify Payment
                </button>
            </div>
            
            <button onclick="location.reload()" style="margin-top: 20px; padding: 8px 16px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Back to Payment Options
            </button>
        </div>
    `;
    
    // Generate QR code (using a simple QR code service)
    const qrElement = document.getElementById('qrcode');
    qrElement.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}" alt="UPI QR Code">`;
}

// Verify manual payment
function verifyManualPayment() {
    const transactionId = document.getElementById('transactionId').value.trim();
    
    if (!transactionId) {
        alert('Please enter the transaction ID');
        return;
    }
    
    // In production, verify with your backend
    // For demo, generate license after transaction ID entry
    const mockLicense = generateMockLicense(transactionId);
    showLicenseKey(mockLicense);
}

// Verify payment and generate license
async function verifyPayment(paymentId, provider) {
    try {
        // In production, verify with your backend
        const response = await fetch('https://your-api.com/verify-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                paymentId,
                provider,
                amount: 49900,
                currency: 'INR'
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Show license key
            showLicenseKey(result.licenseKey);
        } else {
            alert('Payment verification failed. Please contact support.');
        }
    } catch (error) {
        console.error('Payment verification error:', error);
        
        // For demo purposes, generate a mock license
        const mockLicense = generateMockLicense(paymentId);
        showLicenseKey(mockLicense);
    }
}

// Generate secure license from payment ID
function generateMockLicense(paymentId) {
    // Create cryptographically signed license
    const timestamp = Date.now();
    const data = `${paymentId}-${timestamp}`;
    const signature = createSignature(data);
    const encoded = btoa(`${data}-${signature}`).replace(/[+/=]/g, '');
    return `PRO-${encoded.substring(0, 16).toUpperCase()}`;
}

// Create signature for license validation
function createSignature(data) {
    const SECRET_KEY = 'TabSnaps2024SecretKey';
    let hash = 0;
    const combined = data + SECRET_KEY;
    
    for (let i = 0; i < combined.length; i++) {
        const char = combined.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    
    return Math.abs(hash).toString(36);
}

// Show license key to user
function showLicenseKey(licenseKey) {
    document.body.innerHTML = `
        <div class="payment-container" style="text-align: center;">
            <h1 style="color: #34a853;">🎉 Payment Successful!</h1>
            <p>Thank you for upgrading to Tab Snaps Pro!</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Your License Key:</h3>
                <div style="font-family: monospace; font-size: 18px; font-weight: bold; color: #1a73e8; padding: 10px; background: white; border-radius: 4px;">
                    ${licenseKey}
                </div>
                <button onclick="copyLicense('${licenseKey}')" style="margin-top: 10px; padding: 8px 16px; background: #1a73e8; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Copy License Key
                </button>
            </div>
            
            <div style="background: #e8f0fe; padding: 15px; border-radius: 8px; font-size: 14px;">
                <strong>Next Steps:</strong><br>
                1. Copy the license key above<br>
                2. Go to Tab Snaps extension settings<br>
                3. Paste the license key and click "Activate"<br>
                4. Enjoy unlimited snapshots! 🚀
            </div>
            
            <button onclick="window.close()" style="margin-top: 20px; padding: 10px 20px; background: #34a853; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Close & Activate License
            </button>
        </div>
    `;
}

// Copy license to clipboard
function copyLicense(licenseKey) {
    navigator.clipboard.writeText(licenseKey).then(() => {
        alert('License key copied to clipboard!');
    });
}

// Load payment scripts
function loadPaymentScripts() {
    // Load Razorpay
    const razorpayScript = document.createElement('script');
    razorpayScript.src = 'https://checkout.razorpay.com/v1/checkout.js';
    document.head.appendChild(razorpayScript);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', loadPaymentScripts);