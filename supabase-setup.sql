-- USERS
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  phone text,
  county text,
  avatar_url text,
  role text default 'user',
  account_type text,
  extra_account_types text[] default '{}',
  is_active boolean default true,
  subscription_expires_at timestamptz,
  has_notification boolean default false,
  notification_message text,
  created_at timestamptz default now()
);

-- LISTINGS
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  title text not null,
  listing_type text,
  county text,
  area text,
  price text,
  description text,
  phone text,
  whatsapp text,
  images text[] default '{}',
  map_url text,
  status text default 'live',
  created_at timestamptz default now()
);

-- FAVORITES
create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  listing_id uuid references public.listings(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, listing_id)
);

-- MESSAGES
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid references public.users(id) on delete cascade,
  to_user_id uuid references public.users(id) on delete cascade,
  listing_id uuid references public.listings(id) on delete set null,
  content text not null,
  read boolean default false,
  created_at timestamptz default now()
);

-- PORTFOLIOS
create table public.portfolios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  image_url text not null,
  caption text,
  created_at timestamptz default now()
);

-- TESTIMONIALS
create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  name text,
  account_type text,
  subcategory text,
  message text not null,
  avatar_url text,
  created_at timestamptz default now()
);

-- PENDING REQUESTS
create table public.pending_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  user_email text,
  user_name text,
  business_name text,
  account_type text,
  phone text,
  county text,
  message text,
  status text default 'pending',
  created_at timestamptz default now()
);

-- APP CONFIG
create table public.app_config (
  key text primary key,
  value text
);
insert into public.app_config (key, value) values ('app_enabled', 'true');

-- STORAGE BUCKET
insert into storage.buckets (id, name, public) values ('listings', 'listings', true);

-- RLS POLICIES
alter table public.users enable row level security;
alter table public.listings enable row level security;
alter table public.favorites enable row level security;
alter table public.messages enable row level security;
alter table public.portfolios enable row level security;
alter table public.testimonials enable row level security;
alter table public.pending_requests enable row level security;
alter table public.app_config enable row level security;

-- users policies
create policy "Users can read own row" on public.users for select using (auth.uid() = id);
create policy "Users can update own row" on public.users for update using (auth.uid() = id);
create policy "Users can insert own row" on public.users for insert with check (auth.uid() = id);
create policy "Public read users" on public.users for select using (true);

-- listings policies
create policy "Anyone can read listings" on public.listings for select using (true);
create policy "Users can insert own listings" on public.listings for insert with check (auth.uid() = user_id);
create policy "Users can update own listings" on public.listings for update using (auth.uid() = user_id);
create policy "Users can delete own listings" on public.listings for delete using (auth.uid() = user_id);

-- favorites policies
create policy "Users can manage own favorites" on public.favorites for all using (auth.uid() = user_id);

-- messages policies
create policy "Users can read own messages" on public.messages for select using (auth.uid() = from_user_id or auth.uid() = to_user_id);
create policy "Users can send messages" on public.messages for insert with check (auth.uid() = from_user_id);
create policy "Users can update own messages" on public.messages for update using (auth.uid() = to_user_id);

-- portfolios policies
create policy "Anyone can read portfolios" on public.portfolios for select using (true);
create policy "Users can manage own portfolio" on public.portfolios for all using (auth.uid() = user_id);

-- testimonials policies
create policy "Anyone can read testimonials" on public.testimonials for select using (true);
create policy "Users can insert testimonials" on public.testimonials for insert with check (auth.uid() = user_id);

-- pending_requests policies
create policy "Users can manage own requests" on public.pending_requests for all using (auth.uid() = user_id);

-- app_config policies
create policy "Anyone can read app config" on public.app_config for select using (true);

-- storage policies
create policy "Anyone can read listing images" on storage.objects for select using (bucket_id = 'listings');
create policy "Authenticated users can upload" on storage.objects for insert with check (bucket_id = 'listings' and auth.role() = 'authenticated');
create policy "Users can update own uploads" on storage.objects for update using (bucket_id = 'listings' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users can delete own uploads" on storage.objects for delete using (bucket_id = 'listings' and auth.uid()::text = (storage.foldername(name))[1]);
