-- Radar: AI Visibility Tracking tables

-- Products: a URL the user wants to track across AI models
create table if not exists public.products (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  url text not null,
  scraped_title text,
  scraped_context text,
  created_at timestamptz default now() not null
);

create index if not exists idx_products_user_id on public.products(user_id);

alter table public.products enable row level security;

create policy "Users can view their own products"
  on public.products for select using (auth.uid() = user_id);

create policy "Users can insert their own products"
  on public.products for insert with check (auth.uid() = user_id);

create policy "Users can update their own products"
  on public.products for update using (auth.uid() = user_id);

create policy "Users can delete their own products"
  on public.products for delete using (auth.uid() = user_id);


-- Tracked prompts: buyer questions to monitor for each product
create table if not exists public.tracked_prompts (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references public.products(id) on delete cascade not null,
  prompt_text text not null,
  frequency text default 'daily' not null,
  created_at timestamptz default now() not null
);

create index if not exists idx_tracked_prompts_product_id on public.tracked_prompts(product_id);

alter table public.tracked_prompts enable row level security;

create policy "Users can view prompts for their products"
  on public.tracked_prompts for select
  using (exists (select 1 from public.products where products.id = tracked_prompts.product_id and products.user_id = auth.uid()));

create policy "Users can insert prompts for their products"
  on public.tracked_prompts for insert
  with check (exists (select 1 from public.products where products.id = tracked_prompts.product_id and products.user_id = auth.uid()));

create policy "Users can delete prompts for their products"
  on public.tracked_prompts for delete
  using (exists (select 1 from public.products where products.id = tracked_prompts.product_id and products.user_id = auth.uid()));


-- Scan results: each time we query an LLM for a prompt
create table if not exists public.scan_results (
  id uuid default gen_random_uuid() primary key,
  prompt_id uuid references public.tracked_prompts(id) on delete cascade not null,
  model_name text not null,         -- 'chatgpt', 'gemini', 'claude'
  mentioned boolean not null,
  position integer,                 -- 1st, 2nd, 3rd recommendation (null if not mentioned)
  raw_response text,
  scanned_at timestamptz default now() not null
);

create index if not exists idx_scan_results_prompt_id on public.scan_results(prompt_id);
create index if not exists idx_scan_results_scanned_at on public.scan_results(scanned_at);

alter table public.scan_results enable row level security;

create policy "Users can view scan results for their products"
  on public.scan_results for select
  using (exists (
    select 1 from public.tracked_prompts tp
    join public.products p on p.id = tp.product_id
    where tp.id = scan_results.prompt_id and p.user_id = auth.uid()
  ));

-- Service role inserts scan results (from the API cron), so no insert RLS needed for users.
-- We grant insert to the service role via the service key.
create policy "Service role can insert scan results"
  on public.scan_results for insert
  with check (true);
