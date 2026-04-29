alter table users enable row level security;
create policy "users_read_all" on users for select using (true);
create policy "users_update_own" on users for update using (auth.uid() = id);
create policy "users_insert_own" on users for insert with check (auth.uid() = id);

alter table listings enable row level security;
create policy "listings_read_live" on listings for select using (status = 'live');
create policy "listings_read_own" on listings for select using (auth.uid() = user_id);
create policy "listings_insert_own" on listings for insert with check (auth.uid() = user_id);
create policy "listings_update_own" on listings for update using (auth.uid() = user_id);
create policy "listings_delete_own" on listings for delete using (auth.uid() = user_id);

alter table favorites enable row level security;
create policy "favorites_read_own" on favorites for select using (auth.uid() = user_id);
create policy "favorites_insert_own" on favorites for insert with check (auth.uid() = user_id);
create policy "favorites_delete_own" on favorites for delete using (auth.uid() = user_id);

alter table messages enable row level security;
create policy "messages_read_own" on messages for select using (auth.uid() = from_user_id or auth.uid() = to_user_id);
create policy "messages_insert_own" on messages for insert with check (auth.uid() = from_user_id);
create policy "messages_update_own" on messages for update using (auth.uid() = to_user_id);

alter table pending_requests enable row level security;
create policy "requests_read_own" on pending_requests for select using (auth.uid() = user_id);
create policy "requests_insert_own" on pending_requests for insert with check (
  auth.uid() = user_id and
  (select count(*) from pending_requests where user_id = auth.uid() and status = 'pending') < 5
);

alter table portfolios enable row level security;
create policy "portfolios_read_all" on portfolios for select using (true);
create policy "portfolios_insert_own" on portfolios for insert with check (auth.uid() = user_id);
create policy "portfolios_delete_own" on portfolios for delete using (auth.uid() = user_id);

alter table testimonials enable row level security;
create policy "testimonials_read_all" on testimonials for select using (true);
create policy "testimonials_insert_own" on testimonials for insert with check (auth.uid() = user_id);
