# Cloudflare Pages Deployment Guide

Step-by-step guide to deploy your PolyAI Zoom Phone app to Cloudflare Pages.

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] Cloudflare account created (free tier works)
- [ ] PolyAI API key and account ID
- [ ] Zoom Developer account

## Part 1: Initial Setup

### 1. Install Dependencies

```bash
cd polyai-zoom-app
npm install
```

### 2. Configure Project Settings

Edit `src/config/projects.ts` to add your PolyAI projects:

```typescript
'YOUR-PROJECT-ID': {
  title: 'Your Project Name',
  sections: [
    {
      title: 'Section Name',
      fields: [
        { key: 'api_field_name', label: 'Display Label', type: 'text' }
      ]
    }
  ]
}
```

### 3. Test Locally (Optional)

```bash
npm run dev
```

Visit http://localhost:3000 to verify the UI.

## Part 2: Build and Deploy

### 4. Build the Production Bundle

```bash
npm run build
```

This creates a `dist/` folder with optimized files.

### 5. Deploy to Cloudflare Pages

**Method A: Command Line (Recommended)**

```bash
# Login to Cloudflare (first time only)
npx wrangler login

# Deploy
npx wrangler pages deploy dist --project-name=polyai-zoom-app
```

You'll see output like:
```
âœ¨ Success! Uploaded 15 files (2.5 sec)
âœ¨ Deployment complete! Take a peek at https://abc123.polyai-zoom-app.pages.dev
```

**Method B: Web Dashboard**

1. Go to https://dash.cloudflare.com
2. Navigate to **Pages** in the left sidebar
3. Click **Create a project**
4. Choose **Upload assets**
5. Click **Upload folder** and select the `dist/` folder
6. Name your project `polyai-zoom-app`
7. Click **Deploy site**

## Part 3: Configure Environment Variables

### 6. Add Environment Variables

In Cloudflare Dashboard:

1. Go to **Pages** â†’ **polyai-zoom-app**
2. Click **Settings** tab
3. Scroll to **Environment variables**
4. Click **Add variable** for each:

**Production Environment:**

| Variable Name | Value | Example |
|--------------|-------|---------|
| `POLYAI_API_KEY` | Your API key | `pk_live_abc123...` |
| `POLYAI_ACCOUNT_ID` | Your account ID | `your-account-id` |
| `POLYAI_BASE_URL` | API base URL | `https://api.staging.us-1.platform.polyai.app` |

5. Click **Save and Deploy**

### 7. Verify Deployment

Visit your app URL (shown after deployment):
```
https://polyai-zoom-app.pages.dev
```

You should see the app interface with "Waiting for Call" status.

## Part 4: Zoom App Setup

### 8. Create Zoom App

1. Go to https://marketplace.zoom.us/develop/create
2. Click **Build App**
3. Choose **Zoom Apps**
4. Fill in:
   - **App Name**: PolyAI Context
   - **Short Description**: View PolyAI call context
   - **Company Name**: Your company

### 9. Configure App Information

**Basic Information:**
- Upload app icon (optional)
- Add long description
- Select category: **Productivity**

**Scopes & Features:**

Enable these capabilities:
- `getRunningContext`
- `getPhoneContext`
- `onPhoneContext`

### 10. Set App URLs

**Home URL:**
```
https://polyai-zoom-app.pages.dev
```

**Redirect URL for OAuth:** (if required)
```
https://polyai-zoom-app.pages.dev/auth/callback
```

### 11. Configure Domain Allowlist

Add your Cloudflare Pages domain:
```
https://polyai-zoom-app.pages.dev
```

**Important**: Must be HTTPS, not HTTP.

### 12. Configure CSP (Content Security Policy)

In **App Settings**, add these CSP directives:

```
default-src 'self'; 
script-src 'self' 'unsafe-inline' https://appssdk.zoom.us; 
connect-src 'self' https://api.staging.us-1.platform.polyai.app; 
style-src 'self' 'unsafe-inline';
```

### 13. Test in Development Mode

1. In Zoom App settings, click **Local Test**
2. Install the app in your Zoom account
3. Open Zoom Phone app
4. The PolyAI Context app should appear in your apps list

## Part 5: PolyAI Configuration

### 14. Configure Transfer Queues

Ensure your PolyAI transfer queues follow the naming pattern:

```
<queue_name>__<PROJECT_ID>
```

Examples:
- âœ… `sales_support__EXAMPLE-PROJECT-123`
- âœ… `tier1__jupiter-prod`
- âŒ `sales_support` (no project ID)
- âŒ `EXAMPLE-PROJECT-123_support` (wrong format)

