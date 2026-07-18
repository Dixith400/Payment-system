create table user_usage (
  user_id uuid primary key references auth.users(id),
  usage_count int not null default 0,
  reset_at timestamptz not null default now() + interval '24 hours'
);