# Deployment Guide: Homeschool Helper

## 🎯 Overview
This guide covers deploying Homeschool Helper to Cloudflare Pages with Supabase backend.

---

## 📋 Prerequisites Checklist

- [x] Domain: `homeschoolhelper.app`
- [ ] Supabase account (free tier is fine)
- [ ] Cloudflare account (free tier is fine)
- [ ] GitHub account (for Cloudflare Pages)

---

## Part 1: Supabase Setup (Database + Auth)

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click **"New Project"**
3. Fill in:
   - **Name**: `homeschool-helper`
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your users (e.g., `US East`)
4. Click **"Create new project"**
5. Wait 2-3 minutes for setup

### Step 2: Run Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Open `supabase-schema.sql` from this project
4. Copy **ALL** the SQL code
5. Paste into SQL Editor
6. Click **"Run"** (or press Cmd/Ctrl + Enter)
7. You should see "Success. No rows returned"

### Step 3: Get API Credentials

1. Go to **Settings** → **API**
2. Copy these values (you'll need them):
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (long string)
   - **service_role key**: `eyJhbGc...` (keep secret!)

### Step 4: Configure Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** (should be enabled by default)
3. (Optional) Enable **Google**:
   - Click "Google"
   - Follow instructions to get OAuth credentials
   - Add Client ID and Secret

### Step 5: Set Up Email Templates (Optional)

1. Go to **Authentication** → **Email Templates**
2. Customize the confirmation email if desired
3. Default templates work fine for now

---

## Part 2: Cloudflare Pages Setup

### Step 1: Push Code to GitHub

If you haven't already:

```bash
# Initialize git (if not done)
git init
git add .
git commit -m "Initial commit"

# Create GitHub repo, then:
git remote add origin https://github.com/YOUR_USERNAME/homeschoolhelper.git
git branch -M main
git push -u origin main
```

### Step 2: Connect to Cloudflare Pages

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Click **"Workers & Pages"** → **"Create application"**
3. Click **"Pages"** → **"Connect to Git"**
4. Authorize Cloudflare to access GitHub
5. Select your `homeschoolhelper` repository
6. Click **"Begin setup"**

### Step 3: Configure Build Settings

Fill in:
- **Project name**: `homeschoolhelper`
- **Production branch**: `main`
- **Framework preset**: `Vite`
- **Build command**: `npm run build`
- **Build output directory**: `dist`

### Step 4: Add Environment Variables

Before deploying, add these environment variables in Cloudflare:

1. In the Pages project, go to **Settings** → **Environment Variables**
2. Add these for **Production**:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

3. Click **"Save"**

### Step 5: Deploy

1. Click **"Save and Deploy"**
2. Wait 2-3 minutes for build
3. You'll get a URL like: `homeschoolhelper.pages.dev`

---

## Part 3: Connect Custom Domain

### Step 1: Add Domain to Cloudflare

1. In Cloudflare dashboard, go to **"Websites"**
2. Click **"Add a site"**
3. Enter `homeschoolhelper.app`
4. Select **Free** plan
5. Cloudflare will scan your DNS records

### Step 2: Update DNS Records

1. Cloudflare will show you DNS records to add
2. Add these records:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| CNAME | @ | `homeschoolhelper.pages.dev` | ✅ Proxied |
| CNAME | www | `homeschoolhelper.pages.dev` | ✅ Proxied |

3. Click **"Continue"**

### Step 3: Update Nameservers

1. Cloudflare will give you nameservers (e.g., `alice.ns.cloudflare.com`)
2. Go to your domain registrar (where you bought homeschoolhelper.app)
3. Update nameservers to Cloudflare's
4. Wait 24-48 hours for DNS propagation (usually faster)

### Step 4: Connect Domain to Pages

1. Go back to **Workers & Pages** → **homeschoolhelper**
2. Click **"Custom domains"**
3. Click **"Set up a custom domain"**
4. Enter `homeschoolhelper.app`
5. Click **"Activate"**
6. Also add `www.homeschoolhelper.app` if desired

---

## Part 4: SSL & Security

Cloudflare automatically provides:
- ✅ Free SSL certificate
- ✅ DDoS protection
- ✅ CDN (fast global delivery)
- ✅ Analytics

No additional setup needed!

---

## Part 5: Post-Deployment Checklist

### Verify Everything Works

- [ ] Visit `https://homeschoolhelper.app`
- [ ] Test sign up with email
- [ ] Test sign in
- [ ] Add a child
- [ ] Log some hours
- [ ] Check data appears in Supabase dashboard

### Set Up Monitoring

1. **Cloudflare Analytics**: Already available in dashboard
2. **Supabase Logs**: Go to Supabase → Logs to see API calls
3. **Error Tracking**: Consider adding Sentry later

### Environment Variables Check

Make sure these are set in Cloudflare Pages:
- ✅ `VITE_SUPABASE_URL`
- ✅ `VITE_SUPABASE_ANON_KEY`

---

## Part 6: Production Optimizations

### Enable Cloudflare Caching

1. Go to **Rules** → **Page Rules**
2. Create rule for `homeschoolhelper.app/*`
3. Settings:
   - Cache Level: Standard
   - Browser Cache TTL: 4 hours

### Set Up Redirects

Create `public/_redirects` file (for SPA routing):

```
/*    /index.html   200
```

### Performance Tips

- Cloudflare automatically minifies CSS/JS
- Images: Consider Cloudflare Images or Cloudinary
- Database: Supabase has connection pooling built-in

---

## Troubleshooting

### Build Fails

- Check build logs in Cloudflare Pages
- Ensure `npm run build` works locally
- Check environment variables are set

### Domain Not Working

- Wait 24-48 hours for DNS propagation
- Check nameservers are correct
- Verify DNS records in Cloudflare

### Supabase Connection Issues

- Verify environment variables in Cloudflare
- Check Supabase project is active
- Test API key in Supabase dashboard

### Authentication Not Working

- Check Supabase Auth settings
- Verify redirect URLs in Supabase dashboard
- Add your domain to allowed URLs in Supabase

---

## Next Steps

1. **Stripe Integration**: Set up payments for premium
2. **Email Service**: Configure transactional emails
3. **Analytics**: Add Google Analytics or Plausible
4. **Backup**: Set up Supabase backups
5. **Monitoring**: Add error tracking (Sentry)

---

## Support Resources

- **Cloudflare Docs**: [developers.cloudflare.com/pages](https://developers.cloudflare.com/pages)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Vite Deployment**: [vitejs.dev/guide/static-deploy](https://vitejs.dev/guide/static-deploy)

---

## Cost Estimate (Free Tier)

| Service | Cost |
|---------|------|
| Cloudflare Pages | Free (unlimited requests) |
| Cloudflare Domain | Free (SSL, CDN, DDoS protection) |
| Supabase | Free (500MB database, 50K MAU) |
| **Total** | **$0/month** |

You can scale up later if needed!
