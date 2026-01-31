# Production Configuration Deployment Setup

This guide sets up a workflow where:
- **Git/GitHub** has sanitized example configs (safe to share)
- **Production** uses real project IDs
- **Deployment** automatically swaps configs

## Quick Setup (5 minutes)

### Step 1: Create Directories
```bash
mkdir -p scripts
```

### Step 2: Add Files

Copy these files to your repo:

1. **scripts/deploy-prod.js** - Deployment script
2. **src/config/projects.prod.ts** - Production config (with real IDs)
3. **.gitignore** - Updated to exclude prod config
4. **package.json** - Updated with deploy:prod script

### Step 3: Configure Production Project IDs

Edit `src/config/projects.prod.ts` and add your real project IDs:

```typescript
export const PROJECT_CONFIGS: ProjectConfigs = {
  'PROJECT-1PYAZS6A': {  // ← Your REAL project ID
    title: 'Sales Team',
    sections: [
      // ... your actual field mappings
    ]
  }
};
```

### Step 4: Keep Git Clean

Your `src/config/projects.ts` should only have example IDs:

```typescript
export const PROJECT_CONFIGS: ProjectConfigs = {
  'EXAMPLE-PROJECT-123': {  // ← Sanitized example
    title: 'Example Project',
    sections: [
      // ... example configuration
    ]
  }
};
```

### Step 5: Make Script Executable

```bash
chmod +x scripts/deploy-prod.js
```

## Usage

### Development (Local Testing)
```bash
npm run dev
```
Uses example config from `projects.ts`

### Production Deployment
```bash
npm run deploy:prod
```

This will:
1. ✅ Backup `projects.ts` (example config)
2. ✅ Copy `projects.prod.ts` → `projects.ts` (real config)
3. ✅ Build the app with real project IDs
4. ✅ Deploy to Cloudflare
5. ✅ Restore `projects.ts` (example config)

Your git repo stays clean! 🎉

## File Structure

```
polyai-zoom-app/
├── scripts/
│   └── deploy-prod.js          # Production deployment script
├── src/
│   └── config/
│       ├── projects.ts         # Example config (in git)
│       └── projects.prod.ts    # Real config (gitignored)
├── .gitignore                  # Excludes projects.prod.ts
└── package.json                # Updated with deploy:prod script
```

## What Gets Committed to Git?

**✅ Committed (public):**
- `src/config/projects.ts` - Example config with sanitized IDs
- `scripts/deploy-prod.js` - Deployment script
- `.gitignore` - Excludes prod config
- All other source files

**❌ NOT Committed (private):**
- `src/config/projects.prod.ts` - Real project IDs
- `.env` files
- `node_modules/`
- `dist/`

## Verification

### Check Git Status
```bash
git status
```

Should NOT show `projects.prod.ts` (it's gitignored)

### Check What's Committed
```bash
git log --oneline -1
```

Should only show example configs in history.

### Check Production
Visit your app and make a test call. Should display properly formatted data using your real project configuration.

## Common Workflows

### Adding a New Project

1. Edit `src/config/projects.prod.ts`:
   ```typescript
   'NEW-PROJECT-ID': {
     title: 'New Project',
     sections: [...]
   }
   ```

2. Test locally (optional):
   ```bash
   # Temporarily copy prod config for testing
   cp src/config/projects.prod.ts src/config/projects.ts
   npm run dev
   # Don't commit this!
   ```

3. Deploy:
   ```bash
   npm run deploy:prod
   ```

### Updating Documentation

Update `src/config/projects.ts` with better examples:
```bash
# Edit projects.ts with improved examples
git add src/config/projects.ts
git commit -m "docs: Improve project configuration examples"
git push
```

This updates documentation without affecting production.

### Team Collaboration

**Share with team:**
1. Commit the deployment script and example config
2. Share `projects.prod.ts` securely (not via git):
   - Password manager
   - Encrypted file share
   - Secure team docs

**Team member setup:**
```bash
git clone <repo>
cd polyai-zoom-app
npm install

# Add production config (get from secure source)
# Place in src/config/projects.prod.ts

# Deploy
npm run deploy:prod
```

## Troubleshooting

### "projects.prod.ts not found"
Create it from the template:
```bash
cp src/config/projects.ts src/config/projects.prod.ts
# Edit with real project IDs
```

### "Script fails during deployment"
The script automatically restores example config even if deployment fails. Your git repo stays clean.

### "Accidentally committed projects.prod.ts"
Remove it from git history:
```bash
git rm --cached src/config/projects.prod.ts
git commit -m "Remove production config from git"
git push
```

### "Want to test with prod config locally"
```bash
# Temporarily use prod config
cp src/config/projects.prod.ts src/config/projects.ts
npm run dev

# When done, restore example config
git checkout src/config/projects.ts
```

## Advanced: Environment Variables (Alternative)

If you prefer, you can store project configs as JSON in Cloudflare environment variables:

1. In Cloudflare Dashboard → Pages → Settings → Environment Variables
2. Add: `PROJECT_CONFIGS` = `{"PROJECT-ID": {...}}`
3. Update your code to read from environment

This approach keeps configs entirely out of code.

## Security Best Practices

✅ **DO:**
- Keep `projects.prod.ts` in `.gitignore`
- Use `npm run deploy:prod` for production
- Share prod configs securely with team
- Regularly review git history for leaks

❌ **DON'T:**
- Commit `projects.prod.ts` to git
- Share production config in public channels
- Include API keys or credentials in configs
- Push directly without using deploy script

## Summary

**Before this setup:**
- Real project IDs in git ❌
- Manual config swapping 😓
- Risk of exposing sensitive data 🚨

**After this setup:**
- Clean git with examples ✅
- Automatic config swapping 🎉
- Production uses real IDs 🔒
- One command deployment 🚀

---

**Ready to deploy?**
```bash
npm run deploy:prod
```

Your git stays clean while production works perfectly! 🎯
