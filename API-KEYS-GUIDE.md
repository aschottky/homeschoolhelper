# Which Supabase API Key to Use?

## ✅ Use This: API Keys Section

**Location:** Settings → **API** → **API Keys** tab

You need the **"anon public"** key (also called "anon key" or "public anon key")

This is the key that:
- ✅ Starts with `eyJ...` (JWT format)
- ✅ Safe to use in frontend/browser
- ✅ Enforced by Row-Level Security (RLS)
- ✅ Used in your `.env` file as `VITE_SUPABASE_ANON_KEY`

**Example format:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdyeGlvYm...
```

---

## ❌ Don't Use: JWT Keys Section

**Location:** Settings → **JWT Keys**

This section is for:
- Managing signing keys (how Supabase signs tokens)
- Key rotation
- Security settings

**You don't need these** for your frontend app. These are internal Supabase settings.

---

## 🔍 How to Find the Correct Key

1. Go to **Settings** → **API** (not JWT Keys)
2. Click the **"API Keys"** tab
3. Look for **"anon public"** or **"public anon key"**
4. Copy that key (it's a long JWT token)

---

## 📝 Your Current Setup

If you're seeing keys that start with `sb_publishable_`, that might be from a different service or an older Supabase format.

**To verify:**
1. Go to Settings → API → API Keys
2. Look for the "anon public" key
3. It should be a long JWT token (starts with `eyJ...`)
4. Update your `.env` file with that key if different

---

## 🔐 Key Security Notes

- **anon public key**: Safe for frontend, protected by RLS
- **service_role key**: NEVER use in frontend! Only for backend/server
- **JWT signing keys**: Internal Supabase settings, not needed for your app

---

## ✅ Quick Check

Your `.env` should have:
```bash
VITE_SUPABASE_URL=https://grxiobgsdxktupgptazu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

If your key doesn't start with `eyJ`, check the API Keys section for the correct "anon public" key.
