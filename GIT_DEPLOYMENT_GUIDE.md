# Git Deployment Guide - Nyumbani Link & POS

## 🎯 **Overview**
This guide explains how to commit and deploy changes to both **nyumbanilink.com** (main app) and **srcpos.vercel.app** (POS app) from the same repository.

---

## 📁 **Repository Structure**
```
nyumbanihub/
├── src/                    ← Main App (nyumbanilink.com)
│   ├── components/
│   ├── pages/
│   ├── lib/
│   └── ...
├── srcpos/                 ← POS App (srcpos.vercel.app)
│   ├── components/
│   ├── pages/
│   ├── utils/
│   └── ...
├── package.json           ← Main app dependencies
├── vite.config.ts         ← Main app build config
└── README.md
```

---

## 🚀 **Deployment Behavior**

| Files Changed | nyumbanilink.com | srcpos.vercel.app |
|---------------|------------------|-------------------|
| Only `src/` | ✅ Deploys | ⏭️ Skips |
| Only `srcpos/` | ⏭️ Skips | ✅ Deploys |
| Both directories | ✅ Deploys | ✅ Deploys |
| Root files | ✅ Deploys | ⏭️ Skips |

---

## 📝 **Git Workflow (Preferred: Simple Approach)**

### **Standard Workflow: Always Add Everything**

```bash
# Make your changes to any files (main app, POS app, or both)
# Files: src/pages/home.tsx, srcpos/components/Dashboard.tsx, etc.

git add .
git commit -m "descriptive commit message"
git push
```

**Result**: ✅ **Both apps always rebuild and deploy**

### **Benefits of This Approach:**
- ✅ **Simple**: Same commands every time
- ✅ **Consistent**: Both apps stay in sync
- ✅ **No thinking required**: Just `git add .` always
- ✅ **Safe**: Never miss deploying related changes

### **Alternative Workflows (If Needed):**

#### **Specific App Only:**
```bash
# If you only want to deploy one app
git add src/          # Main app only
# OR
git add srcpos/       # POS app only

git commit -m "specific app changes"
git push
```

#### **Specific Files:**
```bash
# If you want precise control
git add src/pages/profile.tsx srcpos/components/Settings.tsx
git commit -m "update user settings"
git push
```

---

## 📋 **Daily Development Workflow**

### **Your Preferred Simple Workflow:**

```bash
# 1. Pull latest changes
git pull origin main

# 2. Make your changes to any app
# Edit files in src/, srcpos/, or both

# 3. Check what changed (optional)
git status

# 4. Stage everything
git add .

# 5. Commit with clear message
git commit -m "feat: add new dashboard features"

# 6. Push changes
git push

# Result: Both apps always deploy
```

### **Benefits:**
- 🚀 **Fast workflow**: Same commands every time
- 🔄 **Always in sync**: Both apps deploy together
- 🎯 **Simple**: No decision-making about what to stage
- ✅ **Reliable**: Never miss deploying related changes

### **Example Sessions:**

#### **Working on Main App:**
```bash
# Edit src/pages/marketplace.tsx
git add .
git commit -m "feat: add advanced search to marketplace"
git push
# Both apps deploy (POS unchanged but rebuilds)
```

#### **Working on POS App:**
```bash
# Edit srcpos/components/Inventory.tsx
git add .
git commit -m "fix: correct inventory calculations"
git push
# Both apps deploy (main app unchanged but rebuilds)
```

#### **Working on Both Apps:**
```bash
# Edit src/lib/auth.ts and srcpos/utils/auth.ts
git add .
git commit -m "feat: implement unified authentication"
git push
# Both apps deploy with changes
```

---

## 🔧 **Advanced Git Commands**

### **Check Status Before Committing:**
```bash
# See what files have changed
git status

# See detailed changes
git diff

# See changes for specific directory
git diff src/
git diff srcpos/
```

