# Supabase Configuration Checklist

## 🔐 Critical: Configure Redirect URLs

After deploying to Cloudflare, you MUST update Supabase redirect URLs:

### Step 1: Add Site URLs

1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add these URLs:

**Site URL:**
```
https://homeschoolhelper.app
```

**Redirect URLs:**
```
https://homeschoolhelper.app/**
https://www.homeschoolhelper.app/**
http://localhost:5173/**
```

3. Click **"Save"**

### Why This Matters

Without these URLs configured:
- ❌ OAuth (Google) won't work
- ❌ Email confirmation links won't work
- ❌ Password reset links won't work
- ❌ Users can't sign in after email confirmation

---

## 📧 Email Configuration (Optional but Recommended)

### Use Custom SMTP (Better Deliverability)

1. Go to **Settings** → **Auth** → **SMTP Settings**
2. Options:
   - **SendGrid** (free tier: 100 emails/day)
   - **Mailgun** (free tier: 5,000 emails/month)
   - **AWS SES** (very cheap)
   - **Resend** (modern, developer-friendly)

Default Supabase SMTP works but may go to spam.

---

## 🔒 Security Settings

### Enable Email Confirmation (Recommended)

1. Go to **Authentication** → **Providers** → **Email**
2. Enable **"Confirm email"**
3. This requires users to verify email before signing in

### Rate Limiting

Supabase has built-in rate limiting, but you can adjust:
- **Settings** → **Auth** → **Rate Limits**

---

## 📊 Database Settings

### Enable Backups (Important!)

1. Go to **Settings** → **Database**
2. Enable **"Point-in-time Recovery"** (PITR)
3. Free tier: 1 day retention
4. Pro tier: 7 days retention

### Connection Pooling

Supabase provides connection pooling automatically. Use:
- **Session mode** for most queries (default)
- **Transaction mode** for complex transactions

---

## 🚀 Performance Optimization

### Enable Database Indexes

The schema includes indexes, but verify in **Database** → **Indexes**:
- ✅ `children_user_id_idx`
- ✅ `subjects_child_id_idx`
- ✅ `hour_logs_child_id_idx`
- ✅ `hour_logs_date_idx`

### Enable Realtime (Optional)

If you want live updates across devices:
1. Go to **Database** → **Replication**
2. Enable replication for tables you want real-time
3. Use Supabase Realtime in your app

---

## 🔍 Monitoring & Logs

### View API Logs

1. Go to **Logs** → **API Logs**
2. See all requests to your database
3. Useful for debugging

### View Auth Logs

1. Go to **Logs** → **Auth Logs**
2. See sign-ups, sign-ins, password resets
3. Monitor for suspicious activity

---

## 💳 Subscription Tier Management

### Update Subscription Status

Currently stored in `profiles.subscription_tier`. To integrate Stripe:

1. Set up Stripe webhook
2. Update `subscription_tier` when payment succeeds
3. Check `subscription_tier` in your app for premium features

---

## ✅ Final Checklist

Before going live:

- [ ] Redirect URLs configured
- [ ] Email templates customized (optional)
- [ ] SMTP configured (optional but recommended)
- [ ] Database backups enabled
- [ ] Test sign-up flow
- [ ] Test sign-in flow
- [ ] Test password reset
- [ ] Test OAuth (if enabled)
- [ ] Check logs for errors

---

## 🆘 Troubleshooting

### "Invalid redirect URL" Error

- Check redirect URLs in Supabase settings
- Ensure URL matches exactly (including https://)
- Add both `homeschoolhelper.app` and `www.homeschoolhelper.app`

### Emails Not Sending

- Check SMTP settings
- Verify email templates
- Check spam folder
- Use custom SMTP for better deliverability

### Database Connection Issues

- Verify API keys in Cloudflare environment variables
- Check Supabase project is active
- Verify RLS policies are correct
- Check database logs for errors
