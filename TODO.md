# Nyumbani Hub — Security & Deployment To-Do List

## ✅ Done
- [x] Supabase keys moved to `.env`
- [x] RLS policies set up on all tables
- [x] Admin/marketer pages use service role key

---

## 🔴 Critical

- [x] **#4** — Add `read` column to messages table (for unread badge)
- [x] **#5** — Block expired users from posting listings

---

## 🟡 Important

- [x] **#6** — Storage bucket policies (restrict unauthenticated uploads)
- [x] **#7** — Email notification when admin approves a request
- [x] **#8** — Test spam protection on pending_requests (max 5 pending)

---

## 🟢 Good to Have

- [x] **#9**  — Add `robots.txt` to `/public`
- [x] **#10** — Add Content Security Policy headers via `vercel.json`
- [x] **#11** — Add report button on listings (anti-scam) + admin Reports tab
- [x] **#12** — Admin approval step before listing goes live
