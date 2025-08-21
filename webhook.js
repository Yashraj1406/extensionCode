// Simple webhook handler for payment confirmation
// This would run on a server (Node.js/Express) to handle Razorpay webhooks

const crypto = require('crypto');

// Webhook endpoint to receive payment confirmations from Razorpay
function handleWebhook(req, res) {
    const webhookSecret = 'YOUR_WEBHOOK_SECRET'; // From Razorpay dashboard
    const webhookSignature = req.headers['x-razorpay-signature'];
    const webhookBody = JSON.stringify(req.body);
    
    // Verify webhook signature
    const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(webhookBody)
        .digest('hex');
    
    if (webhookSignature !== expectedSignature) {
        return res.status(400).send('Invalid signature');
    }
    
    const event = req.body;
    
    // Handle payment success
    if (event.event === 'payment.captured') {
        const payment = event.payload.payment.entity;
        const paymentId = payment.id;
        const amount = payment.amount;
        const email = payment.email;
        
        // Generate license key
        const licenseKey = generateLicenseKey(paymentId);
        
        // Store in database or send email
        console.log(`Payment successful: ${paymentId}, License: ${licenseKey}`);
        
        // You could:
        // 1. Store license in database
        // 2. Send email with license key
        // 3. Update user account status
        
        res.status(200).send('OK');
    }
}

function generateLicenseKey(paymentId) {
    const timestamp = Date.now().toString(36);
    const hash = crypto.createHash('md5').update(paymentId).digest('hex').substring(0, 8);
    return `PRO-${timestamp}-${hash.toUpperCase()}`;
}

module.exports = { handleWebhook };