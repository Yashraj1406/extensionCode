# Deployment Instructions

## GitHub Pages Setup

### 1. Create GitHub Repository
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/tab-snaps.git
git push -u origin main
```

### 2. Enable GitHub Pages
1. Go to repository Settings
2. Scroll to "Pages" section
3. Source: Deploy from branch
4. Branch: main
5. Folder: / (root)
6. Save

### 3. Your Website URLs
- Main site: `https://YOUR_USERNAME.github.io/tab-snaps/`
- Payment page: `https://YOUR_USERNAME.github.io/tab-snaps/payment.html`

## Razorpay Integration

### 1. Get Your Keys
- Login to Razorpay Dashboard
- Go to Settings → API Keys
- Copy Test Key ID
- Replace in `payment.js`: `key: 'rzp_test_YOUR_ACTUAL_KEY'`

### 2. Update Website URL
- In Razorpay Dashboard → Account & Settings
- Update website URL to your GitHub Pages URL

### 3. Test Payment Flow
1. Load extension in Chrome
2. Click "Upgrade to Pro"
3. Try ₹42 test payment
4. Verify license key generation

## Payment Confirmation Options

### Option A: Simple (No Server)
- User gets license key immediately after payment
- Manual verification via transaction ID
- Good for testing and small scale

### Option B: Webhook (Requires Server)
- Deploy `webhook.js` to Heroku/Vercel
- Set webhook URL in Razorpay
- Automatic license generation and email delivery

## Testing Checklist
- [ ] GitHub Pages deployed
- [ ] Razorpay keys updated
- [ ] Policy links accessible
- [ ] Payment flow works
- [ ] License activation works
- [ ] Extension loads without errors