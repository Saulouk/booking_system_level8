# Karaoke Booking System - Setup Guide

A comprehensive booking system for private karaoke venues with customer booking, admin approval, payment processing, automated notifications, and reminders.

## Features

### Customer Features
- Online booking form with real-time price estimation
- Auto-fill for returning customers
- Promo code support
- Peak/off-peak pricing
- Choose communication preference (WhatsApp or Email)
- Secure deposit payment via Stripe
- Booking confirmation messages
- Automated reminders (24h and 2h before booking)
- Easy cancellation with unique link

### Admin Features
- Real-time booking dashboard
- Calendar view showing all 10 rooms and time slots
- Filter bookings by status, date, room, or customer
- Approve/reject booking requests
- Generate payment links
- Modify booking details
- Move bookings to different rooms
- Customer database with booking history
- Room management
- Promo code management
- Comprehensive settings panel

### Automated Features
- WhatsApp notifications to admin for new bookings
- Payment link generation upon approval
- Confirmation messages after deposit payment
- 24-hour advance reminders
- 2-hour advance reminders
- Cancellation notifications to admin

## Setup Instructions

### 1. Install Dependencies

The required dependencies are already installed:
- stripe (payment processing)
- twilio (WhatsApp messaging)
- nodemailer (email notifications)
- date-fns (date manipulation)
- node-cron (scheduled reminders)

### 2. Configure Third-Party Services

#### Stripe Setup (Required for Payments)

1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe dashboard
3. In the app, navigate to **Settings** and enter:
   - **Publishable Key**: Your Stripe publishable key (pk_test_...)
   - **Secret Key**: Your Stripe secret key (sk_test_...)

#### Twilio Setup (Required for WhatsApp)

1. Create a Twilio account at https://twilio.com
2. Set up WhatsApp Business API (sandbox for testing)
3. Get your credentials from the Twilio console
4. In the app Settings, enter:
   - **Account SID**: Your Twilio Account SID
   - **Auth Token**: Your Twilio Auth Token
   - **WhatsApp From Number**: Your Twilio WhatsApp number (e.g., +14155238886)

#### Email Setup (Required for Email Notifications)

You can use any SMTP provider (Gmail, SendGrid, etc.)

**For Gmail:**
1. Enable 2-factor authentication on your Google account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. In the app Settings, enter:
   - **SMTP Host**: smtp.gmail.com
   - **SMTP Port**: 587
   - **SMTP Username**: your-email@gmail.com
   - **SMTP Password**: your-app-password
   - **From Email**: your-email@gmail.com

### 3. Initial Configuration

#### Step 1: Create Rooms

1. Navigate to the **Rooms** tab
2. Click "Add Room"
3. Create your 10 karaoke rooms with:
   - Room name (e.g., "VIP Room 1", "Standard Room A")
   - Capacity (number of people)
   - Hourly rate (in dollars)

#### Step 2: Configure Settings

1. Navigate to the **Settings** tab
2. Fill in the required fields:

**General Settings:**
- Venue Name (e.g., "Karaoke Paradise")
- Deposit Percentage (default: 30%)
- Venue Address
- Google Maps Link

**Admin Contact:**
- Admin WhatsApp Number (with country code, e.g., +1234567890)
- Admin Email

**Pricing:**
- Peak Price Multiplier (e.g., 1.5 = 50% higher during peak hours)
- Peak Hours (click hours to toggle, e.g., 18-22 for 6 PM - 10 PM)

**API Keys:**
- Stripe keys (from Step 2)
- Twilio credentials (from Step 2)
- SMTP settings (from Step 2)

3. Click "Save Settings"

#### Step 3: (Optional) Create Promo Codes

1. In the Settings section, scroll to Promo Codes
2. Create promotional codes with:
   - Code (e.g., "WELCOME10")
   - Discount percentage
   - Expiration date (optional)

## How to Use

### Customer Booking Flow

1. Customer visits the **Book Now** page
2. Fills in booking details:
   - Date and start time
   - Duration (1-12 hours)
   - Number of people
   - Contact information
   - Preferred communication method
3. System shows estimated price (including peak pricing and promo discounts)
4. Customer submits booking request
5. Admin receives WhatsApp notification with booking details

### Admin Approval Flow

1. Admin checks the **Admin** dashboard
2. Reviews pending booking requests
3. Clicks "Approve" to generate payment link
4. Payment link opens in new tab (share with customer)
5. Customer pays deposit via Stripe
6. System automatically:
   - Updates booking status to "Confirmed"
   - Sends confirmation message to customer
   - Increments customer's total visits

### Automated Reminders

The system automatically sends reminders:
- **24 hours before**: Includes date, time, room, and balance due
- **2 hours before**: Includes time, room, and location details

Reminders are sent via the customer's preferred communication method.

### Cancellation Flow

1. Customer clicks cancellation link from confirmation message
2. Confirms cancellation
3. Admin receives notification
4. Booking status updates to "Cancelled"
5. Room becomes available again

## Admin Dashboard Features

### List View
- See all bookings in a table format
- Filter by status, date, room, or customer name
- Quick actions to approve/reject
- View customer notes

### Calendar View
- Visual grid showing all rooms and time slots
- See booking conflicts at a glance
- Color-coded by status:
  - Yellow: Pending
  - Blue: Approved
  - Green: Confirmed
  - Gray: Cancelled
  - Red: Rejected

### Customer Database
- View all customers with booking history
- Track total visits per customer
- Add notes for special requirements
- See complete booking timeline

## Important Notes

### Security
- Never share your API keys publicly
- Keep your Stripe secret key secure
- Use environment variables for production deployment

### Testing
- Use Stripe test mode keys for testing
- Twilio sandbox for WhatsApp testing
- Test email delivery before going live

### Data Storage
- All data is stored in `.storage/` directory
- This directory is gitignored by default
- Back up this directory regularly for data persistence

### Reminder Scheduler
- Runs automatically every 15 minutes
- Checks for upcoming bookings
- Sends reminders at appropriate times
- Logs all reminder activities to console

## Troubleshooting

### WhatsApp messages not sending
- Verify Twilio credentials in Settings
- Check that customer's number is in Twilio sandbox (for testing)
- Ensure WhatsApp number format includes country code

### Emails not sending
- Verify SMTP credentials
- For Gmail, ensure App Password is used (not regular password)
- Check spam folder

### Payment link not working
- Verify Stripe keys are correct
- Ensure deposit amount is calculated correctly
- Check Stripe dashboard for any errors

### Reminders not being sent
- Check server logs for scheduler errors
- Verify booking times are in the future
- Ensure customer contact info is correct

## Support

For issues or questions, check:
- Stripe documentation: https://stripe.com/docs
- Twilio documentation: https://www.twilio.com/docs
- Nodemailer guide: https://nodemailer.com/

## Future Enhancements

Optional features you can add:
- Google Calendar integration
- Downloadable booking receipts
- Customer loyalty program
- Multi-language support
- SMS notifications (using Twilio)
- Push notifications
- Advanced analytics dashboard
