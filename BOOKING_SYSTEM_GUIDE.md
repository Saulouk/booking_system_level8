# Karaoke Booking System - WhatsApp Cloud API & Per-Person Pricing

## Key Features

### New Pricing Model
- **£20 per person** for the first 3 hours
- **£5 per person** for each additional hour
- Example: 4 people for 5 hours = (4 × £20) + (4 × £5 × 2) = £80 + £40 = **£120**
- Admin can override prices for any booking

### WhatsApp Cloud API
- Uses Meta's official WhatsApp Business Cloud API
- More reliable than Twilio
- Better message delivery rates
- Direct integration with Facebook Business

## Setup Instructions

### 1. WhatsApp Cloud API Setup

#### Step 1: Create Meta Business App
1. Go to https://developers.facebook.com/apps
2. Click "Create App"
3. Select "Business" as app type
4. Fill in app details and create

#### Step 2: Add WhatsApp Product
1. In your app dashboard, click "Add Product"
2. Find "WhatsApp" and click "Set Up"
3. This will add WhatsApp to your app

#### Step 3: Get Your Credentials
1. In the WhatsApp settings, you'll see:
   - **Temporary Access Token** (valid for 24 hours - for testing)
   - **Phone Number ID** (a long numeric ID)
2. Copy both of these

#### Step 4: Get Permanent Access Token
1. Go to https://business.facebook.com/settings/whatsapp-business-accounts
2. Select your WhatsApp Business Account
3. Go to "System Users" → Create a system user
4. Assign the system user to your app
5. Generate a permanent access token with `whatsapp_business_messaging` permission

#### Step 5: Configure in App
1. Open your booking system
2. Go to **Settings** tab
3. Under "WhatsApp Cloud API":
   - **Access Token**: Paste your permanent access token (starts with `EAAA...`)
   - **Phone Number ID**: Paste your phone number ID (15-digit number)

#### Step 6: Verify Setup
1. Add a test phone number in Meta Business dashboard
2. Make a test booking to see if WhatsApp message is sent

### 2. Pricing Configuration

The new per-person pricing is already configured with defaults:
- Base hours: 3
- Price per person (base): £20
- Additional per hour: £5

#### Customize Pricing
1. Go to **Settings** → **Pricing Model**
2. Adjust:
   - **Base Hours**: Number of hours included in base price
   - **Price Per Person (Base)**: Cost per person for base hours
   - **Additional Per Hour**: Cost per person for each extra hour

#### Admin Price Override
Admins can override the automatic pricing for any booking:

1. Go to **Admin** dashboard
2. Click "Override Price" on any booking
3. Enter custom price in GBP (£)
4. The system will recalculate deposit and remaining balance

This is useful for:
- Special discounts
- VIP customers
- Group packages
- Promotional rates

### 3. Stripe Payment Setup

1. Create account at https://stripe.com
2. Get your API keys from Dashboard → Developers → API keys
3. In app Settings → Stripe Settings:
   - **Publishable Key**: `pk_test_...` or `pk_live_...`
   - **Secret Key**: `sk_test_...` or `sk_live_...`

### 4. Email Notifications Setup

Configure SMTP for email notifications (backup to WhatsApp):

**For Gmail:**
```
SMTP Host: smtp.gmail.com
SMTP Port: 587
Username: your-email@gmail.com
Password: your-app-password (from Google Account settings)
From Email: your-email@gmail.com
```

## How Pricing Works

### Automatic Calculation

The system automatically calculates prices based on:
1. Number of people
2. Number of hours
3. Peak time multiplier (if applicable)
4. Promo code discount (if provided)

**Example Calculations:**

**Basic Booking (2 people, 3 hours):**
- 2 × £20 = **£40**

**Extended Booking (2 people, 5 hours):**
- Base (3 hours): 2 × £20 = £40
- Additional (2 hours): 2 × £5 × 2 = £20
- Total: **£60**

**Large Group (10 people, 4 hours):**
- Base (3 hours): 10 × £20 = £200
- Additional (1 hour): 10 × £5 = £50
- Total: **£250**

**Peak Time Booking (4 people, 3 hours, 1.5x multiplier):**
- Base: 4 × £20 = £80
- Peak multiplier: £80 × 1.5 = **£120**

