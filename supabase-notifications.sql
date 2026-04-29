alter table users add column if not exists has_notification boolean default false;
alter table users add column if not exists notification_message text default null;
