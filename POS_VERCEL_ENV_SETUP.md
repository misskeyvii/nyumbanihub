# POS Vercel Environment Variables Setup

## Issue
The POS system shows "Authentication failed - POS system requires database connection" because environment variables are missing.

## Solution
Add Supabase environment variables to the Vercel srcpos project:

### Step 1: Go to Vercel Project Settings
1. Open https://vercel.com/misskeyviis-projects/srcpos/settings/environment-variables
2. Click "Add New" or "Environment Variables"

### Step 2: Add These Variables

**Variable 1:**
- **Key:** `VITE_PUBLIC_SUPABASE_URL`
- **Value:** `https://fohpbqxpjrknaiqfvlgv.supabase.co`
- **Environments:** Production, Preview, Development (check all three)

**Variable 2:**
- **Key:** `VITE_PUBLIC_SUPABASE_ANON_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvaHBicXhwanJrbmFpcWZ2bGd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NDE1NDMsImV4cCI6MjA5MzAxNzU0M30.jgaqpuuyHJgz4xGnDM2nOUo1zLPDGMRi09j_dTTk6Do`
- **Environments:** Production, Preview, Development (check all three)

### Step 3: Redeploy
1. After adding both variables, go to Deployments tab
2. Click the three dots on the latest deployment
3. Click "Redeploy"
4. **Promote to Production** after deployment completes

## Testing Locally
The `.env.local` file in the srcpos folder has been updated with these variables, so localhost should work immediately after restarting the dev server:

```bash
cd srcpos
npm run dev
```

## Why These Variables Are Needed
- The POS system needs to connect to the same Supabase database as the main site
- Without these variables, `hasSupabaseConfig` is false and authentication fails
- These are the same Supabase URL and anon key used by nyumbanilink.com

## Security Note
- The `VITE_PUBLIC_` prefix means these variables are exposed in the browser (public)
- The anon key is safe to expose - it only allows row-level security (RLS) controlled access
- RLS policies ensure users can only access their own POS data
