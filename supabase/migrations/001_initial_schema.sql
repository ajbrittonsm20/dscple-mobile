-- DSCPLE Database Schema
create extension if not exists "uuid-ossp";

-- ============================================
-- PROFILES
-- ============================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  first_name text,
  last_name text,
  address text,
  city text,
  state text,
  zip text,
  monthly_giving integer default 0,
  push_token text,
  onboarding_complete boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- ============================================
-- DEVOTIONALS
-- ============================================
create table public.devotionals (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  date date not null,
  category text check (category in ('faith','hope','love','peace','gratitude','courage','wisdom','joy')),
  scripture_reference text not null,
  scripture_text text not null,
  reflection text,
  prayer text,
  image_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_devotionals_date on public.devotionals(date desc);

alter table public.devotionals enable row level security;
create policy "Devotionals are viewable by authenticated" on public.devotionals for select using (auth.role() = 'authenticated');

-- ============================================
-- BOOKMARKS
-- ============================================
create table public.bookmarks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  devotional_id uuid references public.devotionals on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, devotional_id)
);

create index idx_bookmarks_user on public.bookmarks(user_id);

alter table public.bookmarks enable row level security;
create policy "Users manage own bookmarks" on public.bookmarks for all using (auth.uid() = user_id);

-- ============================================
-- DONATIONS
-- ============================================
create table public.donations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete set null,
  amount numeric(10,2) not null,
  cause text not null check (cause in (
    'general_fund','missions','youth_ministry','community_outreach',
    'building_fund','worship','education','disaster_relief'
  )),
  donor_name text,
  is_anonymous boolean default false,
  message text,
  stripe_payment_intent_id text,
  status text default 'succeeded',
  created_at timestamptz default now()
);

create index idx_donations_user on public.donations(user_id);

alter table public.donations enable row level security;
create policy "Users can insert donations" on public.donations for insert with check (auth.uid() = user_id);
create policy "Users can view own donations" on public.donations for select using (auth.uid() = user_id);

-- ============================================
-- PRAYER REQUESTS
-- ============================================
create table public.prayer_requests (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete set null,
  name text not null,
  prayer_request text not null,
  visibility text default 'private' check (visibility in ('private','public')),
  need_conversation boolean default false,
  created_at timestamptz default now()
);

alter table public.prayer_requests enable row level security;
create policy "Users can insert prayer requests" on public.prayer_requests for insert with check (auth.uid() = user_id);
create policy "Users can view own and public" on public.prayer_requests for select using (auth.uid() = user_id or visibility = 'public');

-- ============================================
-- MISSIONARIES
-- ============================================
create table public.missionaries (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  type text default 'missionary' check (type in ('missionary','nonprofit')),
  location text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  description text,
  image_url text,
  website_url text,
  created_at timestamptz default now()
);

alter table public.missionaries enable row level security;
create policy "Missionaries viewable by all" on public.missionaries for select using (auth.role() = 'authenticated');

-- ============================================
-- SUBSCRIPTIONS
-- ============================================
create table public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  stripe_customer_id text,
  stripe_subscription_id text,
  amount numeric(10,2),
  status text default 'active',
  current_period_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.subscriptions enable row level security;
create policy "Users view own subscription" on public.subscriptions for select using (auth.uid() = user_id);
