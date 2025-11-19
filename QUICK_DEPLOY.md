# Quick Deployment Guide for Debian 12

## TL;DR - Fast Track (30 minutes)

This is the simplified version for getting your karaoke booking system running on Debian 12.

## Step 1: Install Prerequisites (5 min)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install pnpm
npm install -g pnpm

# Install PM2
npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Verify
node --version  # Should be v20.x
pnpm --version
```

## Step 2: Transfer Your Project (5 min)

### Option A: Using Git

```bash
cd ~
git clone <your-repo-url> karaoke-booking
cd karaoke-booking
```

### Option B: Using SCP (from your local machine)

```bash
# On your LOCAL machine
cd /path/to/your/project
tar --exclude='node_modules' --exclude='.storage' -czf karaoke.tar.gz .
scp karaoke.tar.gz user@your-server-ip:~/

# On your SERVER
mkdir ~/karaoke-booking
cd ~/karaoke-booking
tar -xzf ~/karaoke.tar.gz
```

## Step 3: Build and Start (10 min)

```bash
cd ~/karaoke-booking

# Install dependencies
pnpm install

# Build the application
pnpm run build

# Create PM2 ecosystem file
cat > ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [{
    name: 'karaoke-booking',
    script: 'pnpm',
    args: 'run preview',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
EOF

# Start with PM2
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
# ⚠️ IMPORTANT: Copy and run the command that PM2 outputs

# Check it's running
pm2 status
pm2 logs karaoke-booking
```

Your app should now be running on port 3000!

## Step 4: Setup Nginx (5 min)

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/karaoke
```

Paste this (replace `your-domain.com` with your actual domain or IP):

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Save (Ctrl+X, Y, Enter), then:

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/karaoke /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Remove default site
sudo nginx -t  # Test config
sudo systemctl restart nginx

# Setup firewall
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
```

Your site should now be accessible at `http://your-domain.com`!

## Step 5: Add SSL (Optional but Recommended) (5 min)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d your-domain.com

# Follow the prompts - it's automatic!
```

Now accessible at `https://your-domain.com`!

## Step 6: Configure Your App

1. Open your browser and go to your domain
2. Click **Settings** tab
3. Fill in:
   - **Venue Name**: Your business name
   - **Admin WhatsApp**: Your WhatsApp number (with country code, e.g., +447123456789)
   - **Admin Email**: Your email
   - **Deposit Percentage**: 30 (default)

4. Set up **WhatsApp Cloud API** (see below)
5. Set up **Stripe** (see below)
6. Go to **Rooms** tab and add your karaoke rooms

## WhatsApp Cloud API Setup (10 min)

1. Go to https://developers.facebook.com/apps
2. Create a new app → Select "Business"
3. Add "WhatsApp" product
4. In WhatsApp settings, you'll see:
   - **Temporary Access Token** (copy this)
   - **Phone Number ID** (copy this)
5. For permanent token:
   - Go to https://business.facebook.com
   - System Users → Create system user
   - Generate token with `whatsapp_business_messaging` permission
6. In your app Settings → WhatsApp Cloud API:
   - **Access Token**: Paste token
   - **Phone Number ID**: Paste ID
7. Click **Save Settings**

## Stripe Setup (5 min)

1. Go to https://stripe.com and create account
2. Dashboard → Developers → API keys
3. Copy:
   - **Publishable key** (pk_test_... or pk_live_...)
   - **Secret key** (sk_test_... or sk_live_...)
4. In your app Settings → Stripe Settings:
   - Paste both keys
5. Click **Save Settings**

## Daily Backup Setup (5 min)

```bash
# Create backup script
cat > ~/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR=~/karaoke-backups
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/storage_$DATE.tar.gz -C ~/karaoke-booking .storage
find $BACKUP_DIR -name "storage_*.tar.gz" -mtime +30 -delete
EOF

chmod +x ~/backup.sh

# Schedule daily at 2 AM
(crontab -l 2>/dev/null; echo "0 2 * * * ~/backup.sh") | crontab -
```

## Common Commands

```bash
# View logs
pm2 logs karaoke-booking

# Restart app
pm2 restart karaoke-booking

# Stop app
pm2 stop karaoke-booking

# Start app
pm2 start ecosystem.config.cjs

# Check status
pm2 status

# Check Nginx
sudo systemctl status nginx
sudo nginx -t  # Test config
sudo systemctl restart nginx
```

## Updating Your App

When you make changes:

```bash
cd ~/karaoke-booking

# If using Git
git pull

# If using SCP, transfer new files first

# Then:
pnpm install  # Install any new dependencies
pnpm run build  # Rebuild
pm2 restart karaoke-booking  # Restart
pm2 logs karaoke-booking  # Check logs
```

## Troubleshooting

### App won't start
```bash
pm2 logs karaoke-booking  # Check logs
cd ~/karaoke-booking
pnpm run build  # Rebuild
pm2 restart karaoke-booking
```

### Can't access website
```bash
# Check Nginx
sudo nginx -t
sudo systemctl status nginx

# Check firewall
sudo ufw status

# Check app is running
pm2 status
curl http://localhost:3000  # Should return HTML
```

### No WhatsApp messages
1. Check Settings → WhatsApp Cloud API credentials
2. Phone numbers must include country code (e.g., +44)
3. For testing, add test numbers in Meta Business dashboard

### Port already in use
```bash
# Find what's using port 3000
sudo lsof -i :3000
# Kill it or change PORT in ecosystem.config.cjs
```

## Production Checklist

Before going live:

- [ ] SSL certificate installed (https://)
- [ ] WhatsApp Cloud API configured and tested
- [ ] Stripe keys (live, not test) configured
- [ ] Rooms added
- [ ] Settings configured
- [ ] Firewall enabled
- [ ] Backups scheduled
- [ ] Test booking flow end-to-end

## Security Notes

1. **Never commit API keys** to Git
2. Configure keys through the app's Settings page (stored in `.storage/` directory)
3. The `.storage/` directory is gitignored - this is where all your data lives
4. Back up `.storage/` directory regularly
5. Use strong passwords for your server

## What Gets Stored Where

- **Application data** (bookings, customers, etc.): `~/karaoke-booking/.storage/`
- **Application code**: `~/karaoke-booking/`
- **Backups**: `~/karaoke-backups/`
- **Logs**: `~/.pm2/logs/`

## Cost Breakdown

- **VPS Server**: $5-10/month (DigitalOcean, Linode, Vultr)
- **Domain**: $10-15/year
- **SSL**: Free (Let's Encrypt)
- **Stripe**: 2.9% + 30p per transaction
- **WhatsApp Cloud API**: Free for first 1000 messages/month

## You're Done! 🎉

Your karaoke booking system is now live and ready to accept bookings!

Next steps:
1. Test a booking as a customer
2. Approve it as admin
3. Test the payment flow
4. Verify WhatsApp notifications work
5. Check booking confirmation is sent

Need help? Check the logs: `pm2 logs karaoke-booking`
