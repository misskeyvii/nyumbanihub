# Nyumbani Hub — Complete Project Documentation

## Overview

Nyumbani Hub is a Kenyan property and services marketplace web app and Android app.
It connects landlords, businesses, service providers, and entertainment providers with
customers across Kenya. Every listing is physically verified before going live.

- Live URL: https://mabidha.vercel.app (domain nyumbanihub.com pending purchase)
- Android App ID: com.nyumbanihub.app
- Supabase Project ID: xaowhrzkoacwadehdxhy
- Super Admin Email: kellyoburuodhiambo@yahoo.com
- Admin URL: /kelly

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + Remix Icons |
| Backend | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| Deployment | Vercel (web) |
| Mobile | Capacitor 8.3.0 (Android APK) |
| Auth | Supabase Auth + Google OAuth |
| Icons | Remix Icons (ri-*) |

---

## Project Structure

```
nyumbanihub/
├── src/
│   ├── components/
│   │   ├── base/
│   │   │   ├── ListingCard.tsx       — Reusable listing card with heart/favorite button
│   │   │   ├── ProductCard.tsx       — Marketplace product card
│   │   │   └── VerifiedBadge.tsx     — Green verified badge component
│   │   └── feature/
│   │       ├── Navbar.tsx            — Top navigation bar
│   │       ├── MobileBottomNav.tsx   — Mobile bottom navigation with unread badge
│   │       └── Footer.tsx            — Site footer
│   ├── pages/
│   │   ├── home/                     — Home page with all sections
│   │   ├── explore/                  — Browse all listings with filters
│   │   ├── listing/                  — Single listing detail page
│   │   ├── marketplace/              — Marketplace products page
│   │   ├── services/                 — Services directory page
│   │   ├── entertainment/            — Entertainment providers page
│   │   ├── categories/               — All categories page
│   │   ├── post-listing/             — Multi-step listing creation form
│   │   ├── profile/                  — User profile, listings, favorites, requests
│   │   ├── chat/                     — In-app realtime messaging
│   │   ├── signin/                   — Email + Google OAuth sign in
│   │   ├── signup/                   — Google OAuth sign up
│   │   ├── auth/callback.tsx         — OAuth redirect handler
│   │   ├── admin/                    — Admin panel (/kelly)
│   │   ├── marketer/                 — Marketer portal
│   │   ├── how-it-works/             — How It Works page
│   │   ├── anti-scam/                — Anti-Scam Policy page
│   │   ├── privacy/                  — Privacy Policy page
│   │   └── terms/                    — Terms of Use page
│   ├── lib/
│   │   └── supabase.ts               — Supabase client (anon + admin)
│   ├── mocks/
│   │   ├── listings.ts               — Kenya counties list
│   │   ├── categories.ts             — Category definitions
│   │   ├── services.ts               — Service type info
│   │   ├── entertainment.ts          — Entertainment type info
│   │   └── marketplace.ts            — Marketplace mock data
│   └── router/
│       └── config.tsx                — All app routes
├── public/
│   ├── robots.txt                    — Search engine crawl rules
│   └── .well-known/assetlinks.json   — Android App Links verification
├── android/                          — Capacitor Android project
├── .env                              — Environment variables (never commit)
├── vercel.json                       — Security headers + SPA rewrites
├── supabase-rls.sql                  — All RLS policies
├── supabase-storage-rls.sql          — Storage bucket policies
├── supabase-notifications.sql        — Notification columns SQL
├── TODO.md                           — Security checklist (all done)
└── capacitor.config.ts               — Android app config
```

---

## Database Tables

### users
Stores all registered users.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Supabase auth user ID |
| name | text | Full name |
| email | text | Email address |
| phone | text | Phone number |
| county | text | Kenya county |
| area | text | Specific area/estate |
| account_type | text | Primary listing category (landlord, airbnb, hotel, shop, marketplace, service, entertainment) |
| extra_account_types | text[] | Additional approved categories |
| role | text | user / admin / marketer |
| is_active | boolean | Whether account is active |
| subscription_expires_at | timestamptz | When subscription expires |
| avatar_url | text | Profile photo URL |
| has_notification | boolean | Unread notification flag |
| notification_message | text | Notification content |
| created_at | timestamptz | Account creation date |

