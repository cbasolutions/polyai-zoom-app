# PolyAI Zoom Phone Context App

A production-ready Zoom Phone app that displays PolyAI conversation context when calls are forwarded from PolyAI voice agents.

## Features

- 🎯 **Automatic Context Detection**: Extracts project ID and trace ID from Zoom phone context
- 🔄 **Retry Logic**: Automatically retries failed API calls (3 attempts with 1s delay)
- 🎨 **Beautiful UI**: Modern, responsive design with Tailwind CSS
- ⚙️ **Configurable Display**: Per-project field mapping and grouping
- 🔒 **Secure**: API keys handled server-side via Cloudflare Functions
- 🚀 **Fast**: Deployed on Cloudflare's global edge network
- 📱 **Responsive**: Works seamlessly on desktop and mobile

## Architecture

```
┌─────────────────┐
│   Zoom Phone    │
│   (with SDK)    │
└────────┬────────┘
         │ Phone Context
         │ (projectId, traceId)
         ▼
┌─────────────────┐
│  React Frontend │
│  (CloudFlare    │
│   Pages)        │
└────────┬────────┘
         │ HTTP Request
         │ (/api/poly/handoff_state)
         ▼
┌─────────────────┐
│  CF Function    │
│  (TypeScript)   │
└────────┬────────┘
         │ HTTPS + x-api-key
         ▼
┌─────────────────┐
│   PolyAI API    │
└─────────────────┘
```

## Prerequisites

- Node.js 18+ and npm
- Cloudflare account
- PolyAI account with API access
- Zoom Developer account

## Queue Naming Convention

**Critical**: Your PolyAI transfer queues MUST follow this naming pattern:

```
<queue-name>__<projectID>
```

Examples:
- `sales_queue__EXAMPLE-PROJECT-123`
- `support__my-project-123`
- `tier2_support__jupiter-prod`

The app extracts the project ID by:
1. Finding the last `__` in the queue name
2. Taking everything after it as the project ID

## Installation

1. **Clone and install dependencies:**

```bash
git clone <repository-url>
cd polyai-zoom-app
npm install
```

2. **Configure project mappings** (optional):

Edit `src/config/projects.ts` to add field mappings for your projects:

```typescript
export const PROJECT_CONFIGS: ProjectConfigs = {
  'EXAMPLE-PROJECT-123': {
    title: 'Sales Team',
    sections: [
      {
        title: 'Customer Information',
        fields: [
          { key: 'customer_name', label: 'Customer Name', type: 'text' },
          { key: 'account_id', label: 'Account ID', type: 'text' },
          { key: 'email', label: 'Email', type: 'email' }
        ],
        defaultExpanded: true
      },
      {
        title: 'Call Details',
        fields: [
          { key: 'call_reason', label: 'Reason for Call', type: 'text' },
          { key: 'priority', label: 'Priority', type: 'text' }
        ]
      }
    ],
    showRawByDefault: false
  }
};
```

**Field Types:**
- `text` - Plain text display
- `number` - Formatted numbers with commas
- `datetime` - Formatted date/time
- `boolean` - Yes/No badge
- `url` - Clickable link
- `email` - Mailto link

If a project isn't configured, the app will auto-generate fields from the API response.

## Development

```bash
npm run dev
```

This starts Vite dev server on http://localhost:3000

Uses example configurations with sanitized project IDs for local testing.

**Note**: During local development, Cloudflare Functions won't work. You have two options:

1. **Mock the API** (recommended for UI development):
   - The app includes development mode with mock data
   - Automatically activates when running outside Zoom

2. **Use Wrangler dev**:
   ```bash
   npm run build
   npx wrangler pages dev dist --local
   ```

## Deployment

This project uses a two-configuration system to keep git clean while using real project IDs in production:

- **`src/config/projects.ts`** - Example configurations with sanitized IDs (committed to git)
- **`src/config/projects.prod.ts`** - Real project IDs (gitignored, not committed)

### Production Deployment

```bash
npm run deploy:prod
```

This automatically:
1. Swaps in your real project IDs from `projects.prod.ts`
2. Builds the application
3. Deploys to Cloudflare Pages
4. Restores example configurations
5. Keeps git clean with only sanitized examples

**First time deploying?** Create `src/config/projects.prod.ts`:

```bash
# Copy template
cp src/config/projects.ts src/config/projects.prod.ts

# Edit with your REAL project IDs
nano src/config/projects.prod.ts
```

