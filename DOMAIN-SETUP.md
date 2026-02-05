# Connect homeschoolhelper.app to Cloudflare Pages

## Overview

You registered `homeschoolhelper.app` at Namecheap. Now we'll:
1. Add it to Cloudflare
2. Update nameservers at Namecheap
3. Connect it to your Pages project

---

## Step 1: Add Domain to Cloudflare

### 1.1 Go to Cloudflare Dashboard

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Click **"Websites"** in the left sidebar
3. Click **"Add a site"**

### 1.2 Enter Your Domain

1. Enter: `homeschoolhelper.app`
2. Click **"Add site"**
3. Select **Free** plan (or paid if you want)
4. Click **"Continue"**

### 1.3 Cloudflare Scans DNS

Cloudflare will scan your existing DNS records from Namecheap. This takes ~30 seconds.

---

## Step 2: Review DNS Records

Cloudflare will show you DNS records it found. For now:

1. **Keep the default records** (or delete them - we'll add new ones)
2. Click **"Continue"**

---

## Step 3: Update Nameservers at Namecheap

### 3.1 Get Cloudflare Nameservers

After scanning, Cloudflare will show you **2 nameservers**, like:
```
alice.ns.cloudflare.com
bob.ns.cloudflare.com
```

**Copy both nameservers** - you'll need them!

### 3.2 Update at Namecheap

1. Go to [namecheap.com](https://namecheap.com) and sign in
2. Go to **"Domain List"** (or **"Account"** → **"Domain List"**)
3. Find `homeschoolhelper.app`
4. Click **"Manage"** (or the domain name)
5. Scroll to **"Nameservers"** section
6. Select **"Custom DNS"** (not "Namecheap BasicDNS")
7. Replace the nameservers with Cloudflare's:
   - Delete the existing nameservers
   - Add Cloudflare's first nameserver
   - Add Cloudflare's second nameserver
8. Click **"✓"** or **"Save"**

**Example:**
```
Before (Namecheap):
ns1.registrar-servers.com
ns2.registrar-servers.com

After (Cloudflare):
alice.ns.cloudflare.com
bob.ns.cloudflare.com
```

### 3.3 Wait for Propagation

- Usually takes **5-30 minutes**
- Can take up to **24-48 hours** (but usually faster)
- Cloudflare will show status: "Pending" → "Active"

---

## Step 4: Add DNS Records in Cloudflare

Once nameservers are active:

### 4.1 Go to DNS Settings

1. In Cloudflare dashboard
2. Click on `homeschoolhelper.app` website
3. Click **"DNS"** in the left sidebar
4. Click **"Records"**

### 4.2 Add CNAME Record for Root Domain

1. Click **"Add record"**
2. Fill in:
   - **Type:** `CNAME`
   - **Name:** `@` (or leave blank for root domain)
   - **Target:** `homeschoolhelper.pages.dev` (your Pages URL)
   - **Proxy status:** ✅ **Proxied** (orange cloud)
3. Click **"Save"**

### 4.3 Add CNAME Record for WWW (Optional)

1. Click **"Add record"** again
2. Fill in:
   - **Type:** `CNAME`
   - **Name:** `www`
   - **Target:** `homeschoolhelper.pages.dev`
   - **Proxy status:** ✅ **Proxied** (orange cloud)
3. Click **"Save"**

**Your DNS records should look like:**

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| CNAME | @ | homeschoolhelper.pages.dev | ✅ Proxied |
| CNAME | www | homeschoolhelper.pages.dev | ✅ Proxied |

---

## Step 5: Connect Domain to Pages Project

### 5.1 Go to Pages Project

1. In Cloudflare dashboard
2. Click **"Workers & Pages"**
3. Click your `homeschoolhelper` Pages project

### 5.2 Add Custom Domain

1. Click **"Custom domains"** tab
2. Click **"Set up a custom domain"**
3. Enter: `homeschoolhelper.app`
4. Click **"Continue"** or **"Activate"**

### 5.3 Add WWW (Optional)

1. Click **"Set up a custom domain"** again
2. Enter: `www.homeschoolhelper.app`
3. Click **"Continue"** or **"Activate"**

### 5.4 Wait for SSL

Cloudflare will automatically:
- ✅ Issue SSL certificate (free)
- ✅ Enable HTTPS
- ✅ Usually takes 5-15 minutes

You'll see status: "Pending" → "Active"

---

## Step 6: Update Supabase Redirect URLs

**CRITICAL:** Update Supabase to allow your domain:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **"Authentication"** → **"URL Configuration"**
4. Update **"Site URL":**
   ```
   https://homeschoolhelper.app
   ```
5. Update **"Redirect URLs":**
   ```
   https://homeschoolhelper.app/**
   https://www.homeschoolhelper.app/**
   http://localhost:5173/**
   ```
6. Click **"Save"**

Without this, authentication won't work on your live site!

---

## Step 7: Test Everything

### 7.1 Test Domain

1. Visit: `https://homeschoolhelper.app`
2. Should load your site
3. Check for green lock icon (SSL active)

### 7.2 Test WWW (if added)

1. Visit: `https://www.homeschoolhelper.app`
2. Should redirect to or load same site

### 7.3 Test Authentication

1. Try signing up
2. Try signing in
3. Verify data saves to Supabase

---

## Troubleshooting

### Domain Not Working

**Check:**
1. Nameservers updated at Namecheap? (wait 5-30 min)
2. DNS records correct in Cloudflare?
3. Domain connected in Pages project?
4. SSL certificate active? (check in Pages → Custom domains)

**Common fixes:**
- Wait longer for DNS propagation
- Clear browser cache
- Try incognito/private window
- Check Cloudflare status page

### SSL Certificate Pending

**If SSL takes too long:**
1. Go to Pages → Custom domains
2. Click the domain
3. Click **"Retry"** or **"Re-check"**
4. Usually resolves in 15-30 minutes

### Authentication Not Working

**Check:**
1. Supabase redirect URLs updated?
2. Using `https://` (not `http://`)?
3. Environment variables set in Cloudflare Pages?
4. Check browser console for errors

### DNS Propagation Check

Check if DNS has propagated:
- Visit: [whatsmydns.net](https://www.whatsmydns.net)
- Enter: `homeschoolhelper.app`
- Check if nameservers show Cloudflare's

---

## Summary Checklist

- [ ] Domain added to Cloudflare
- [ ] Nameservers updated at Namecheap
- [ ] DNS records added (CNAME for @ and www)
- [ ] Domain connected in Pages project
- [ ] SSL certificate active
- [ ] Supabase redirect URLs updated
- [ ] Site loads at https://homeschoolhelper.app
- [ ] Authentication works

---

## Pro Tips

1. **Keep Cloudflare Proxy ON** (orange cloud) - Provides DDoS protection, CDN, and faster speeds
2. **Both @ and www** - Set up both so users can access either
3. **SSL is automatic** - Cloudflare provides free SSL certificates
4. **DNS caching** - Changes can take a few minutes to propagate globally

---

## What You Get

Once connected:
- ✅ `https://homeschoolhelper.app` (your custom domain)
- ✅ Free SSL certificate (automatic)
- ✅ DDoS protection
- ✅ Global CDN (fast worldwide)
- ✅ Analytics in Cloudflare dashboard

---

## Need Help?

- **Cloudflare Status:** [status.cloudflare.com](https://status.cloudflare.com)
- **Namecheap Support:** [namecheap.com/support](https://www.namecheap.com/support)
- **DNS Check:** [whatsmydns.net](https://www.whatsmydns.net)
