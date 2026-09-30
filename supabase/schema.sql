create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  full_name text,
  created_at timestamptz default now()
);

create table if not exists public.saved_places (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  place_id text not null,
  place_name text not null,
  location text,
  image text,
  vibe text,
  created_at timestamptz default now(),
  unique (user_id, place_id)
);

create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  destination text not null,
  start_date date,
  end_date date,
  budget numeric,
  status text default 'planned',
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.assistant_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  message text not null,
  reply text,
  created_at timestamptz default now()
);

alter table public.users enable row level security;
alter table public.saved_places enable row level security;
alter table public.trips enable row level security;
alter table public.assistant_messages enable row level security;

create policy "Users can view own profile" on public.users
for select using (auth.uid() = id);

create policy "Users can insert own profile" on public.users
for insert with check (auth.uid() = id);

create policy "Users can update own profile" on public.users
for update using (auth.uid() = id);

create policy "Users can view own saved places" on public.saved_places
for select using (auth.uid() = user_id);

create policy "Users can insert own saved places" on public.saved_places
for insert with check (auth.uid() = user_id);

create policy "Users can update own saved places" on public.saved_places
for update using (auth.uid() = user_id);

create policy "Users can delete own saved places" on public.saved_places
for delete using (auth.uid() = user_id);

create policy "Users can view own trips" on public.trips
for select using (auth.uid() = user_id);

create policy "Users can insert own trips" on public.trips
for insert with check (auth.uid() = user_id);

create policy "Users can update own trips" on public.trips
for update using (auth.uid() = user_id);

create policy "Users can delete own trips" on public.trips
for delete using (auth.uid() = user_id);

create policy "Users can view own assistant history" on public.assistant_messages
for select using (auth.uid() = user_id);

create policy "Users can insert own assistant history" on public.assistant_messages
for insert with check (auth.uid() = user_id);

create policy "Users can update own assistant history" on public.assistant_messages
for update using (auth.uid() = user_id);

create policy "Users can delete own assistant history" on public.assistant_messages
for delete using (auth.uid() = user_id);
