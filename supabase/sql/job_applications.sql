-- Create storage bucket for CVs
insert into storage.buckets (id, name, public)
values ('job-applications', 'job-applications', true)
on conflict (id) do nothing;

-- Allow anyone to upload to job-applications bucket
create policy "Anyone can upload CVs" on storage.objects
  for insert with check (bucket_id = 'job-applications');

-- Allow public read of CVs
create policy "Public CV read" on storage.objects
  for select using (bucket_id = 'job-applications');

create table if not exists job_applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  email text not null,
  position text not null,
  department text not null,
  cv_url text,
  created_at timestamptz default now()
);

alter table job_applications enable row level security;

-- Anyone can insert (apply)
create policy "Anyone can apply" on job_applications for insert with check (true);

-- Only admins can read
create policy "Admins can read applications" on job_applications for select
  using (exists (
    select 1 from users where id = auth.uid() and role = 'admin'
  ));
