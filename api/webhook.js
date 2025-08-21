// Vercel serverless function for Razorpay webhook
const crypto = require('crypto');

export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);

    // Verify signature
    const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex');

    if (signature !== expectedSignature) {
        return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = req.body;

    // Handle payment success
    if (event.event === 'payment.captured') {
        const payment = event.payload.payment.entity;
        const licenseKey = generateLicense(payment.id);
        
        // Log for now (in production, save to database/send email)
        console.log(`Payment: ${payment.id}, License: ${licenseKey}`);
        
        return res.status(200).json({ 
            success: true, 
            licenseKey 
        });
    }

    res.status(200).json({ received: true });
}

function generateLicense(paymentId) {
    const timestamp = Date.now().toString(36);
    const hash = crypto.createHash('md5').update(paymentId).digest('hex').substring(0, 8);
    return `PRO-${timestamp}-${hash.toUpperCase()}`;
}