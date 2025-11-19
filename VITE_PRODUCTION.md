# Understanding Vite Production Mode

## Why No Separate dist/server Folder?

This application uses Vite, which has a different build approach than traditional Node.js apps.

## How It Works

### Development Mode
```bash
pnpm run dev
```
Vite runs both the client and server in development mode with hot reload.

### Production Mode
```bash
pnpm run build  # Compiles TypeScript and optimizes client assets
pnpm run preview  # Runs the production server
```

## What `pnpm run build` Does

1. **TypeScript Compilation**: `tsc -b` compiles all TypeScript to check types
2. **Vite Build**: Creates optimized client bundle in `dist/` (contains HTML, JS, CSS)
3. **Server**: Server code stays in `src/server/` but runs through Vite's preview server

## Production Deployment Options

### Option 1: Vite Preview (Recommended - Simplest)
```bash
pnpm run build
pm2 start "pnpm run preview" --name karaoke-booking
```
**Pros:**
- Simple, one command
- Works exactly like dev mode
- Handles all Vite optimizations

**Cons:**
- Requires pnpm on server

### Option 2: Custom Node Server (Advanced)
If you want a standalone Node server, you need to:

1. Create a custom server script
2. Serve static files from `dist/`
3. Handle SSR if needed

But for this app, **Option 1 is recommended** as it's simpler and works perfectly.

## File Structure After Build

```
karaoke-booking/
├── dist/                    # Built client files (HTML, JS, CSS)
│   ├── assets/             # Optimized JS and CSS
│   └── index.html          # Entry point
├── src/                     # Source code (still used by preview)
│   ├── client/             # Client React code
│   └── server/             # Server Hono code
├── .storage/               # Your data (bookings, customers, etc.)
├── node_modules/
└── package.json
```

## Why This Approach?

Vite's preview mode:
- Serves optimized client files from `dist/`
- Runs server code directly (transpiled on-the-fly by Node's ESM loader)
- Provides production-like performance
- Simpler than creating separate client/server builds

## Environment Variables

Set via:
1. **PM2 ecosystem file** (recommended)
2. **.env.production** file
3. **System environment**

Example ecosystem.config.cjs:
```javascript
module.exports = {
  apps: [{
    name: 'karaoke-booking',
    script: 'pnpm',
    args: 'run preview',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      APP_URL: 'https://your-domain.com'
    }
  }]
};
```

## Performance

Vite preview mode is production-ready:
- Minified JavaScript
- Optimized CSS
- Tree-shaken code
- Compressed assets
- Fast cold starts
- Low memory usage

## Alternative: Building Standalone Server

If you absolutely need a standalone Node.js server without Vite, you would need to:

1. Create `server-prod.js`:
```javascript
import { createServer } from 'vite'
import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const app = express()

// Serve static files
app.use(express.static(resolve(__dirname, 'dist')))

// Your Hono server routes here
// ...

app.listen(3000)
```

2. Update package.json:
```json
{
  "scripts": {
    "start": "node server-prod.js"
  }
}
```

But again, **this is unnecessary** for this app. Vite preview works great!

## Monitoring Production

```bash
# View logs
pm2 logs karaoke-booking

# Monitor resources
pm2 monit

# Check status
pm2 status
```

## Summary

**TL;DR**: Don't worry about the lack of `dist/server/`. Run `pnpm run build` then `pnpm run preview` with PM2. It works perfectly for production!
