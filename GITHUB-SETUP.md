# GitHub Repository Setup

## Step 1: Create Repository on GitHub

1. Go to [github.com/new](https://github.com/new)
2. Fill in:
   - **Repository name:** `homeschoolhelper`
   - **Description:** `Homeschool Helper - Track hours, manage curriculum, and organize your homeschool`
   - **Visibility:** Public (or Private - your choice)
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
3. Click **"Create repository"**

## Step 2: Connect Local Repo to GitHub

After creating the repo, GitHub will show you commands. Run these in your terminal:

```bash
cd /Users/shotrox/Documents/webprojects/PROJECTS/homeschoolhelper

# Add remote (replace with your actual repo URL if different)
git remote add origin https://github.com/aschottky/homeschoolhelper.git

# Set main branch
git branch -M main

# Push to GitHub
git push -u origin main
```

## Step 3: Verify

1. Visit: https://github.com/aschottky/homeschoolhelper
2. You should see all your files
3. Ready for Cloudflare Pages deployment!

---

## Quick Commands Reference

```bash
# Check status
git status

# Add changes
git add .

# Commit
git commit -m "Your message"

# Push
git push

# Pull latest
git pull
```
