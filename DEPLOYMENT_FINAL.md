# DEPLOYMENT - Final Instructions

## ✅ BUILD IS NOW FIXED

The build issue has been resolved. Here's what changed:

### What Was Fixed
- ✅ Updated `vite.config.ts` to build client assets properly
- ✅ Created `server.js` for production Node.js server
- ✅ Added `@hono/node-server` dependency
- ✅ Updated build scripts in `package.json`

### Build Output Structure
```
karaoke-booking/
├── dist/
│   └── static/
│       ├── main.js          # Client JavaScript bundle
│       └── assets/
│           └── main.css     # Styles
├── src/                     # Source code (used by server)
│   ├── client/
│   └── server/
├── server.js                # Production server entry point
└── .storage/                # Your data
```

## Production Deployment (Debian 12)

### Step 1: Transfer and Build

```bash
# On your server
cd ~/karaoke-booking

# Install dependencies
pnpm install

# Build (creates dist/static/)
pnpm run build

# Test locally
pnpm start
# Visit http://localhost:3000 to verify it works
```

### Step 2: Setup PM2

```bash
# Create ecosystem file
cat > ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [{
    name: 'karaoke-booking',
    script: './server.js',
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
pm2 startup  # Run the command it outputs
pm2 status   # Verify it's running
```

### Step 3: Nginx Configuration

```nginx
server {
    listen 80;
    server_name bookings.level8mcr.co.uk;

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

### Step 4: SSL with Let's Encrypt

```bash
sudo certbot --nginx -d bookings.level8mcr.co.uk
```

## Quick Commands Reference

```bash
# Build the app
pnpm run build

# Run locally (test)
pnpm start

# Production with PM2
pm2 start ecosystem.config.cjs
pm2 restart karaoke-booking
pm2 stop karaoke-booking
pm2 logs karaoke-booking
pm2 status

# Update deployment
cd ~/karaoke-booking
git pull  # or rsync new files
pnpm install
pnpm run build
pm2 restart karaoke-booking
```

## Environment Variables

Set in `ecosystem.config.cjs`:

```javascript
env: {
  NODE_ENV: 'production',
  PORT: 3000,
  APP_URL: 'https://bookings.level8mcr.co.uk'
}
```

**Note:** API keys (WhatsApp, Stripe, SMTP) are configured through the web UI in Settings, not via environment variables. They're stored in `.storage/settings/settings`.

## File Permissions

```bash
# Ensure .storage is writable
chmod 755 ~/karaoke-booking/.storage
chown -R $USER:$USER ~/karaoke-booking/.storage
```

## Backups

```bash
# Backup script
cat > ~/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR=~/karaoke-backups
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/storage_$DATE.tar.gz -C ~/karaoke-booking .storage
find $BACKUP_DIR -mtime +30 -delete
echo "Backup created: storage_$DATE.tar.gz"
EOF

chmod +x ~/backup.sh

# Schedule daily backups (2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * ~/backup.sh") | crontab -
```

## Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf node_modules dist
pnpm install
pnpm run build
```

### App Won't Start
```bash
# Check logs
pm2 logs karaoke-booking

# Common issues:
# 1. Port already in use
sudo lsof -i :3000  # Check what's using port 3000

# 2. Permissions
ls -la .storage/  # Should be owned by your user

# 3. Missing dependencies
pnpm install
```

### Can't Access Website
```bash
# Check app is running
pm2 status
curl http://localhost:3000

# Check Nginx
sudo nginx -t
sudo systemctl status nginx

# Check firewall
sudo ufw status
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### WhatsApp Not Working
1. Check Settings → WhatsApp Cloud API credentials
2. Phone numbers must include country code (+44...)
3. Test numbers must be added in Meta Business dashboard

## Production Checklist

Before going live:

- [ ] `pnpm run build` completes successfully
- [ ] PM2 shows app running: `pm2 status`
- [ ] Can access http://localhost:3000 on server
- [ ] Nginx configured and running
- [ ] SSL certificate installed
- [ ] Firewall allows ports 80 and 443
- [ ] .storage directory has correct permissions
- [ ] Backups scheduled
- [ ] WhatsApp Cloud API configured
- [ ] Stripe keys configured
- [ ] Rooms added
- [ ] Test booking completed

## What Gets Built

When you run `pnpm run build`:

1. **TypeScript Compilation** (`tsc -b`)
   - Checks types across entire project
   - No output files (just validation)

2. **Vite Build** (`vite build`)
   - Bundles client code: `src/client/**` → `dist/static/main.js`
   - Optimizes CSS: → `dist/static/assets/main.css`
   - Minifies and tree-shakes code
   - Creates production-ready assets

3. **Server Code**
   - Runs directly from `src/server/` (no build needed)
   - Node.js handles ESM imports natively
   - `server.js` starts the Hono server

## Performance Tips

```javascript
// In ecosystem.config.cjs, add:
env: {
  NODE_ENV: 'production',
  PORT: 3000,
  NODE_OPTIONS: '--max-old-space-size=2048'  // If you need more memory
}
```

## You're Ready! 🚀

Your build is now working correctly. Follow the deployment steps above and you'll be live in 30 minutes!

For detailed step-by-step instructions, see:
- **QUICK_DEPLOY.md** - Fast deployment guide
- **DEPLOYMENT_GUIDE.md** - Complete deployment with security