Replace `EXAMPLE-PROJECT-123` with your actual PolyAI project IDs.

> **Note:** The `.gitignore` file prevents `projects.prod.ts` from being committed, so your real project IDs stay private.

For detailed setup instructions, see [PRODUCTION_CONFIG_SETUP.md](PRODUCTION_CONFIG_SETUP.md).

## Manual Deployment (Alternative)

If you prefer manual deployment without the config swap automation:

### Step 1: Build the Project

```bash
npm run build
```

This creates a `dist/` folder with your compiled app.

### Step 2: Create Cloudflare Pages Project

**Option A: Via Wrangler CLI (Recommended)**

```bash
npx wrangler pages deploy dist --project-name=polyai-zoom-app --branch=main
```

**Option B: Via Cloudflare Dashboard**

1. Log into [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Go to **Pages** → **Create a project**
3. Choose **Upload assets**
4. Upload the `dist/` folder

### Step 3: Configure Environment Variables

In Cloudflare Dashboard:

1. Go to **Pages** → Your project → **Settings** → **Environment variables**
2. Add the following variables for **Production**:

```
POLYAI_API_KEY=your-api-key-here
POLYAI_ACCOUNT_ID=your-account-id
POLYAI_BASE_URL=https://api.staging.us-1.platform.polyai.app
```

3. Click **Save**
4. Redeploy if needed

**Variable Descriptions:**
- `POLYAI_API_KEY`: Your PolyAI API authentication key
- `POLYAI_ACCOUNT_ID`: Your PolyAI account identifier
- `POLYAI_BASE_URL`: (Optional) Base URL for PolyAI API. Defaults to staging if not set.

### Step 4: Get Your App URL

After deployment, Cloudflare provides a URL like:
```
https://polyai-zoom-app.pages.dev
```

Or use a custom domain by going to **Custom domains** in your Pages project.

## Zoom App Configuration

### Step 1: Create Zoom App

1. Go to [Zoom App Marketplace](https://marketplace.zoom.us/develop/create)
2. Choose **Build App** → **Zoom Apps**
3. Fill in basic information

### Step 2: Configure App Scopes

Add these scopes:
- `getRunningContext`
- `getPhoneContext`
- `onPhoneContext`

### Step 3: Add Your Domain

In **App Settings** → **Domain Allow List**, add:
```
https://your-cloudflare-pages-url.pages.dev
```

Or your custom domain if using one.

### Step 4: Configure Home URL

Set the Home URL to:
```
https://your-cloudflare-pages-url.pages.dev
```

### Step 5: Publish & Install

1. Submit for review (or use in development mode)
2. Install the app in your Zoom account
3. Test with a call forwarded from PolyAI

## Testing

### Test Call Flow

1. Make a call to your PolyAI voice agent
2. Have the agent transfer the call to a Zoom Phone user who has the app installed
3. The queue name should end with `__PROJECT-ID`
4. When the Zoom user answers, the app should automatically:
   - Extract the project ID and trace ID
   - Fetch handoff state from PolyAI
   - Display formatted call information

### Debugging

Enable development mode to see debug info:

1. Open browser DevTools (F12)
2. Check Console for logs
3. In the app header, you'll see project ID, trace ID, and call ID

## Troubleshooting

### "Missing required parameters: projectId, sharedId"

**Cause**: Queue name doesn't contain `__` or project ID extraction failed.

**Fix**: Ensure queue name follows pattern: `<name>__<projectID>`

### "POLYAI_API_KEY not configured"

**Cause**: Environment variable not set in Cloudflare.

**Fix**: Add `POLYAI_API_KEY` in Pages project settings.

### "Failed to fetch handoff state after 3 attempts"

**Causes**:
- PolyAI API is down
- Wrong API endpoint/credentials
- Network issues

**Fix**: Check Cloudflare Functions logs for detailed error messages.

### SDK Not Loading

**Cause**: CSP or domain allowlist issues.

**Fix**: 
- Verify your domain is in Zoom app allowlist
- Check browser console for CSP errors

### No Data Displayed

**Causes**:
- Call not answered yet (app only triggers on answered calls)
- Project ID extraction failed
- PolyAI has no data for this trace ID

**Fix**: Check debug info in app header (in development mode).

## API Reference

### PolyAI Handoff State API

**Endpoint:**
```
GET /{accountID}/{projectID}/handoff_state?shared_id={traceId}
```

**Headers:**
```
x-api-key: <your-api-key>
```

**Response:**
```json
{
  "data": {
    "field1": "value1",
    "field2": "value2"
  },
  "id": null,
  "shared_id": "1234567890123456789"
}
```

## Project Structure

```
polyai-zoom-app/
├── functions/              # Cloudflare Functions (backend)
│   └── api/
│       └── poly/
│           └── handoff_state.ts
├── scripts/
│   └── deploy-prod.js      # Production deployment script
├── src/
│   ├── components/         # React components
│   │   ├── DataView.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── ErrorMessage.tsx
│   │   ├── Field.tsx
│   │   ├── FieldSection.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── RawDataToggle.tsx
│   ├── config/
│   │   ├── projects.ts     # Example field mappings (in git)
│   │   └── projects.prod.ts # Real project IDs (gitignored)
│   ├── hooks/
│   │   └── useZoomPhoneContext.ts
│   ├── services/
│   │   └── polyai.ts       # API service
│   ├── types/
│   │   └── index.ts        # TypeScript types
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # Entry point
│   └── index.css           # Styles
├── index.html
├── package.json
├── vite.config.ts
├── wrangler.toml
└── README.md
```

## Zoom Marketplace Submission

If you plan to publish this app on the Zoom App Marketplace, here are key requirements and tips:

### Required Assets

**App Icon**
- Size: 512x512 pixels
- Format: PNG with transparent background
- Should represent your brand or the app's purpose

**Screenshots**
- Provide 3-5 screenshots showing the app in action
- Recommended size: 1280x800 pixels
- Show key features: waiting state, data display, error handling

**Privacy Policy**
- Required for marketplace submission
- Can be hosted on GitHub Pages, your website, or Cloudflare Pages
- Template available at: https://www.privacypolicygenerator.info/

### Submission Checklist

- [ ] **Domain Verification**: Verify your Cloudflare Pages domain in Zoom Developer Console
- [ ] **Scope Justification**: Explain why each scope is needed
  - `getRunningContext`: "To determine when the app is active"
  - `getPhoneContext`: "To access call information and caller details"
  - `onPhoneContext`: "To receive real-time call status updates"
- [ ] **App Description**: Keep under 200 words, focus on benefits
- [ ] **Test Thoroughly**: Test with real PolyAI transfers before submitting
- [ ] **Support Contact**: Provide valid support email/URL

### Common Rejection Reasons

1. **Missing Privacy Policy**: Must be publicly accessible URL
2. **Insufficient Scope Justification**: Explain *why* you need each permission
3. **Broken Links**: All URLs must be valid and accessible
4. **Poor Screenshots**: Must show actual app functionality, not placeholders

### Timeline

- **Review Period**: 2-4 weeks
- **Resubmission**: If rejected, address feedback and resubmit
- **Updates**: Once approved, updates are typically faster (1-2 weeks)

### Development vs Production

**Local Test Mode**
- Install directly in your Zoom account without marketplace approval
- Perfect for testing and internal use
- Accessible only to your organization

**Marketplace Distribution**
- Required for public availability
- Zoom performs security and UX review
- Accessible to all Zoom users

## Contributing

### Adding New Projects

1. Edit `src/config/projects.prod.ts` (for production)
2. Add your project ID and field mappings
3. Deploy with `npm run deploy:prod`

### Customizing UI

- Modify components in `src/components/`
- Update Tailwind classes for styling
- See [Tailwind docs](https://tailwindcss.com/docs) for reference

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Copyright (c) 2026 CBA Solutions, LLC

## Changelog

### Version 1.0.1 (2026-01-31)

**Improvements:**
- Added production deployment workflow with config swapping
- Added ErrorBoundary component for graceful error handling
- Added 10-second fetch timeout to prevent hanging requests
- Fixed footer character encoding issues
- Added MIT License

**Features:**
- Automatic project ID extraction from queue names
- 3-attempt retry logic with 1-second delays
- 10-second fetch timeout for reliability
- Error boundary for graceful error handling
- Mobile-responsive design
- Raw JSON toggle for debugging
- Separate production and example configurations

**Security:**
- API keys handled server-side only
- No sensitive data in client code
- Production configs gitignored
- CORS-enabled Cloudflare Functions
- Environment variable configuration

## Support

For issues or questions:
- Check troubleshooting section above
- Review Cloudflare Functions logs
- See [PRODUCTION_CONFIG_SETUP.md](PRODUCTION_CONFIG_SETUP.md) for deployment details
- Contact PolyAI support for API issues
- Contact Zoom support for SDK issues
