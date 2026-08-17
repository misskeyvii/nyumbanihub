# Setting Up pos.nyumbanilink.com Custom Domain

## 🎯 **Goal**: Configure `pos.nyumbanilink.com` to point to your POS application

**Current POS URL**: https://srcpos.vercel.app  
**Target Custom Domain**: pos.nyumbanilink.com

---

## 📋 **Step-by-Step Instructions**

### **Step 1: Access Vercel Dashboard**

1. **Open your browser** and go to: https://vercel.com/dashboard
2. **Login** to your Vercel account
3. **Find the POS project**: Click on `srcpos` project

**Direct Link**: https://vercel.com/misskeyviis-projects/srcpos

---

### **Step 2: Navigate to Domain Settings**

1. **In the srcpos project**, click on **"Settings"** tab
2. **Click on "Domains"** in the left sidebar
3. You should see the current domain: `srcpos.vercel.app`

**Direct Link**: https://vercel.com/misskeyviis-projects/srcpos/settings/domains

---

### **Step 3: Add Custom Domain**

1. **Click "Add Domain"** button
2. **Enter**: `pos.nyumbanilink.com`
3. **Click "Add"**

Vercel will show you DNS configuration requirements.

---

### **Step 4: Configure DNS Records**

#### **Option A: If you manage DNS through your domain registrar**

**Go to your domain registrar** (where you bought nyumbanilink.com - could be Namecheap, GoDaddy, Cloudflare, etc.)

**Add a CNAME record**:
```
Type: CNAME
Name: pos
Target: cname.vercel-dns.com
TTL: 300 (or leave default)
```

#### **Option B: If you use Cloudflare for DNS**

1. **Login to Cloudflare Dashboard**
2. **Select nyumbanilink.com domain**
3. **Go to DNS > Records**
4. **Add record**:
   ```
   Type: CNAME
   Name: pos
   Target: cname.vercel-dns.com
   Proxy status: DNS only (gray cloud)
   TTL: Auto
   ```

#### **Option C: If you use other DNS providers**

The process is similar - add a CNAME record:
- **Subdomain**: `pos`
- **Points to**: `cname.vercel-dns.com`

---

### **Step 5: Verify Domain Configuration**

1. **Back in Vercel Dashboard**, the domain status should show:
   - ⏳ **"Pending"** initially
   - ✅ **"Valid"** once DNS propagates (5-30 minutes)

2. **Check domain status**:
   - Go back to: https://vercel.com/misskeyviis-projects/srcpos/settings/domains
   - You should see `pos.nyumbanilink.com` listed

---

### **Step 6: Test the Domain**

**Wait 5-30 minutes for DNS propagation**, then test:

1. **Visit**: https://pos.nyumbanilink.com
2. **Should redirect to**: Your POS application
3. **Test login** with demo accounts:
   ```
   Shop: grace@abcminimart.co.ke / demo1234
   Hotel: hotel@nyumbanilink.com / demo1234
   ```

---

### **Step 7: Add Environment Variables (If Needed)**

1. **In Vercel Dashboard**: https://vercel.com/misskeyviis-projects/srcpos/settings/environment-variables
2. **Add the same environment variables** as your main app:
   ```
   VITE_PUBLIC_SUPABASE_URL=your_supabase_project_url
   VITE_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
3. **Click "Save"**
4. **Redeploy** if needed (Vercel usually auto-redeploys)

---

## 🔧 **Troubleshooting**

### **Issue: Domain shows "Invalid" status**

**Check DNS configuration**:
```bash
# Check if CNAME is set correctly
nslookup pos.nyumbanilink.com

# Should show something like:
# pos.nyumbanilink.com canonical name = cname.vercel-dns.com
```

### **Issue: Domain works but shows wrong content**

1. **Clear browser cache**: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
2. **Check in incognito/private mode**
3. **Wait for DNS propagation** (up to 48 hours in rare cases)

### **Issue: SSL/HTTPS not working**

- **Wait**: Vercel automatically provisions SSL certificates
- **Time needed**: Usually 5-15 minutes after domain is valid
- **Check status**: In Vercel dashboard under Domains

### **Issue: Environment variables not working**

1. **Verify variables** are set in Vercel dashboard
2. **Redeploy** the application:
   ```bash
   cd nyumbanihub
   git add .
   git commit -m "trigger redeploy for environment variables"
   git push
   ```

---

## 📊 **Final Verification Checklist**

| Step | Status | URL to Check |
|------|--------|--------------|
| ✅ Domain added to Vercel | ⏳ | https://vercel.com/misskeyviis-projects/srcpos/settings/domains |
| ✅ DNS CNAME record | ⏳ | Your DNS provider dashboard |
| ✅ Domain shows "Valid" | ⏳ | Vercel dashboard |
| ✅ Site loads at custom domain | ⏳ | https://pos.nyumbanilink.com |
| ✅ Login works | ⏳ | Test with demo accounts |
| ✅ HTTPS/SSL active | ⏳ | Should show green lock icon |

---

## 🎉 **Expected Final Result**

**After completion**:
- ✅ **pos.nyumbanilink.com** loads your POS application
- ✅ **HTTPS** is automatically enabled
- ✅ **Authentication** works with Nyumbani Link accounts
- ✅ **Both domains work**:
  - https://pos.nyumbanilink.com (custom domain)
  - https://srcpos.vercel.app (original domain)

---

## 📱 **Quick Commands for Verification**

```bash
# Check DNS resolution
nslookup pos.nyumbanilink.com

# Check HTTP response
curl -I https://pos.nyumbanilink.com

# Or simply visit in browser
start https://pos.nyumbanilink.com
```

---

## 🔄 **DNS Propagation Time**

| Provider | Typical Time |
|----------|-------------|
| Cloudflare | 2-5 minutes |
| Namecheap | 5-30 minutes |
| GoDaddy | 10-60 minutes |
| Others | Up to 48 hours |

**Note**: You can use multiple DNS checkers online to verify propagation globally.

---

## 🎯 **Summary**

1. **Add domain** in Vercel: `pos.nyumbanilink.com`
2. **Add CNAME record** in DNS: `pos` → `cname.vercel-dns.com`  
3. **Wait for DNS** propagation (5-30 minutes)
4. **Test the domain** and functionality
5. **Add environment variables** if needed

**Once complete, your POS system will be accessible at the professional domain pos.nyumbanilink.com!** 🚀