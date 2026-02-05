# Fix Cloudflare Pages Deployment Error

## The Problem

Cloudflare is trying to deploy as a **Worker** instead of a **static Pages site**. The error shows:
```
Executing user deploy command: npx wrangler deploy
```

This is wrong! Cloudflare Pages should NOT have a deploy command.

## The Solution

### Step 1: Fix Build Settings in Cloudflare

1. Go to your Cloudflare Pages project dashboard
2. Click **"Settings"** → **"Builds & deployments"**
3. Check these settings:

**✅ Build command:**
```
npm run build
```

**✅ Build output directory:**
```
dist
```

**❌ Deploy command:**
```
(Leave this EMPTY - delete any value here!)
```

**IMPORTANT:** There should be NO deploy command. If there's a deploy command set, DELETE IT.

### Step 2: Verify Framework Preset

1. In the same settings page
2. **Framework preset:** Should be `Vite` or `None`
3. If it's set to something else, change it to `Vite`

### Step 3: Save and Redeploy

1. Click **"Save"**
2. Go to **"Deployments"** tab
3. Click the **"..."** menu on the latest deployment
4. Click **"Retry deployment"**

OR

1. Make a small change to trigger a new build:
   ```bash
   git commit --allow-empty -m "Trigger rebuild"
   git push
   ```

## Why This Happened

Cloudflare Pages might have:
- Auto-detected a Worker configuration
- Had a deploy command set from a previous project
- Misconfigured the build settings

## Correct Configuration

For a **static Vite/React site**, Cloudflare Pages should:

✅ **Build command:** `npm run build`  
✅ **Build output directory:** `dist`  
✅ **Framework preset:** `Vite`  
❌ **Deploy command:** (empty/none)  
❌ **Root directory:** (empty, unless your project is in a subfolder)

## After Fixing

Once you remove the deploy command and save:
- Cloudflare will build your static site
- Output will be served from the `dist` directory
- No Worker deployment needed

## Still Having Issues?

If it still tries to use wrangler:

1. **Delete and recreate the project:**
   - Delete the current Pages project
   - Create a new one
   - Connect to the same GitHub repo
   - Use the correct settings (no deploy command!)

2. **Check for functions directory:**
   ```bash
   # Make sure you don't have a functions/ directory
   ls -la functions/
   ```
   If it exists and you don't need it, delete it.

3. **Verify package.json:**
   - Make sure there's no `wrangler` in dependencies
   - No `deploy` script in package.json
