alter table public.reports
add column if not exists reason text;

alter table public.prayer_reports
add column if not exists reason text;
