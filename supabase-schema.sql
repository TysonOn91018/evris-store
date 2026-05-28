-- EVRIS Supabase setup
-- Run this in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  birthday_month text,
  rank text not null default 'Silver',
  points integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  category text not null,
  material text,
  price integer not null,
  image_path text not null,
  description text,
  stock integer not null default 99,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  customer_email text not null,
  shipping_address text not null,
  gift_option text not null default 'none',
  subtotal integer not null,
  status text not null default 'received',
  created_at timestamptz not null default now()
);

alter table public.orders
add column if not exists gift_option text not null default 'none';

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_slug text not null,
  product_name text not null,
  unit_price integer not null,
  quantity integer not null check (quantity > 0),
  image_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_slug text not null,
  product_name text not null,
  image_url text,
  created_at timestamptz not null default now(),
  unique (user_id, product_slug)
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_slug text not null,
  user_email text,
  rating integer not null check (rating between 1 and 5),
  comment text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.favorites enable row level security;
alter table public.reviews enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Users can upsert own profile" on public.profiles;
create policy "Users can upsert own profile"
on public.profiles for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Anyone can read active products" on public.products;
create policy "Anyone can read active products"
on public.products for select
to anon, authenticated
using (is_active = true);

drop policy if exists "Anyone can subscribe newsletter" on public.newsletter_subscribers;
create policy "Anyone can subscribe newsletter"
on public.newsletter_subscribers for insert
to anon, authenticated
with check (true);

drop policy if exists "Anyone can place orders" on public.orders;
create policy "Anyone can place orders"
on public.orders for insert
to anon, authenticated
with check (true);

drop policy if exists "Anyone can add order items" on public.order_items;
create policy "Anyone can add order items"
on public.order_items for insert
to anon, authenticated
with check (true);

drop policy if exists "Users can manage own favorites" on public.favorites;
create policy "Users can manage own favorites"
on public.favorites for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Anyone can read reviews" on public.reviews;
create policy "Anyone can read reviews"
on public.reviews for select
to anon, authenticated
using (true);

drop policy if exists "Anyone can add reviews" on public.reviews;
create policy "Anyone can add reviews"
on public.reviews for insert
to anon, authenticated
with check (true);

insert into public.products (slug, name, category, material, price, image_path, description)
values
  ('citrine-pearl-necklace', 'Citrine Pearl Necklace', 'Necklace', 'Silver-tone chain, pearl accent, citrine-color crystal', 588, 'assets/products/clean/citrine-pearl-necklace.jpg', 'A delicate silver necklace finished with soft pearl accents and a warm citrine tone.'),
  ('citrine-pearl-bracelet', 'Citrine Pearl Bracelet', 'Bracelet', 'Natural stone beads, freshwater pearl accent, elastic cord', 358, 'assets/products/clean/citrine-pearl-bracelet.jpg', 'A natural-stone bracelet with gentle yellow clarity and pearl shine.'),
  ('citrine-drop-earrings', 'Citrine Drop Earrings', 'Earrings', 'Crystal drop, silver-tone fitting', 278, 'assets/products/clean/citrine-drop-earrings.jpg', 'Light drop earrings with a warm crystal finish.'),
  ('baroque-arc-earrings', 'Baroque Arc Earrings', 'Earrings', 'Freshwater pearl, silver-tone arc fitting', 198, 'assets/products/clean/baroque-arc-earrings.jpg', 'Freshwater pearl earrings with a curved arc silhouette.'),
  ('tiger-eye-bracelet', 'Tiger Eye Bracelet', 'Bracelet', 'Tiger eye stone, stone mix beads, elastic cord', 428, 'assets/products/clean/tiger-eye-bracelet.jpg', 'A warm tiger-eye stone mix with subtle movement.'),
  ('clear-crystal-bracelet', 'Clear Crystal Bracelet', 'Bracelet', 'White crystal, pearl accent, elastic cord', 488, 'assets/products/clean/clear-crystal-bracelet.jpg', 'A clear crystal bracelet with pearl details.'),
  ('green-stone-bracelet', 'Green Stone Bracelet', 'Bracelet', 'Green stone beads, polished spacer details', 308, 'assets/products/clean/green-stone-bracelet.jpg', 'A compact green stone bracelet for calm color.'),
  ('mix-stone-bracelet', 'Mix Stone Bracelet', 'Bracelet', 'Mixed natural stone beads, elastic cord', 388, 'assets/products/clean/mix-stone-bracelet.jpg', 'A color-accent bracelet with mixed stones.'),
  ('moon-pearl-bracelet', 'Moon Pearl Bracelet', 'Bracelet', 'Pearl beads, silver-tone spacer details', 458, 'assets/products/clean/moon-pearl-bracelet.jpg', 'A pearl-forward bracelet with a moonlit sheen.'),
  ('lapis-pearl-bracelet', 'Lapis Pearl Bracelet', 'Bracelet', 'Lapis-color stone beads, pearl accent, elastic cord', 518, 'assets/products/clean/lapis-pearl-bracelet.jpg', 'Deep blue lapis tones meet pearl softness.'),
  ('amber-pearl-bracelet', 'Amber Pearl Bracelet', 'Bracelet', 'Amber-color stone beads, pearl accent, elastic cord', 568, 'assets/products/clean/amber-pearl-bracelet.jpg', 'A warm amber-tone bracelet softened by pearl accents.'),
  ('minimal-pearl-chain', 'Minimal Pearl Chain', 'Bracelet', 'Fine silver-tone chain, small pearl accent', 298, 'assets/products/clean/minimal-pearl-chain.jpg', 'A fine silver bracelet with a minimal pearl detail.')
on conflict (slug) do update set
  name = excluded.name,
  category = excluded.category,
  material = excluded.material,
  price = excluded.price,
  image_path = excluded.image_path,
  description = excluded.description,
  is_active = true;
