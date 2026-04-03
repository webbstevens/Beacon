-- Generations table: stores each llms.txt generation per user
create table if not exists public.generations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  url text not null,
  markdown text not null,
  created_at timestamptz default now() not null
);

-- Index for fast per-user lookups
create index if not exists idx_generations_user_id on public.generations(user_id);

-- Row Level Security: users can only see their own generations
alter table public.generations enable row level security;

create policy "Users can view their own generations"
  on public.generations for select
  using (auth.uid() = user_id);

create policy "Users can insert their own generations"
  on public.generations for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own generations"
  on public.generations for delete
  using (auth.uid() = user_id);

-- Rate limiting helper: count generations in last 24h
create or replace function public.generation_count_today(uid uuid)
returns integer
language sql
security definer
as $$
  select count(*)::integer
  from public.generations
  where user_id = uid
    and created_at > now() - interval '24 hours';
$$;
