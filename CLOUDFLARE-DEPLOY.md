# Cloudflare Pages Deployment Guide

## 🎯 What is Cloudflare Pages?

**Cloudflare Pages** is a JAMstack platform for deploying static sites and frontend frameworks. It's perfect for your React/Vite app!

### Why Cloudflare Pages?

✅ **100% Free** - Unlimited sites, bandwidth, and requests  
✅ **Lightning Fast** - Global CDN with 200+ data centers  
✅ **Automatic SSL** - Free HTTPS certificates  
✅ **Git Integration** - Deploy automatically from GitHub  
✅ **Preview Deployments** - Test changes before going live  
✅ **DDoS Protection** - Built-in security  
✅ **Custom Domains** - Easy domain connection  

---

## 📋 Prerequisites

- [x] Code working locally ✅
- [x] Supabase configured ✅
- [ ] GitHub account
- [ ] Cloudflare account (free)
- [ ] Domain: `homeschoolhelper.app` ✅

---

## Step 1: Initialize Git Repository

If you haven't already, set up git:

```bash
# Initialize git
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit - ready for deployment"

# Create a new repository on GitHub (github.com/new)
# Then connect it:
git remote add origin https://github.com/YOUR_USERNAME/homeschoolhelper.git
git branch -M main
git push -u origin main
```

**Important:** Make sure `.env` is in `.gitignore` (it should be) - we'll add environment variables in Cloudflare.

---

## Step 2: Create Cloudflare Account

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Sign up for free account (or sign in)
3. No credit card required!

---

## Step 3: Connect GitHub to Cloudflare Pages

1. In Cloudflare dashboard, click **"Workers & Pages"**
2. Click **"Create application"**
3. Click **"Pages"** tab
4. Click **"Connect to Git"**
5. Authorize Cloudflare to access your GitHub account
6. Select your `homeschoolhelper` repository
7. Click **"Begin setup"**

---

## Step 4: Configure Build Settings

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
/ (leave blank)
```

---

## Step 5: Add Environment Variables (CRITICAL!)

**Before clicking "Save and Deploy":**

1. Scroll down to **"Environment variables"**
2. Click **"Add variable"** for Production environment
3. Add these two variables:

**Variable 1:**
- **Name:** `VITE_SUPABASE_URL`
- **Value:** `https://grxiobgsdxktupgptazu.supabase.co`

**Variable 2:**
- **Name:** `VITE_SUPABASE_ANON_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdyeGlvYmdzZHhrdHVwZ3B0YXp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxMTUzMzgsImV4cCI6MjA4NDY5MTMzOH0.skvElP8q7qmKYFrAR7TANNZ5laLvmuykOBKXUZtPDos`

4. Click **"Save"** after each variable

---

## Step 6: Deploy!

1. Click **"Save and Deploy"**
2. Wait 2-3 minutes for build
3. You'll get a URL like: `homeschoolhelper.pages.dev`
4. Test it! Visit the URL and verify everything works

---

## Step 7: Connect Your Custom Domain

### Option A: Domain Already in Cloudflare

If `homeschoolhelper.app` is already managed by Cloudflare:

1. In Pages project, go to **"Custom domains"**
2. Click **"Set up a custom domain"**
3. Enter: `homeschoolhelper.app`
4. Click **"Activate"**
5. Also add: `www.homeschoolhelper.app` (optional)

### Option B: Domain at Another Registrar

1. In Cloudflare dashboard, go to **"Websites"**
2. Click **"Add a site"**
3. Enter: `homeschoolhelper.app`
4. Select **Free** plan
5. Cloudflare will scan your DNS
6. Update nameservers at your registrar to Cloudflare's
7. Wait for DNS propagation (usually 5-30 minutes)
8. Go back to Pages → Custom domains → Add domain

---

## Step 8: Update Supabase Redirect URLs

**CRITICAL:** After deploying, update Supabase:

1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Update **Site URL:**
   ```
   https://homeschoolhelper.app
   ```
3. Update **Redirect URLs:**
   ```
   https://homeschoolhelper.app/**
   https://www.homeschoolhelper.app/**
   http://localhost:5173/**
   ```
4. Click **"Save"**

Without this, authentication won't work on your live site!

---

## ✅ Post-Deployment Checklist

- [ ] Site loads at `homeschoolhelper.app`
- [ ] SSL certificate active (green lock icon)
- [ ] Sign up works
- [ ] Email confirmation works
- [ ] Sign in works
- [ ] Data saves to Supabase
- [ ] All features working

---

## 🔄 Automatic Deployments

Cloudflare Pages automatically deploys:
- ✅ Every push to `main` branch → Production
- ✅ Pull requests → Preview deployments
- ✅ You can rollback to any previous deployment

---

## 📊 Monitoring & Analytics

Cloudflare provides:
- **Build logs** - See what happened during build
- **Analytics** - Page views, bandwidth (in dashboard)
- **Performance** - Core Web Vitals
- **Errors** - Check browser console for runtime errors

---

## 🆘 Troubleshooting

### Build Fails

**Check:**
- Build logs in Cloudflare Pages
- Environment variables are set correctly
- `npm run build` works locally

**Common fixes:**
- Ensure all dependencies are in `package.json`
- Check for TypeScript/ESLint errors
- Verify build command is correct

### Domain Not Working

**Check:**
- Nameservers updated at registrar
- DNS records correct
- Wait 24-48 hours for full propagation

### Authentication Not Working

**Check:**
- Supabase redirect URLs updated
- Environment variables correct in Cloudflare
- Test with browser console open

### White Screen on Live Site

**Check:**
- Browser console for errors
- Environment variables are set
- Supabase project is active
- Network tab for failed API calls

---

## 💡 Pro Tips

1. **Preview Deployments**: Every PR gets a preview URL - test before merging!
2. **Build Caching**: Cloudflare caches `node_modules` - faster builds
3. **Custom Headers**: Add security headers in Pages settings
4. **Redirects**: Already set up in `public/_redirects` for SPA routing
5. **Environment Variables**: Can have different values for Production/Preview

---

## 📈 Scaling

Your free tier includes:
- ✅ Unlimited requests
- ✅ Unlimited bandwidth  
- ✅ Unlimited sites
- ✅ 500 builds/month (plenty for most projects)

If you need more:
- **Pro Plan**: $20/month (more build minutes, advanced features)
- But you probably won't need it!

---

## 🎉 You're Ready!

Once deployed, your app will be:
- ✅ Live at `https://homeschoolhelper.app`
- ✅ Fast (global CDN)
- ✅ Secure (free SSL)
- ✅ Auto-deploying on every push

**Next steps after deployment:**
1. Test everything thoroughly
2. Set up monitoring/alerts (optional)
3. Consider adding analytics (Google Analytics, Plausible)
4. Set up email service for better deliverability

---

## 📚 Resources

- **Cloudflare Pages Docs**: [developers.cloudflare.com/pages](https://developers.cloudflare.com/pages)
- **Vite Deployment**: [vitejs.dev/guide/static-deploy](https://vitejs.dev/guide/static-deploy)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