### **Selective Staging:**
```bash
# Stage specific files
git add src/components/Navbar.tsx srcpos/components/Header.tsx

# Stage all files in a directory
git add src/
git add srcpos/

# Stage all files with specific extension
git add *.tsx
git add *.ts
```

### **Commit Message Conventions:**
```bash
# Feature additions
git commit -m "feat: add payment processing to POS"

# Bug fixes  
git commit -m "fix: resolve mobile navigation issue"

# Updates/improvements
git commit -m "update: improve search performance"

# Documentation
git commit -m "docs: update API documentation"

# Refactoring
git commit -m "refactor: reorganize authentication modules"
```

---

## 🚨 **Common Scenarios**

### **Scenario 1: Quick Main App Fix**
```bash
# Found a bug in main app
git add src/components/ListingCard.tsx
git commit -m "fix: resolve image loading issue in listings"
git push
```
✅ **Only main app deploys**

### **Scenario 2: POS Feature Update**
```bash
# Added new POS feature
git add srcpos/components/Reports/
git commit -m "feat: add sales analytics dashboard"
git push
```
✅ **Only POS app deploys**

### **Scenario 3: Shared Component Update**
```bash
# Updated shared styling or logic
git add src/styles/ srcpos/styles/
git commit -m "update: refresh UI design system"
git push
```
✅ **Both apps deploy**

### **Scenario 4: Configuration Changes**
```bash
# Updated build configs or dependencies
git add package.json vite.config.ts srcpos/package.json
git commit -m "update: upgrade to React 19"
git push
```
✅ **Both apps deploy**

---

## 📊 **Deployment Monitoring**

### **Check Deployment Status:**
```bash
# List recent deployments
npx vercel list

# Check specific project deployments
npx vercel list --scope misskeyviis-projects
```

### **Monitor Live Sites:**
- **Main App**: https://nyumbanilink.com
- **POS App**: https://srcpos.vercel.app

### **Vercel Dashboard:**
- **Main Project**: https://vercel.com/misskeyviis-projects/linkhapa
- **POS Project**: https://vercel.com/misskeyviis-projects/srcpos

---

## ✅ **Best Practices**

### **1. Clear Commit Messages**
```bash
✅ Good: "feat: add user profile photo upload"
❌ Bad: "updates"
```

### **2. Logical Grouping**
```bash
✅ Good: Stage related files together
❌ Bad: Mix unrelated changes in one commit
```

### **3. Test Before Pushing**
```bash
# Test main app
npm run dev

# Test POS app
npm run dev:pos

# Test builds
npm run build
npm run build:pos
```

### **4. Regular Commits**
```bash
# Don't let changes accumulate
# Commit small, logical chunks of work
git add src/components/NewFeature.tsx
git commit -m "feat: add new feature component"
```

---

## 🎯 **Quick Reference**

### **Your Standard Workflow:**
```bash
git pull           # Get latest changes
git add .          # Stage everything
git commit -m "..." # Commit with message
git push           # Deploy both apps
```

### **Deployment Results:**
| Your Action | nyumbanilink.com | srcpos.vercel.app |
|-------------|------------------|-------------------|
| `git add .` and push | ✅ Always deploys | ✅ Always deploys |

### **Useful Commands:**
| Command | Purpose |
|---------|---------|
| `git status` | See what files changed |
| `git add .` | Stage all changes |
| `git commit -m "message"` | Commit changes |
| `git push` | Deploy both apps |
| `npx vercel list` | Check deployment status |

---

## 🚀 **Summary**

**Your preferred workflow is simple and effective!**

✅ **Always use**: `git add .` to stage everything  
✅ **Always deploys**: Both apps rebuild and stay in sync  
✅ **No complexity**: Same commands every time  
✅ **Never miss**: Related changes across both apps  

**Commands you'll use 99% of the time:**
```bash
git add .
git commit -m "descriptive message"
git push
```

**Both nyumbanilink.com and srcpos.vercel.app will always deploy and stay perfectly synchronized!** 🎯