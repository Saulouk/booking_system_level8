# Deployment Guide - Debian 12 Server

This guide will help you deploy the Karaoke Booking System to your Debian 12 server.

## Prerequisites

- Debian 12 server with SSH access
- Root or sudo privileges
- Domain name (optional but recommended)

## Step 1: Server Preparation

### 1.1 Update System

```bash
sudo apt update
sudo apt upgrade -y
```

### 1.2 Install Node.js (v20 LTS)

```bash
# Install Node.js using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version
```

### 1.3 Install pnpm

```bash
npm install -g pnpm

# Verify installation
pnpm --version
```

### 1.4 Install Git

```bash
sudo apt install -y git
```

### 1.5 Install Build Tools

```bash
sudo apt install -y build-essential
```

## Step 2: Transfer Project Files

### Option A: Using Git (Recommended)

If your project is in a Git repository:

```bash
# On your server
cd ~
git clone <your-repository-url> karaoke-booking
cd karaoke-booking
```

### Option B: Using SCP (Direct Transfer)

From your local machine:

```bash
# Create tarball of your project (exclude node_modules)
cd /path/to/your/project
tar --exclude='node_modules' --exclude='.git' --exclude='.storage' -czf karaoke-booking.tar.gz .

# Copy to server
scp karaoke-booking.tar.gz user@your-server-ip:~/

# On your server, extract
cd ~
mkdir karaoke-booking
cd karaoke-booking
tar -xzf ../karaoke-booking.tar.gz
```

### Option C: Using rsync (Recommended for Updates)

From your local machine:

```bash
# Initial sync
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude '.storage' \
  /path/to/your/project/ user@your-server-ip:~/karaoke-booking/

# For subsequent updates
rsync -avz --exclude 'node_modules' --exclude '.storage' \
  /path/to/your/project/ user@your-server-ip:~/karaoke-booking/
```

## Step 3: Install Dependencies

```bash
cd ~/karaoke-booking
pnpm install
```

## Step 4: Build the Application

```bash
pnpm run build
```

This creates optimized production files in the `dist` directory.

## Step 5: Production Server Setup

### 5.1 Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

### 5.2 Create Production Start Script

Create `start.sh` in your project root:

```bash
cat > start.sh << 'EOF'
#!/bin/bash
export NODE_ENV=production
export PORT=3000
export APP_URL=http://your-domain.com
node dist/server/index.js
EOF

chmod +x start.sh
```

### 5.3 Start Application with PM2

```bash
pm2 start start.sh --name karaoke-booking
pm2 save
pm2 startup  # Follow the instructions printed
```

### 5.4 Check Application Status

```bash
pm2 status
pm2 logs karaoke-booking
```

## Step 6: Install and Configure Nginx

### 6.1 Install Nginx

```bash
sudo apt install -y nginx
```

### 6.2 Configure Nginx as Reverse Proxy

Create Nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/karaoke-booking
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Increase body size for uploads
    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 6.3 Enable Site

```bash
sudo ln -s /etc/nginx/sites-available/karaoke-booking /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl restart nginx
```

## Step 7: Setup SSL with Let's Encrypt (Recommended)

### 7.1 Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 7.2 Obtain SSL Certificate

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

Follow the prompts. Certbot will automatically configure HTTPS.

### 7.3 Auto-Renewal

```bash
# Test renewal
sudo certbot renew --dry-run

# Renewal is automatic via systemd timer
sudo systemctl status certbot.timer
```

## Step 8: Configure Firewall

```bash
# Install ufw if not already installed
sudo apt install -y ufw

# Allow SSH (important - don't lock yourself out!)
sudo ufw allow ssh
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

## Step 9: Environment Configuration

### 9.1 Create Environment File

```bash
nano ~/.karaoke-env
```

Add your sensitive configuration:

```env
APP_URL=https://your-domain.com
STRIPE_SECRET_KEY=sk_live_...
WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxx...
WHATSAPP_PHONE_NUMBER_ID=123456789...
SMTP_PASSWORD=your-smtp-password
```

### 9.2 Update Start Script to Use Env File

```bash
nano start.sh
```

Update to:

```bash
#!/bin/bash
export NODE_ENV=production
export PORT=3000

# Load environment variables
if [ -f ~/.karaoke-env ]; then
    export $(cat ~/.karaoke-env | xargs)
fi

node dist/server/index.js
```

### 9.3 Secure the Environment File

```bash
chmod 600 ~/.karaoke-env
```

### 9.4 Restart Application

```bash
pm2 restart karaoke-booking
```

## Step 10: Data Persistence

### 10.1 Ensure .storage Directory Exists

```bash
mkdir -p ~/karaoke-booking/.storage
chmod 755 ~/karaoke-booking/.storage
```

### 10.2 Setup Automatic Backups

Create backup script:

```bash
nano ~/backup-karaoke.sh
```

Add:

```bash
#!/bin/bash
BACKUP_DIR=~/karaoke-backups
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup storage data
tar -czf $BACKUP_DIR/storage_$DATE.tar.gz -C ~/karaoke-booking .storage

# Keep only last 30 days of backups
find $BACKUP_DIR -name "storage_*.tar.gz" -mtime +30 -delete

