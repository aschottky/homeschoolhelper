#!/bin/bash
# Script to push homeschoolhelper to GitHub
# Run this after creating the GitHub repository

# Add remote (replace with your actual repo URL)
git remote add origin https://github.com/aschottky/homeschoolhelper.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main

echo "✅ Successfully pushed to GitHub!"
echo "Visit: https://github.com/aschottky/homeschoolhelper"
