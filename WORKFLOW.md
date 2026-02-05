# Development & Deployment Workflow

## 🚀 Automatic Deployments

Cloudflare Pages **automatically deploys** on every push to GitHub. No releases needed!

### How It Works

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Add new feature"
   git push
   ```

2. **Cloudflare automatically:**
   - Detects the push
   - Starts a new build
   - Deploys to production (if on `main` branch)
   - Creates a preview (if on other branches/PRs)

3. **You get:**
   - Production deployment at `homeschoolhelper.pages.dev`
   - Preview URL for PRs/branches
   - Build logs in Cloudflare dashboard

## 📋 Deployment Types

### Production Deployments (Automatic)

**Trigger:** Push to `main` branch

```bash
# This automatically deploys to production
git checkout main
git add .
git commit -m "Update feature"
git push
```

- ✅ Deploys to your production URL
- ✅ Updates `homeschoolhelper.app` (if custom domain connected)
- ✅ Usually takes 2-3 minutes

### Preview Deployments (Automatic)

**Trigger:** Push to any other branch or open a Pull Request

```bash
# Create a feature branch
git checkout -b feature/new-feature
git add .
git commit -m "Add new feature"
git push origin feature/new-feature

# Or create a PR on GitHub
```

- ✅ Creates a unique preview URL
- ✅ Example: `feature-new-feature-abc123.pages.dev`
- ✅ Perfect for testing before merging
- ✅ Doesn't affect production

## 🔄 Typical Development Workflow

### Option 1: Direct to Main (Simple)

```bash
# Make changes locally
# Test with: npm run dev

# Commit and push
git add .
git commit -m "Add schoolwork upload feature"
git push

# Cloudflare auto-deploys in ~2-3 minutes
```

**Best for:** Small changes, solo development

### Option 2: Feature Branches (Recommended)

```bash
# Create feature branch
git checkout -b feature/schoolwork-reminders

# Make changes
# Test locally

# Commit and push
git add .
git commit -m "Add schoolwork reminder system"
git push origin feature/schoolwork-reminders

# Cloudflare creates preview deployment
# Test the preview URL
# If good, merge to main on GitHub
# Main branch auto-deploys to production
```

**Best for:** Team work, larger features, testing before production

## 📊 Managing Deployments

### View Deployments

1. Go to Cloudflare Pages dashboard
2. Click your project
3. See all deployments in the "Deployments" tab

### Rollback to Previous Version

1. In Cloudflare Pages → Deployments
2. Find the deployment you want
3. Click **"..."** menu
4. Click **"Retry deployment"** or **"Promote to production"**

### Cancel a Build

1. In Deployments tab
2. Find the running build
3. Click **"Cancel"**

## 🎯 No Releases Needed!

Unlike some platforms, Cloudflare Pages:
- ❌ Doesn't require creating "releases"
- ❌ Doesn't need manual deployment triggers
- ✅ Auto-deploys on every push
- ✅ Creates previews automatically

## 🔔 Notifications

Cloudflare can notify you:
- ✅ Build success/failure (email)
- ✅ Deployment status (webhook)
- ✅ Configure in Pages → Settings → Notifications

## 📝 Best Practices

### 1. Always Test Locally First

```bash
npm run dev
# Test your changes
# Fix any issues
# Then commit and push
```

### 2. Use Feature Branches for Big Changes

```bash
git checkout -b feature/major-update
# Work on feature
# Test preview deployment
# Merge when ready
```

### 3. Write Good Commit Messages

```bash
# Good
git commit -m "Add multi-child hour logging feature"

# Bad
git commit -m "fix stuff"
```

### 4. Check Build Logs

If deployment fails:
1. Go to Cloudflare → Deployments
2. Click the failed deployment
3. Check build logs for errors
4. Fix locally and push again

## 🚨 What Happens If Build Fails?

1. **Cloudflare sends notification** (if configured)
2. **Previous deployment stays live** (no downtime!)
3. **Fix the issue locally**
4. **Push again** - new build starts automatically

## 💡 Pro Tips

1. **Preview URLs are permanent** - Great for sharing with team/clients
2. **Build cache** - Cloudflare caches `node_modules` for faster builds
3. **Environment variables** - Can be different for Production vs Preview
4. **Custom build commands** - Can override in Pages settings if needed

## 📈 Deployment History

Cloudflare keeps:
- ✅ All deployment history
- ✅ Build logs for each deployment
- ✅ Ability to rollback to any version
- ✅ Preview URLs for branches/PRs

## 🎉 Summary

**Just push to GitHub = Auto-deploy!**

```bash
# Your daily workflow:
git add .
git commit -m "Your changes"
git push

# That's it! Cloudflare handles the rest.
```

No releases, no manual triggers, no extra steps. Just push and it deploys! 🚀