echo "Backup completed: storage_$DATE.tar.gz"
```

Make executable:

```bash
chmod +x ~/backup-karaoke.sh
```

### 10.3 Schedule Daily Backups

```bash
crontab -e
```

Add this line (runs daily at 2 AM):

```cron
0 2 * * * ~/backup-karaoke.sh >> ~/backup-karaoke.log 2>&1
```

## Step 11: Monitoring and Logs

### 11.1 View Application Logs

```bash
# Real-time logs
pm2 logs karaoke-booking

# Last 100 lines
pm2 logs karaoke-booking --lines 100

# Error logs only
pm2 logs karaoke-booking --err
```

### 11.2 View Nginx Logs

```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

### 11.3 Monitor System Resources

```bash
# PM2 monitoring
pm2 monit

# System resources
htop  # Install with: sudo apt install htop
```

## Step 12: Security Hardening

### 12.1 Keep System Updated

```bash
# Create auto-update script
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### 12.2 Secure SSH

Edit SSH config:

```bash
sudo nano /etc/ssh/sshd_config
```

Recommended settings:

```
PermitRootLogin no
PasswordAuthentication no  # Only if you have SSH keys set up
PubkeyAuthentication yes
```

Restart SSH:

```bash
sudo systemctl restart sshd
```

### 12.3 Install Fail2Ban

```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## Step 13: Application Updates

When you need to update your application:

```bash
# Pull latest code (if using Git)
cd ~/karaoke-booking
git pull

# Or rsync from local machine
# rsync -avz --exclude 'node_modules' --exclude '.storage' \
#   /path/to/your/project/ user@your-server-ip:~/karaoke-booking/

# Install new dependencies
pnpm install

# Rebuild
pnpm run build

# Restart application
pm2 restart karaoke-booking

# Check logs
pm2 logs karaoke-booking
```

## Step 14: Webhook Setup (for Stripe)

If using Stripe webhooks for payment confirmation:

### 14.1 Create Webhook Endpoint

Your app should have a webhook endpoint at: `https://your-domain.com/api/stripe/webhook`

### 14.2 Configure in Stripe Dashboard

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter: `https://your-domain.com/api/stripe/webhook`
4. Select events: `checkout.session.completed`
5. Copy webhook signing secret

### 14.3 Add to Environment

```bash
nano ~/.karaoke-env
```

Add:

```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

Restart app:

```bash
pm2 restart karaoke-booking
```

## Troubleshooting

### Application Won't Start

```bash
# Check PM2 logs
pm2 logs karaoke-booking --lines 50

# Check if port is in use
sudo netstat -tulpn | grep 3000

# Restart PM2
pm2 restart karaoke-booking
```

### Nginx Issues

```bash
# Test configuration
sudo nginx -t

# Check logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

### SSL Certificate Issues

```bash
# Renew manually
sudo certbot renew

# Check certificate status
sudo certbot certificates
```

### Storage/Permission Issues

```bash
# Fix permissions
cd ~/karaoke-booking
chmod -R 755 .storage
chown -r $USER:$USER .storage
```

### Out of Memory

```bash
# Check memory
free -h

# Increase Node.js memory limit in start.sh
export NODE_OPTIONS="--max-old-space-size=2048"
```

## Performance Optimization

### Enable Nginx Caching

Add to Nginx config:

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Enable Gzip Compression

Add to Nginx config:

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
```

## Monitoring (Optional)

### Setup PM2 Web Dashboard

```bash
pm2 install pm2-server-monit
```

Access at: `http://your-server-ip:9615`

## Quick Reference Commands

```bash
# Application Management
pm2 start karaoke-booking      # Start app
pm2 stop karaoke-booking       # Stop app
pm2 restart karaoke-booking    # Restart app
pm2 logs karaoke-booking       # View logs
pm2 monit                      # Monitor resources

# Nginx Management
sudo systemctl status nginx    # Check status
sudo systemctl restart nginx   # Restart
sudo nginx -t                  # Test config

# View Logs
pm2 logs karaoke-booking       # App logs
sudo tail -f /var/log/nginx/access.log  # Nginx access
sudo tail -f /var/log/nginx/error.log   # Nginx errors

# Backups
~/backup-karaoke.sh           # Manual backup
ls -lh ~/karaoke-backups/     # View backups

# Updates
cd ~/karaoke-booking && git pull && pnpm install && pnpm build && pm2 restart karaoke-booking
```

## Cost Considerations

- **Server:** DigitalOcean Droplet ($6/month) or similar
- **Domain:** ~$10-15/year
- **SSL:** Free with Let's Encrypt
- **Backups:** Use server space or external storage

## Next Steps

1. Configure your settings in the app (Settings tab)
2. Set up WhatsApp Cloud API credentials
3. Configure Stripe keys
4. Add your first rooms
5. Test the booking flow
6. Monitor logs for the first few days

## Support

If you encounter issues:
1. Check logs: `pm2 logs karaoke-booking`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify all environment variables are set
4. Ensure .storage directory has correct permissions

Your karaoke booking system is now deployed and ready for production use!