### listings
All property/service/product listings.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Listing ID |
| user_id | uuid | Owner's user ID |
| title | text | Listing title |
| listing_type | text | home / apartment / airbnb / hotel / shop / service / marketplace |
| county | text | Kenya county |
| area | text | Area/estate |
| price | text | Price (KSh) |
| description | text | Listing description |
| phone | text | Contact phone |
| whatsapp | text | WhatsApp number |
| images | text[] | Array of image URLs |
| map_url | text | Google Maps link |
| status | text | pending / live / removed |
| created_at | timestamptz | Post date |

### favorites
Saved listings per user.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Favorite ID |
| user_id | uuid | User who saved |
| listing_id | uuid | Saved listing |
| created_at | timestamptz | When saved |

### messages
In-app chat messages.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Message ID |
| from_user_id | uuid | Sender |
| to_user_id | uuid | Recipient |
| listing_id | uuid | Related listing (optional) |
| message | text | Message content |
| read | boolean | Whether message was read |
| created_at | timestamptz | Sent time |

### pending_requests
Category account requests from users.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Request ID |
| user_id | uuid | Requesting user |
| user_email | text | User email |
| user_name | text | User name |
| business_name | text | Business/listing name |
| account_type | text | Requested category |
| phone | text | Contact phone |
| county | text | County |
| message | text | Additional info |
| status | text | pending / approved / rejected |
| created_at | timestamptz | Request date |

### portfolios
Work photos for service/entertainment providers.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Portfolio item ID |
| user_id | uuid | Provider's user ID |
| image_url | text | Photo URL |
| caption | text | Photo caption |
| created_at | timestamptz | Upload date |

### testimonials
User testimonials shown on home page.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Testimonial ID |
| user_id | uuid | Author |
| name | text | Author name |
| account_type | text | Author's account type |
| message | text | Testimonial text (max 300 chars) |
| avatar_url | text | Author photo |
| created_at | timestamptz | Submission date |

### reports
Reported listings.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Report ID |
| listing_id | uuid | Reported listing (cascade delete) |
| reporter_id | uuid | User who reported |
| reason | text | Report reason |
| created_at | timestamptz | Report date |

---

## User Roles

| Role | Description | Access |
|------|-------------|--------|
| user (browser) | Signed up but no account type | Browse, save favorites, chat, request account |
| user (with account_type) | Approved listing account | All above + post listings in approved categories |
| marketer | Created by admin | Marketer portal — create user accounts only |
| admin | Created by super admin | Full admin panel |
| super admin | kellyoburuodhiambo@yahoo.com | Admin panel + manage other admins |

---

## Account Types / Categories

| Account Type | Listing Types Unlocked | Description |
|-------------|----------------------|-------------|
| landlord | Home/Rental, Apartment | Bedsitters, single rooms, maisonettes, apartments |
| airbnb | Airbnb Stay | Short-term holiday rentals |
| hotel | Hotel/Lodge | Guesthouses, hotels, lodges |
| shop | Shop/Business | Retail shops, restaurants, salons |
| marketplace | Marketplace Product | Physical shop products |
| service | Service Provider | Cleaners, movers, plumbers, etc. |
| entertainment | (portfolio only) | DJs, MCs, catering, sounds & PA |

A user can have multiple account types (primary + extra_account_types array).
Each approved category costs a monthly subscription fee.
Subscription auto-expires 1 month after admin approval.

---

## Pages — What Each Does

### / (Home)
The main landing page. Contains:
- HeroSection — search bar with category tabs, county filter, popular searches
- QuickAccessStrip — quick links to categories
- TrendingSection — latest 8 live listings (realtime updates)
- CategoriesSection — browse by category
- FeaturedListings — latest 5 live listings featured (realtime updates)
- MarketplaceSection — marketplace products preview
- TrustSafety — trust badges and stats
- TestimonialsSection — user testimonials from DB
- EntertainmentSection — entertainment providers preview