### 15. Test Full Integration

1. Call your PolyAI voice agent
2. Complete the conversation flow
3. Have PolyAI transfer to your Zoom Phone number
4. Answer the call in Zoom
5. The app should:
   - Automatically detect the call
   - Extract project ID from queue name
   - Fetch handoff state
   - Display formatted call information

## Part 6: Production Deployment

### 16. Submit for Review (Optional)

If publishing to Zoom Marketplace:

1. Fill out all required information
2. Submit for review
3. Wait for approval (can take 1-2 weeks)

### 17. Install in Production

Once approved:
1. Go to Zoom Marketplace
2. Search for your app
3. Install in your Zoom account

## Part 7: Custom Domain (Optional)

### 18. Add Custom Domain

If you want to use your own domain:

1. In Cloudflare Pages, go to **Custom domains**
2. Click **Set up a custom domain**
3. Enter your domain (e.g., `zoom.yourdomain.com`)
4. Follow DNS instructions to:
   - Add CNAME record pointing to your Pages project
5. Wait for SSL certificate provisioning (~24 hours)
6. Update Zoom app URLs to use custom domain

## Troubleshooting Deployment

### Issue: "npm install fails"

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Build fails with TypeScript errors"

**Solution:**
```bash
npm run build -- --mode development
```

Check console for specific errors, fix, then rebuild.

### Issue: "Environment variables not working"

**Checklist:**
- [ ] Variables added in Cloudflare dashboard
- [ ] Variables added to **Production** environment
- [ ] Clicked **Save and Deploy** (not just Save)
- [ ] Waited 1-2 minutes for deployment

### Issue: "Function returns 500 error"

**Debug steps:**
1. Go to Cloudflare Dashboard â†’ **Pages** â†’ Your project
2. Click **Functions** tab
3. Check logs for error messages
4. Common causes:
   - Typo in environment variable names
   - Wrong API endpoint URL
   - Invalid API key

### Issue: "Zoom app doesn't load"

**Checklist:**
- [ ] Domain in Zoom allowlist exactly matches (no trailing slash)
- [ ] Using HTTPS, not HTTP
- [ ] CSP configured correctly
- [ ] App installed and enabled in Zoom account

## Updating Your Deployment

### To Deploy Updates:

```bash
# Make your changes
# Test locally
npm run dev

# Build
npm run build

# Deploy
npx wrangler pages deploy dist
```

### To Update Environment Variables:

1. Cloudflare Dashboard â†’ **Pages** â†’ Your project â†’ **Settings**
2. Edit variables under **Environment variables**
3. Click **Save and Deploy**

## Rollback

If a deployment breaks:

1. Go to Cloudflare Dashboard â†’ **Pages** â†’ Your project
2. Click **Deployments** tab
3. Find the last working deployment
4. Click **Â·Â·Â·** â†’ **Rollback to this deployment**

## Monitoring

### View Logs

**Function Logs:**
1. Cloudflare Dashboard â†’ **Pages** â†’ Your project
2. Click **Functions** tab
3. Click **View logs**

**Real-time Monitoring:**
```bash
npx wrangler pages deployment tail
```

### Analytics

In Cloudflare Dashboard:
- **Pages** â†’ Your project â†’ **Analytics**
- See requests, bandwidth, errors

## Cost

Cloudflare Pages **Free Tier** includes:
- Unlimited sites
- Unlimited requests
- Unlimited bandwidth
- 500 builds/month
- 100,000 Functions requests/day

This is more than enough for most deployments.

## Next Steps

- [ ] Test with real calls
- [ ] Monitor logs for errors
- [ ] Add more project configurations
- [ ] Customize UI/styling
- [ ] Set up custom domain
- [ ] Submit to Zoom Marketplace

## Support Resources

- **Cloudflare Pages Docs**: https://developers.cloudflare.com/pages/
- **Cloudflare Functions Docs**: https://developers.cloudflare.com/pages/functions/
- **Zoom Apps SDK Docs**: https://developers.zoom.us/docs/zoom-apps/
- **Wrangler CLI Docs**: https://developers.cloudflare.com/workers/wrangler/

## Quick Reference Commands

```bash
# Install dependencies
npm install

# Local development
npm run dev

# Build production
npm run build

# Deploy to Cloudflare
npx wrangler pages deploy dist

# View logs
npx wrangler pages deployment tail

# Login to Cloudflare
npx wrangler login
```
