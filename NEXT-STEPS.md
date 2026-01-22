# Next Steps: Supabase Configuration

## ✅ Completed
- [x] Supabase project created
- [x] SQL schema executed

---

## Step 1: Get Your API Credentials (2 minutes)

1. In Supabase Dashboard, go to **Settings** → **API**
2. Copy these values (you'll need them):

   **Project URL:**
   ```
   https://xxxxx.supabase.co
   ```

   **anon public key:**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   (This is a long string starting with `eyJ`)

3. **Save these somewhere safe** - you'll add them to Cloudflare later

---

## Step 2: Configure Authentication (3 minutes)

### Enable Email Auth (Should be enabled by default)

1. Go to **Authentication** → **Providers**
2. Verify **Email** is enabled
3. (Optional) Customize email templates:
   - Go to **Authentication** → **Email Templates**
   - Customize confirmation, password reset emails if desired

### Enable Google OAuth (Optional but Recommended)

1. Go to **Authentication** → **Providers** → **Google**
2. Click **"Enable Google provider"**
3. You'll need Google OAuth credentials:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`
   - Copy Client ID and Client Secret
4. Paste into Supabase Google provider settings
5. Click **"Save"**

---

## Step 3: Configure Redirect URLs (CRITICAL - Do This!)

This is **essential** - without it, authentication won't work after deployment.

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL**:
   ```
   https://homeschoolhelper.app
   ```
   (For now, you can use `http://localhost:5173` for local testing)

3. Add **Redirect URLs** (one per line):
   ```
   https://homeschoolhelper.app/**
   https://www.homeschoolhelper.app/**
   http://localhost:5173/**
   http://localhost:5174/**
   ```

4. Click **"Save"**

**Why this matters:** These URLs tell Supabase where it's safe to redirect users after login/email confirmation.

---

## Step 4: Test Locally (5 minutes)

### Create `.env` file

1. In your project root, create a file named `.env`:
   ```bash
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

2. Replace with your actual values from Step 1

### Test the Connection

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:5173`
3. Click "Hours Tracker"
4. You should see the auth page (not demo mode)
5. Try signing up with an email
6. Check your email for confirmation link
7. Sign in
8. Add a child and log some hours
9. Verify data appears in Supabase dashboard:
   - Go to **Table Editor** → **children**
   - You should see your test data

---

## Step 5: Verify Database Tables Created

Check that all tables exist:

1. Go to **Table Editor** in Supabase
2. You should see these tables:
   - ✅ `profiles`
   - ✅ `children`
   - ✅ `subjects`
   - ✅ `hour_logs`
   - ✅ `outdoor_logs`
   - ✅ `volunteer_logs`
   - ✅ `extracurricular_logs`
   - ✅ `read_aloud_logs`

If any are missing, re-run the SQL schema.

---

## Step 6: Check Row-Level Security (RLS)

Verify RLS is enabled:

1. Go to **Authentication** → **Policies**
2. Or check **Table Editor** → Click any table → **Policies** tab
3. You should see policies like:
   - "Users can view own profile"
   - "Users can view own children"
   - etc.

If policies are missing, re-run the SQL schema.

---

## Step 7: Set Up Email (Optional but Recommended)

Default Supabase SMTP works but emails may go to spam.

### Option A: Keep Default (Quick Start)
- Works immediately
- May go to spam folder
- Good for testing

### Option B: Use Custom SMTP (Better Deliverability)

1. Go to **Settings** → **Auth** → **SMTP Settings**
2. Recommended providers:
   - **Resend** (easiest, developer-friendly)
   - **SendGrid** (free tier: 100/day)
   - **Mailgun** (free tier: 5,000/month)

3. Enter SMTP credentials
4. Test email sending

---

## ✅ Verification Checklist

Before moving to Cloudflare deployment:

- [ ] API credentials copied (URL + anon key)
- [ ] `.env` file created with credentials
- [ ] Local test: Sign up works
- [ ] Local test: Sign in works
- [ ] Local test: Data saves to Supabase
- [ ] Redirect URLs configured
- [ ] All tables visible in Table Editor
- [ ] RLS policies exist

---

## 🚀 Ready for Cloudflare?

Once all above steps are complete, you're ready to:
1. Push code to GitHub
2. Deploy to Cloudflare Pages
3. Add environment variables in Cloudflare
4. Connect your domain

See `DEPLOYMENT.md` for Cloudflare setup instructions.

---

## 🆘 Troubleshooting

### "Invalid API key" error
- Check `.env` file has correct values
- Verify no extra spaces or quotes
- Restart dev server after changing `.env`

### "Invalid redirect URL" error
- Add `http://localhost:5173/**` to Supabase redirect URLs
- Check URL matches exactly

### Tables not showing
- Re-run `supabase-schema.sql`
- Check SQL Editor for errors
- Verify you're in the correct project

### Can't sign up
- Check email provider is enabled
- Verify redirect URLs are set
- Check Supabase logs for errors