### /explore
Browse all listings with filters:
- Category tabs (All, Homes, Apartments, Airbnb, Hotels, Shops, Services, Marketplace)
- County filter
- Price range filter
- Search by title/description/area
- Sort options
- Realtime: listings disappear instantly when admin deletes them

### /listing/:id
Single listing detail page:
- Image gallery with prev/next navigation and thumbnails
- Title, type badge, location, price
- Description
- Google Maps embed (custom link or auto-generated from location)
- Contact card: Call, WhatsApp, Send Message, Save Listing buttons
- Safety Tips
- Report button (logged-in users only) — opens modal with reason selection

### /marketplace
Marketplace products only (listing_type = marketplace):
- Search by title/description
- County filter
- Grid of ListingCards

### /marketplace/product/:id
Individual marketplace product detail page.

### /services
Services directory:
- Grid of service categories (Mama Fua, Movers, Caretakers, Plumbing, etc.)
- Shows provider count per category
- Links to /services/:type

### /services/:type
Service providers for a specific subcategory:
- Lists all active providers with that subcategory
- Call and WhatsApp buttons

### /entertainment
Entertainment providers:
- Filter by type (All, Sounds & PA, Catering, DJs, MCs)
- Provider cards with avatar, location, Call and WhatsApp buttons

### /post-listing
4-step listing creation form (requires approved account_type):
- Step 1: Category — only shows types the user's approved categories unlock
- Step 2: Details — title, county, area, price, description, phone, WhatsApp, map URL
- Step 3: Images — upload up to 10 photos (max 5MB each)
- Step 4: Review & Submit
- Listing posts as status=pending (requires admin approval)
- Expired users are blocked with a message
- Service/entertainment users are redirected to profile

### /profile
User profile page with tabs:
- Profile header: avatar, name, phone, account type badge, subscription expiry
- Edit Profile form (name + phone)
- Approval notification banner (shown once after admin approves request)
- Posted listing pending banner (shown after submitting a listing)
- Tabs (normal users): My Listings / Favorites / Request Account
- My Listings: list of user's listings with View and Delete buttons
- Favorites: saved listings with View and Remove buttons
- Request Account: form to request a new category (business name, type, phone, county, message)
- Portfolio section (service/entertainment users): upload and manage work photos
- Testimonial form (all users)

### /chat
In-app messaging:
- Full screen on all devices
- Conversations list on left (hidden when chat is open)
- Back arrow to return to conversations list
- Realtime messages via Supabase postgres_changes
- Send on Enter key or send button
- Auto-opens conversation when coming from listing page (?with=USER_ID)
- Unread badge on mobile bottom nav

### /signin
Sign in page:
- Google OAuth button
- Email + password form
- Email verification check (blocks unverified users)
- Saves user data to localStorage on success

### /signup
Sign up page:
- Google OAuth only (no email form)
- Green gradient design
- Feature bullets: save favorites, chat, request account
- Links to Terms and Privacy Policy

### /auth/callback
OAuth redirect handler:
- Tries getSession first
- Falls back to parsing URL hash tokens
- Falls back to onAuthStateChange listener
- Inserts new users into users table
- Updates avatar for returning users
- Saves to localStorage
- Redirects new users to /profile?new=true
- Redirects existing users to /profile

### /kelly (Admin Panel)
Full admin panel — tabs:

**Users tab:**
- Stats: Total, Browsers, Active, Blocked, Expired (clickable filters)
- Search by name, email, county, type
- Each user card shows: name, email, phone, county, account types, subscription expiry
- Expand to: add/remove account types, set county/area, set subscription date, reset password
- Deactivate/Activate button (super admin only)

**Marketers tab:**
- List of marketers
- Add Marketer form
- Remove marketer button

**Requests tab:**
- Pending category requests from users
- Approve (sets account_type, adds to extra_account_types, sets 1-month expiry, sends notification)
- Reject