### Peak Time Pricing

1. Go to Settings → Peak Time Pricing
2. Set **Peak Price Multiplier** (e.g., 1.5 = 50% increase)
3. Click hours to toggle peak times (e.g., 18:00-22:00)
4. Peak pricing applies automatically during selected hours

### Promo Codes

1. Go to **Promos** tab
2. Create promo codes with:
   - Code name (e.g., "WELCOME10")
   - Discount percentage
   - Expiration date (optional)
3. Customers enter code during booking
4. Discount applies to final price before deposit calculation

## Room Management

**Important:** Rooms are still managed but no longer affect pricing directly. They're used for:
- Availability checking
- Booking assignment
- Calendar visualization

To manage rooms:
1. Go to **Rooms** tab
2. Add/edit rooms (capacity and hourly rate fields remain for reference)
3. The system will auto-assign available rooms to bookings

## WhatsApp Message Examples

### New Booking Notification (to Admin)
```
🎤 New Booking Request

Customer: John Smith
Date: 2024-02-15
Time: 19:00
Duration: 4 hours
Room: VIP Room 1
People: 6
Mobile: +447123456789
Email: john@example.com

Status: PENDING
```

### Confirmation (to Customer)
```
✅ Booking Confirmed!

Karaoke Paradise
John Smith, your booking is confirmed!

📅 Date: 2024-02-15
🕐 Time: 19:00
⏱️ Duration: 4 hours
🚪 Room: VIP Room 1
👥 People: 6

💰 Total: £140
✅ Deposit Paid: £42
⚠️ Remaining: £98

📍 Location: 123 High Street, London
🗺️ Map: [link]

❌ Cancel booking: [link]

See you soon! 🎵
```

## Testing Checklist

Before going live:

✅ **WhatsApp Cloud API**
- [ ] Access token configured
- [ ] Phone number ID configured
- [ ] Test message sent successfully
- [ ] Customer receives confirmation
- [ ] Admin receives new booking notification

✅ **Pricing**
- [ ] Base pricing calculated correctly
- [ ] Additional hours calculated correctly
- [ ] Peak time multiplier working
- [ ] Promo codes applying discounts
- [ ] Admin override updates prices

✅ **Payments**
- [ ] Stripe keys configured (use test mode first)
- [ ] Payment link generated on approval
- [ ] Deposit payment processed
- [ ] Booking confirmed after payment

✅ **Notifications**
- [ ] WhatsApp messages sent
- [ ] Email backup working
- [ ] 24h reminders sent
- [ ] 2h reminders sent
- [ ] Cancellation notifications sent

## Troubleshooting

### WhatsApp Messages Not Sending

**Check:**
1. Access token is valid (not temporary token)
2. Phone number ID is correct
3. Phone numbers include country code (e.g., +44, not 0)
4. Customer's number is verified in Meta Business (for testing)
5. Check app logs for error messages

### Pricing Calculation Issues

**Check:**
1. Settings → Pricing Model values are correct
2. Peak hours are set if using peak pricing
3. Promo codes are active and not expired
4. Custom price override hasn't been set

### Admin Price Override Not Working

**Ensure:**
1. Booking exists and hasn't been cancelled
2. Custom price is a valid number
3. Price is greater than 0
4. You clicked "Update Price" button

## Production Deployment

When ready to go live:

1. **WhatsApp:** Keep same access token (it's permanent)
2. **Stripe:** Switch to live keys (`pk_live_...` and `sk_live_...`)
3. **Testing:** Verify all features with real test bookings
4. **Backup:** Regularly backup `.storage/` directory

## Support Resources

- **WhatsApp Cloud API Docs**: https://developers.facebook.com/docs/whatsapp/cloud-api
- **Stripe Documentation**: https://stripe.com/docs
- **Meta Business Help**: https://business.facebook.com/business/help

## Key Differences from Previous Version

| Feature | Old | New |
|---------|-----|-----|
| Messaging | Twilio | WhatsApp Cloud API |
| Pricing | Per room per hour | Per person (base + additional) |
| Currency | $ (USD) | £ (GBP) |
| Price Override | Not available | Admin can override any booking |
| Setup Complexity | Higher (Twilio account) | Lower (Meta Business only) |
