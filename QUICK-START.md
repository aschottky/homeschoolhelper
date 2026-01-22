# Quick Start Checklist

## ✅ Pre-Deployment Checklist

- [ ] Supabase project created
- [ ] Database schema run (`supabase-schema.sql`)
- [ ] API keys copied (URL + anon key)
- [ ] Code pushed to GitHub
- [ ] Cloudflare account created

---

## 🚀 Deployment Steps (15 minutes)

### 1. Supabase (5 min)
```
1. Create project at supabase.com
2. Run SQL schema
3. Copy API credentials
4. Enable email auth (optional: Google OAuth)
```

### 2. Cloudflare Pages (5 min)
```
1. Connect GitHub repo
2. Set build: npm run build
3. Set output: dist
4. Add environment variables:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
5. Deploy
```

### 3. Domain Setup (5 min)
```
1. Add homeschoolhelper.app to Cloudflare
2. Update nameservers at registrar
3. Add CNAME: @ → homeschoolhelper.pages.dev
4. Connect domain in Pages settings
```

---

## 🔑 Environment Variables Needed

**In Cloudflare Pages → Settings → Environment Variables:**

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

---

## 🧪 Test After Deployment

1. Visit https://homeschoolhelper.app
2. Sign up with email
3. Check email for confirmation
4. Sign in
5. Add a child
6. Log hours
7. Verify data in Supabase dashboard

---

## 📞 Need Help?

- Check `DEPLOYMENT.md` for detailed steps
- Cloudflare: [dash.cloudflare.com](https://dash.cloudflare.com)
- Supabase: [app.supabase.com](https://app.supabase.com)