**Listings tab:**
- Pending listings awaiting approval
- Shows thumbnail, title, type, location, price, owner name/email
- Approve (sets status=live) or Reject (deletes listing)

**Reports tab:**
- Reported listings with reason, listing details, reporter info
- View Listing button
- Delete Listing button (permanently removes from DB)
- Dismiss button (removes report, keeps listing)

**Admins tab (super admin only):**
- List of admins
- Add Admin form
- Remove admin button (cannot remove super admin)

### /marketer
Marketer portal:
- Create user accounts with account_type and subscription date
- Cannot access admin panel

### /how-it-works
Explains the platform:
- Steps for customers (browse, verify, contact, visit)
- Steps for businesses (apply, verify, pay, go live)
- Pricing table
- FAQ accordion

### /anti-scam
Anti-scam policy page.

### /privacy
Privacy policy page.

### /terms
Terms of use page.

### /categories
All categories overview page.

---

## Auth Flow

1. User clicks "Continue with Google" on /signup or /signin
2. Supabase redirects to Google OAuth
3. Google redirects back to https://mabidha.vercel.app/auth/callback
4. /auth/callback processes the session:
   - New user → insert into users table → redirect to /profile?new=true
   - Existing user → update avatar → redirect to /profile
5. User data saved to localStorage (userName, userRole, accountType, userPhone, userCounty, userEmail, userAvatar)

### Android Deep Link Flow
1. Google OAuth opens in Chrome on Android
2. Chrome redirects to https://mabidha.vercel.app/auth/callback
3. Android intercepts via App Links (assetlinks.json)
4. MainActivity loads the callback URL in WebView
5. Session is processed normally

---

## Listing Flow

### Posting a Listing
1. User must have an approved account_type
2. User must have active subscription (not expired)
3. User goes to /post-listing
4. Selects category (only unlocked types shown)
5. Fills in details, uploads images
6. Submits → listing saved as status=pending
7. User sees amber banner on profile: "Listing Submitted for Review"
8. Admin sees listing in Listings tab
9. Admin approves → status=live → listing appears publicly
10. Admin rejects → listing deleted

### Category Request Flow
1. User goes to /profile → Request Account tab
2. Fills in business name, account type, phone, county, message
3. Submits → saved to pending_requests table
4. Admin sees request in Requests tab
5. Admin approves:
   - Sets account_type (or adds to extra_account_types if already has one)
   - Sets subscription_expires_at to 1 month from now
   - Saves notification to users table
6. User opens profile → sees green "Account Approved! 🎉" banner
7. User can now post listings in approved category

### Subscription Expiry
- Approved on 10 April → expires 10 May
- Profile shows expiry date (gray → amber within 7 days → red when expired)
- Admin panel shows expiry on each user card
- Expired users cannot post listings (blocked with message)
- Admin can manually extend by editing the date in user card

---

## Messaging Flow

1. User views a listing → clicks "Send Message"
2. Navigates to /chat?with=OWNER_USER_ID
3. Chat page fetches owner profile and auto-opens conversation
4. User types message → sends on Enter or button click
5. Message saved to messages table
6. Owner sees unread green dot badge on Messages icon in bottom nav
7. Owner opens /chat → sees conversation → reads messages
8. Badge clears when /chat is opened

---

## Report Flow

1. Logged-in user views a listing
2. Clicks "Report this listing" below Safety Tips
3. Selects reason: Scam/Fraud, Fake listing, Wrong info, Inappropriate content, Already rented/sold, Other
4. Submits → saved to reports table
5. Admin sees report in Reports tab with listing details and reporter info
6. Admin can: View Listing, Delete Listing, or Dismiss report

---

## Security

### RLS Policies
- users: anyone can read, only own row can update/insert
- listings: anyone can read live ones, only owner can insert/update/delete
- favorites: only owner can read/insert/delete
- messages: only sender/receiver can read, only sender can insert
- pending_requests: only owner can read/insert (max 5 pending)
- portfolios: anyone can read, only owner can insert/delete
- testimonials: anyone can read, only authenticated users can insert
- reports: only reporter can read/insert
- storage: anyone can read, only authenticated users can upload

