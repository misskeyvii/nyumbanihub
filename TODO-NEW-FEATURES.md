# Normal User Features (Non-Listing Users)

## Overview
- Normal users signup → role: 'user' (NO listing permissions)
- View/save favorite listings  
- Request listing account → Admin approves → sends login credentials
- In-app chat: user → service provider/business only
- Email verification required for login

## Steps:
- [ ] 1. Add `/signup` page (public email/password signup → users table role='user')
- [ ] 2. Update auth flow: require email_confirmed_at for login
- [ ] 3. Add favorites system (favorites table + profile favorites UI)
- [ ] 4. Add listing account request form → pending_requests table → admin panel list
- [ ] 5. Admin panel: review/approve requests → auto-generate+send login creds
- [ ] 6. In-app chat (messages table + realtime Supabase)
- [ ] 7. Update router/protected routes for role-based access
- [ ] 8. Test full flow

## Database Changes Needed:
```
favorites: id, user_id, listing_id, created_at
pending_requests: id, user_id, user_email, status(pending/approved/rejected), created_at  
messages: id, from_user_id, to_user_id, listing_id, message, created_at
```
**Ready to start with signup page?**
