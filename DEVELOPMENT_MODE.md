# Development Mode Guide

## Why You See "SDK Not Supported"

The Zoom Apps SDK **only works inside the Zoom client**. When you open the app in a regular browser (Chrome, Firefox, Safari), you'll see an error because the SDK isn't available.

## 🔧 Development Mode (NEW!)

The app now automatically detects when you're running outside Zoom and enables **Development Mode** with mock data.

### When Development Mode Activates

✅ Running `npm run dev` (localhost)
✅ In a regular web browser
✅ Zoom SDK not detected

### What You'll See

```
┌─────────────────────────────────────────────────┐
│ 🔧 Development Mode: Running outside Zoom with  │
│ mock data. To test with real calls, open this  │
│ app inside the Zoom client.                     │
└─────────────────────────────────────────────────┘
```

The app will:
- Load with mock call data (EXAMPLE-PROJECT-123)
- Show the UI as if a call was answered
- Allow you to test the layout and components
- **Note:** API calls to PolyAI will still fail (need real backend)

### Mock Data Included

```json
{
  "projectId": "EXAMPLE-PROJECT-123",
  "traceId": "7601004800052340345",
  "callStatus": "Active",
  "forwardedBy": {
    "name": "zoomapp test__EXAMPLE-PROJECT-123"
  }
}
```

## 🧪 Testing the Full Flow

To test with **real calls**, you must:

### 1. Deploy to Cloudflare Pages

```bash
npm run build
npx wrangler pages deploy dist
```

### 2. Configure Zoom App

- Add your Cloudflare Pages URL to Zoom app allowlist
- Install the app in your Zoom account

### 3. Open in Zoom

- Launch Zoom desktop app or Zoom Phone
- Go to **Apps**
- Open your "PolyAI Context" app

### 4. Make Test Call

- Have PolyAI transfer a call to your Zoom number
- Answer the call
- The app should detect it and fetch real context

## 🔄 Switching Between Modes

**Development (mock data):**
```bash
npm run dev
# Open http://localhost:3000 in browser
```

**Production (real Zoom):**
```bash
npm run build
npx wrangler pages deploy dist
# Open in Zoom client
```

## 🐛 Troubleshooting Development Mode

### "Still seeing SDK error"
- Wait 1 second after page loads (development mode activates automatically)
- Check browser console for `🔧 Development mode enabled` message

### "Want to disable development mode"
- Set environment variable: `VITE_DISABLE_DEV_MODE=true`
- Or comment out the mock data section in `useZoomPhoneContext.ts`

### "API calls failing in dev mode"
This is expected! The PolyAI API proxy requires:
- Valid environment variables (POLYAI_API_KEY, POLYAI_ACCOUNT_ID)
- Deployment to Cloudflare (Functions don't run in local dev)

For UI development, the mock context is enough. For API testing, deploy to Cloudflare.

## 📝 Summary

| Environment | SDK Available | Shows Mock Data | API Works |
|-------------|--------------|-----------------|-----------|
| Browser (dev) | ❌ No | ✅ Yes | ❌ No |
| Zoom Client (dev) | ✅ Yes | ❌ No | ⚠️ Maybe* |
| Cloudflare + Zoom | ✅ Yes | ❌ No | ✅ Yes |

*Depends on if you've set up Cloudflare environment variables

## 💡 Best Development Workflow

1. **UI Changes**: Use `npm run dev` with mock data
2. **API Testing**: Deploy to Cloudflare, test in Zoom
3. **Full Integration**: Deploy to Cloudflare, test real calls

This way you can rapidly iterate on UI without needing Zoom for every change!
