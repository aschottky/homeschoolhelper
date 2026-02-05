# Fix: Create Cloudflare Pages Project (Not Workers)

## The Problem

You created a **Cloudflare Workers** project, but you need a **Cloudflare Pages** project for static sites.

Workers = Serverless functions (needs deploy command)  
Pages = Static sites (no deploy command needed)

## Solution: Create a New Pages Project

### Step 1: Delete or Ignore the Workers Project

1. You can either:
   - **Delete** the Workers project (if you want to clean up)
   - **Or just ignore it** and create a new Pages project

### Step 2: Create a Pages Project

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Click **"Workers & Pages"** in the left sidebar
3. Click **"Create application"**
4. **IMPORTANT:** Click the **"Pages"** tab (NOT Workers!)
5. Click **"Connect to Git"**
6. Authorize GitHub if needed
7. Select your `homeschoolhelper` repository
8. Click **"Begin setup"**

### Step 3: Configure Pages Settings

Fill in these settings:

**Project name:**
```
homeschoolhelper
```

**Production branch:**
```
main
```

**Framework preset:**
```
Vite
```

**Build command:**
```
npm run build
```

**Build output directory:**
```
dist
```

**Root directory:**
```
/ (leave blank or empty)
```

**⚠️ IMPORTANT:** In a Pages project, you should NOT see:
- ❌ "Deploy command" field
- ❌ "Version command" field

If you see these fields, you're still in a Workers project!

### Step 4: Add Environment Variables

Before deploying, add environment variables:

1. Scroll to **"Environment variables"**
2. Click **"Add variable"** for Production
3. Add:

**Variable 1:**
- Name: `VITE_SUPABASE_URL`
- Value: `https://grxiobgsdxktupgptazu.supabase.co`

**Variable 2:**
- Name: `VITE_SUPABASE_ANON_KEY`
- Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdyeGlvYmdzZHhrdHVwZ3B0YXp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxMTUzMzgsImV4cCI6MjA4NDY5MTMzOH0.skvElP8q7qmKYFrAR7TANNZ5laLvmuykOBKXUZtPDos`

4. Click **"Save"** after each

### Step 5: Deploy

1. Click **"Save and Deploy"**
2. Wait for build (2-3 minutes)
3. You'll get a URL like: `homeschoolhelper.pages.dev`

## How to Tell the Difference

### Cloudflare Pages (What you need):
- ✅ Only has "Build command"
- ✅ Only has "Build output directory"
- ✅ No "Deploy command" field
- ✅ No "Version command" field
- ✅ Framework presets available (Vite, React, etc.)

### Cloudflare Workers (What you have now):
- ❌ Has "Deploy command" (required)
- ❌ Has "Version command"
- ❌ No framework presets
- ❌ Uses `wrangler deploy`

## After Creating Pages Project

Once your Pages project is created and deployed:

1. **Test the site:** Visit the `.pages.dev` URL
2. **Connect custom domain:** Add `homeschoolhelper.app` in Custom domains
3. **Update Supabase:** Add your live URL to redirect URLs

## Why This Happened

Cloudflare has two similar services:
- **Workers** - For serverless functions/APIs
- **Pages** - For static sites (React, Vue, etc.)

They look similar in the dashboard, but Pages is what you need for a React/Vite app.
