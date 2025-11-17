# Quick Start Guide - Karaoke Booking System

## 🚀 Get Started in 3 Steps

### Step 1: Create Your Rooms (2 minutes)

1. Click the **"Rooms"** tab in the navigation
2. Click **"Add Room"**
3. Create 10 rooms with example values:
   ```
   Room 1: VIP Room 1 | Capacity: 15 | Rate: $80/hour
   Room 2: VIP Room 2 | Capacity: 15 | Rate: $80/hour
   Room 3: Standard Room A | Capacity: 10 | Rate: $50/hour
   Room 4: Standard Room B | Capacity: 10 | Rate: $50/hour
   Room 5: Standard Room C | Capacity: 10 | Rate: $50/hour
   Room 6: Standard Room D | Capacity: 10 | Rate: $50/hour
   Room 7: Party Room 1 | Capacity: 20 | Rate: $100/hour
   Room 8: Party Room 2 | Capacity: 20 | Rate: $100/hour
   Room 9: Small Room 1 | Capacity: 5 | Rate: $30/hour
   Room 10: Small Room 2 | Capacity: 5 | Rate: $30/hour
   ```

### Step 2: Configure Basic Settings (2 minutes)

1. Click the **"Settings"** tab
2. Fill in the **General Settings** section:
   - Venue Name: Your karaoke venue name
   - Deposit Percentage: 30 (customers pay 30% upfront)
   - Venue Address: Your full address
   - Google Maps Link: (optional for now)

3. Fill in **Admin Contact**:
   - Admin WhatsApp: Your WhatsApp number (e.g., +1234567890)
   - Admin Email: Your email address

4. Set **Peak Hours** (click to toggle):
   - Click hours 18, 19, 20, 21, 22 (6 PM - 10 PM)
   - Peak Price Multiplier: 1.5 (50% higher prices during peak)

5. Click **"Save Settings"**

### Step 3: Test the System (5 minutes)

1. Click **"Book Now"** tab
2. Fill in a test booking:
   - Pick tomorrow's date
   - Start time: 20:00 (8 PM - peak time!)
   - Hours: 2
   - People: 8
   - Name: John Doe
   - Mobile: +1234567890
   - Email: test@example.com
   - Communication: WhatsApp
3. Notice the price estimate appears automatically
4. Click **"Submit Booking Request"**

5. Go to **"Admin"** tab
6. You'll see the booking in "Pending" status
7. Click **"Approve"** (this would normally generate a Stripe payment link)

## 🎯 You're Ready!

The system is now configured and ready to use. Here's what happens next:

### For Customers:
1. They visit your booking page
2. Fill in their details and see instant price quotes
3. Submit booking request
4. You approve and send them payment link
5. They pay deposit
6. They receive confirmation + reminders automatically

### For You (Admin):
- Check **Admin** tab for all booking requests
- Use **Calendar** view to see room availability
- Manage everything from one dashboard
- Get notifications for new bookings and cancellations

## 📱 Setup Third-Party Services (When Ready)

To enable full functionality, you'll need to configure:

### 1. Stripe (for payments)
- Sign up at https://stripe.com
- Add keys in Settings → Stripe Settings
- Detailed guide in BOOKING_SYSTEM_GUIDE.md

### 2. Twilio (for WhatsApp)
- Sign up at https://twilio.com
- Set up WhatsApp sandbox
- Add credentials in Settings → Twilio Settings
- Detailed guide in BOOKING_SYSTEM_GUIDE.md

### 3. Email (for email notifications)
- Use Gmail, SendGrid, or any SMTP
- Add credentials in Settings → Email Settings
- Detailed guide in BOOKING_SYSTEM_GUIDE.md

## 💡 Pro Tips

1. **Create a promo code**: Go to "Promos" tab → Create "WELCOME10" for 10% off
2. **Test peak pricing**: Book during peak hours (6-10 PM) to see higher prices
3. **Calendar view**: Click "Calendar View" in Admin to see all rooms at once
4. **Customer database**: Check "Customers" tab to see returning customer info
5. **Test cancellation**: Copy the cancellation link from a booking confirmation

## 📖 Full Documentation

For complete setup instructions and troubleshooting, see:
**BOOKING_SYSTEM_GUIDE.md**

## ❓ Need Help?

The system works offline without API keys, but:
- Payment approval won't generate real Stripe links
- WhatsApp/Email notifications won't be sent
- Everything else works perfectly for testing!

Enjoy your new booking system! 🎤🎉
