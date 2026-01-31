# Quick Start Guide

Get your PolyAI Zoom Phone app running in 15 minutes.

## Prerequisites

- Node.js 18+ installed
- Cloudflare account (free tier works)
- PolyAI API credentials
- Zoom Developer account

## Step 1: Install (2 min)

```bash
cd polyai-zoom-app
npm install
```

## Step 2: Configure Projects (3 min)

Edit `src/config/projects.ts`:

```typescript
'YOUR-PROJECT-ID': {
  title: 'Your Team Name',
  sections: [
    {
      title: 'Customer Info',
      fields: [
        { key: 'customer_name', label: 'Customer', type: 'text' },
        { key: 'issue', label: 'Issue', type: 'text' }
      ]
    }
  ]
}
```

**Note**: If you skip this, the app will auto-generate fields from API responses.

## Step 3: Deploy to Cloudflare (5 min)

```bash
# Build
npm run build

# Deploy
npx wrangler login
npx wrangler pages deploy dist --project-name=polyai-zoom-app
```

Copy the URL from output:
```
âœ¨ Deployment complete! https://xyz.polyai-zoom-app.pages.dev
```

## Step 4: Set Environment Variables (2 min)

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. **Pages** â†’ **polyai-zoom-app** â†’ **Settings** â†’ **Environment variables**
3. Add these for **Production**:

```
POLYAI_API_KEY = your-api-key-here
POLYAI_ACCOUNT_ID = your-account-id
POLYAI_BASE_URL = https://api.staging.us-1.platform.polyai.app
```

4. Click **Save and Deploy**

## Step 5: Configure Zoom App (3 min)

1. Go to [Zoom Marketplace](https://marketplace.zoom.us/develop/create)
2. Create a **Zoom Apps** app
3. Add scopes: `getRunningContext`, `getPhoneContext`, `onPhoneContext`
4. Set Home URL: `https://xyz.polyai-zoom-app.pages.dev`
5. Add to domain allowlist: `https://xyz.polyai-zoom-app.pages.dev`
6. Install in your Zoom account (Local Test mode)

## Step 6: Configure PolyAI Queues

Ensure transfer queues end with `__PROJECT-ID`:

```
sales_queue__EXAMPLE-PROJECT-123
support__my-project-123
```

## Step 7: Test!

1. Call your PolyAI agent
2. Have it transfer to your Zoom Phone
3. Answer the call
4. See context automatically appear! ðŸŽ‰

## Troubleshooting

**App shows "SDK missing"**
â†’ Check Zoom app domain allowlist

**"POLYAI_API_KEY not configured"**
â†’ Verify environment variables in Cloudflare dashboard

**No data displayed**
â†’ Ensure queue name ends with `__PROJECT-ID`

## Next Steps

- Customize UI in `src/components/`
- Add more projects to `src/config/projects.ts`
- Set up custom domain (optional)
- Submit to Zoom Marketplace (optional)

## Full Documentation

- **README.md** - Complete feature documentation
- **DEPLOYMENT_GUIDE.md** - Detailed deployment steps
- **MIGRATION_SUMMARY.md** - What changed from old version

## Need Help?

Check the troubleshooting sections in README.md and DEPLOYMENT_GUIDE.md.