### Admin Security
- supabaseAdmin client uses service_role key (bypasses RLS)
- Only used in admin/marketer pages
- Service key stored in .env (never in source code)
- Admin route checks role from DB on every load

### Headers (vercel.json)
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY (prevents clickjacking)
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=(self)
- Content-Security-Policy: whitelists scripts, images, fonts, connections

### robots.txt
- Allows: /, /explore, /listing/*, /marketplace, /services, /entertainment
- Disallows: /kelly, /marketer, /profile, /chat, /post-listing, /auth/callback

---

## Environment Variables

### .env (local)
```
VITE_SUPABASE_URL=https://xaowhrzkoacwadehdxhy.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_nFm4e_wPKsLkGEUgnPnVbQ_7hy_Re-Y
VITE_SUPABASE_SERVICE_KEY=eyJhbGci... (service role key)
```

### Vercel Environment Variables
Same 3 variables must be added in Vercel → Settings → Environment Variables.

---

## Android App

- App ID: com.nyumbanihub.app
- Built with Capacitor 8.3.0
- webDir: dist (Vite build output)
- androidScheme: https
- APK tested without USB debugging (pay-as-you-go phone)
- App icon: replace ic_launcher.png in each mipmap folder
  - mdpi: 48x48, hdpi: 72x72, xhdpi: 96x96, xxhdpi: 144x144, xxxhdpi: 192x192

### Build Commands
```bash
npm run build          # Build web app
npx cap sync android   # Sync to Android project
```
Then open Android Studio → Build → Generate Signed APK

---

## Google OAuth Setup

- Provider: Google
- Client ID: 616234382380-a7chaletcs2os6j1k9ih4npbopi63kr2.apps.googleusercontent.com
- Redirect URI: https://mabidha.vercel.app/auth/callback
- Configured in: Supabase → Authentication → Providers → Google
- Also configured in: Google Cloud Console → OAuth 2.0 Credentials

---

## Key Decisions Made During Build

1. **window.location.reload() removed** — causes Capacitor session loss. Use React state updates instead.
2. **localStorage vs DB** — post-listing and profile pages fetch fresh from DB to get latest account_type after admin approval.
3. **Empty string bug** — account_type can be "" (empty string) not just null. Fixed with explicit check: `!!userData?.account_type && userData.account_type.trim() !== ''`
4. **Supabase anon key is public by design** — safe to expose in frontend. Service role key must never be exposed.
5. **Listings go pending not live** — admin must approve before listing appears publicly.
6. **Subscription auto-set** — when admin approves a category request, subscription_expires_at is automatically set to 1 month from approval date.
7. **Chat full screen** — sidebar hidden when conversation is open on all screen sizes.
8. **Realtime on listings** — explore and home pages listen for DELETE/UPDATE events so deleted listings disappear instantly without refresh.

---

## Deployment Checklist

- [ ] `npm run build` passes with no errors
- [ ] All 3 env vars added to Vercel
- [ ] RLS policies applied in Supabase SQL Editor (supabase-rls.sql)
- [ ] Storage policies applied (supabase-storage-rls.sql)
- [ ] Notification columns added (supabase-notifications.sql)
- [ ] `read` column added to messages table
- [ ] reports table created with RLS
- [ ] Realtime enabled on listings table (Database → Publications → supabase_realtime)
- [ ] Push to GitHub → Vercel auto-deploys
- [ ] `npx cap sync android` → build APK in Android Studio

---

## Branding

- App Name: Nyumbani Hub
- Logo: https://i.postimg.cc/qM8Nz01k/Untitled-design.png
- Hero Image: https://i.postimg.cc/k55Z2JFW/pexels-kelvin-kibe-3073372-26898331.jpg
- Primary Color: Emerald 600 (#059669)
- Font: System sans-serif
- Previous name: Mabidha (changed to Nyumbani Hub)
- Current domain: mabidha.vercel.app (nyumbanihub.com to be purchased)
