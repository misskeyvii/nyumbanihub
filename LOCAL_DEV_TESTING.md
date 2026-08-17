# Local Development Testing Guide

## 🚀 **Current Setup:**

You have both apps running locally:
- **Main App**: `http://localhost:5174` (nyumbanihub)  
- **POS App**: `http://localhost:3001` (srcpos)

## 🧪 **Test the Integration:**

### **1. Start Both Apps:**
```bash
# Terminal 1: Main App
cd nyumbanihub
npm run dev
# Should start at http://localhost:5174

# Terminal 2: POS App  
cd nyumbanihub  
npm run dev:pos
# Should start at http://localhost:3001
```

### **2. Test Main App to POS Flow:**
1. **Visit**: `http://localhost:5174`
2. **Login** with any test account (Google or email/password)
3. **Go to Profile page**
4. **Look for**: "Nyumbani Link POS" card (should appear for eligible users)
5. **Click**: "Open POS System" button
6. **Should redirect** to: `http://localhost:3001?email=user@email.com&redirect=true`
7. **POS login page** should show with email prefilled
8. **Enter password** and login to POS

### **3. Test Direct POS Access:**
1. **Visit**: `http://localhost:3001/login` directly
2. **Login** with demo accounts:
   ```
   grace@abcminimart.co.ke / demo1234
   hotel@nyumbanilink.com / demo1234
   airbnb@nyumbanilink.com / demo1234
   marketplace@nyumbanilink.com / demo1234
   ```
3. **Should load** appropriate POS workspace

## 🔧 **Development Commands:**

```bash
# Both apps with one command (parallel)
npm run dev & npm run dev:pos

# Individual apps
npm run dev          # Main app (port 5174)
npm run dev:pos      # POS app (port 3001)

# Build for testing
npm run build        # Main app
npm run build:pos    # POS app
```

## 🎯 **What to Test:**

### **Authentication Flow:**
- ✅ Main app login works
- ✅ Profile page shows POS card for eligible users
- ✅ POS link redirects with email prefilled
- ✅ POS login accepts same credentials
- ✅ Different account types load different workspaces

### **POS Functionality:**
- ✅ Dashboard loads correctly
- ✅ Sales, inventory, customers pages work
- ✅ Database operations (if schema is set up)
- ✅ Reports and analytics

### **Cross-App Integration:**
- ✅ User can move between apps seamlessly
- ✅ Session management works correctly
- ✅ Account type restrictions work

## 🐛 **Troubleshooting:**

### **POS card doesn't show:**
- Check user account type (service/entertainment are blocked)
- Verify `checkPosEligibility` function is working
- Check browser console for errors

### **Redirect doesn't work:**
- Verify POS is running on port 3001
- Check if email is being passed in URL
- Look for browser popup blocking

### **Login fails:**
- Check Supabase environment variables
- Verify both apps use same Supabase instance
- Check browser network tab for errors

## 🎉 **Success Indicators:**

When everything is working:
- ✅ Both apps load without errors
- ✅ Main app shows POS card in profile
- ✅ Clicking POS button opens POS with email prefilled
- ✅ Login works with same credentials
- ✅ POS workspace matches user's account type

## 📝 **Notes:**

- Both apps share the same Supabase database
- Account type determines POS workspace
- Email prefill makes transition seamless
- All authentication uses Nyumbani Link accounts only

**Ready to test the complete local integration!** 🚀