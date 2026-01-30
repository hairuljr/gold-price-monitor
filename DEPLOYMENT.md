# Deployment Guide

## Prerequisites

1. **Node.js** v18+ and npm installed
2. **Git** repository initialized
3. **Environment variables** configured

## Environment Setup

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

The default values in `.env.example` should work, but you can customize:
- `VITE_PUSHER_APP_KEY` - Pusher app key
- `VITE_PUSHER_CLUSTER` - Pusher cluster (default: ap1)
- `VITE_CHANNEL_NAME` - Pusher channel name
- `VITE_EVENT_NAME` - Pusher event name

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Run tests once (for CI)
npm run test:run
```

## Production Build

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

The build output will be in the `dist/` directory.

## Deployment Options

### Option 1: Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Add environment variables in Vercel dashboard (if needed)

### Option 2: Netlify

1. Install Netlify CLI:
```bash
npm i -g netlify-cli
```

2. Deploy:
```bash
netlify deploy --prod
```

3. Or use Netlify's GitHub integration for automatic deployments

### Option 3: GitHub Pages

1. Add to `vite.config.js`:
```javascript
base: '/repository-name/'
```

2. Build and deploy:
```bash
npm run build
npx gh-pages -d dist
```

## Post-Deployment Checklist

- [ ] Test real-time price updates
- [ ] Test notification permissions
- [ ] Test on mobile  devices
- [ ] Run Lighthouse audit (Performance >90, SEO >90)
- [ ] Test social media sharing (OpenGraph preview)
- [ ] Verify PWA install prompt appears
- [ ] Create app icons (192x192, 512x512) and place in `/public`

## PWA App Icons

Icons need to be created manually. Create two PNG files:

- `/public/icon-192.png` - 192x192 pixels
- `/public/icon-512.png` - 512x512 pixels

Recommended: Use a gold coin or gold bar symbol with dark gradient background (#1a1a2e).

## Performance Optimization

The app is pre-configured with:
- Code splitting (vendor chunks separate from app code)
- Terser minification with console.log removal
- Gzip/Brotli compression (depends on hosting provider)
- CSP headers for security

Expected Lighthouse scores:
- **Performance**: >90
- **Accessibility**: >95
- **Best Practices**: >90
- **SEO**: >90

## Monitoring

For production monitoring, consider integrating:
- **Sentry** for error tracking
- **Google Analytics** for usage analytics
- **Uptime monitoring** (e.g., UptimeRobot)

## Security Notes

- Pusher credentials are client-side and public (safe to expose)
- CSP headers prevent XSS attacks
- All external resources loaded via HTTPS
- No sensitive data stored in localStorage
