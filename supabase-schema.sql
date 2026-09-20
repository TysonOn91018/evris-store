-- EVRIS Supabase setup
-- Run this in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  birthday_month text,
  shipping_address text,
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

alter table public.profiles
add column if not exists shipping_address text;

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
  ('citrine-pearl-necklace', 'Citrine Pearl Necklace', 'Necklace', 'Silver-tone chain, pearl accent, citrine-color crystal', 588, 'assets/products/citrine-pearl-necklace.jpg', 'A delicate silver necklace finished with soft pearl accents and a warm citrine tone.'),
  ('citrine-pearl-bracelet', 'Citrine Pearl Bracelet', 'Bracelet', 'Natural stone beads, freshwater pearl accent, elastic cord', 358, 'assets/products/citrine-pearl-bracelet.jpg', 'A natural-stone bracelet with gentle yellow clarity and pearl shine.'),
  ('citrine-drop-earrings', 'Citrine Drop Earrings', 'Earrings', 'Crystal drop, silver-tone fitting', 278, 'assets/products/citrine-drop-earrings.jpg', 'Light drop earrings with a warm crystal finish.'),
  ('baroque-arc-earrings', 'Baroque Arc Earrings', 'Earrings', 'Freshwater pearl, silver-tone arc fitting', 198, 'assets/products/baroque-arc-earrings.jpg', 'Freshwater pearl earrings with a curved arc silhouette.'),
  ('tiger-eye-bracelet', 'Tiger Eye Bracelet', 'Bracelet', 'Tiger eye stone, stone mix beads, elastic cord', 428, 'assets/products/tiger-eye-bracelet.jpg', 'A warm tiger-eye stone mix with subtle movement.'),
  ('clear-crystal-bracelet', 'Clear Crystal Bracelet', 'Bracelet', 'White crystal, pearl accent, elastic cord', 488, 'assets/products/clear-crystal-bracelet.jpg', 'A clear crystal bracelet with pearl details.'),
  ('green-stone-bracelet', 'Green Stone Bracelet', 'Bracelet', 'Green stone beads, polished spacer details', 308, 'assets/products/green-stone-bracelet.jpg', 'A compact green stone bracelet for calm color.'),
  ('mix-stone-bracelet', 'Mix Stone Bracelet', 'Bracelet', 'Mixed natural stone beads, elastic cord', 388, 'assets/products/mix-stone-bracelet.jpg', 'A color-accent bracelet with mixed stones.'),
  ('moon-pearl-bracelet', 'Moon Pearl Bracelet', 'Bracelet', 'Pearl beads, silver-tone spacer details', 458, 'assets/products/moon-pearl-bracelet.jpg', 'A pearl-forward bracelet with a moonlit sheen.'),
  ('lapis-pearl-bracelet', 'Lapis Pearl Bracelet', 'Bracelet', 'Lapis-color stone beads, pearl accent, elastic cord', 518, 'assets/products/lapis-pearl-bracelet.jpg', 'Deep blue lapis tones meet pearl softness.'),
  ('amber-pearl-bracelet', 'Amber Pearl Bracelet', 'Bracelet', 'Amber-color stone beads, pearl accent, elastic cord', 568, 'assets/products/amber-pearl-bracelet.jpg', 'A warm amber-tone bracelet softened by pearl accents.'),
  ('minimal-pearl-chain', 'Minimal Pearl Chain', 'Bracelet', 'Fine silver-tone chain, small pearl accent', 298, 'assets/products/minimal-pearl-chain.jpg', 'A fine silver bracelet with a minimal pearl detail.')
on conflict (slug) do update set
  name = excluded.name,
  category = excluded.category,
  material = excluded.material,
  price = excluded.price,
  image_path = excluded.image_path,
  description = excluded.description,
  is_active = true;

-- Keep the database catalogue aligned with the additional online-only pieces
-- already rendered by products-data.js.
insert into public.products (slug, name, category, material, price, image_path, description)
values
  ('aqua-pearl-bracelet', 'Aqua Pearl Bracelet', 'Bracelet', 'Aqua-tone natural stone beads, freshwater pearl accent', 538, 'assets/products/aqua-pearl-bracelet.jpg', 'A soft blue stone bracelet made for ivory shirts, denim, and quiet summer styling.'),
  ('smoky-quartz-bracelet', 'Smoky Quartz Bracelet', 'Bracelet', 'Smoky quartz-color stone, pearl accent, elastic cord', 498, 'assets/products/smoky-quartz-bracelet.jpg', 'A smoky quartz bracelet with quiet depth and a softened pearl finish.'),
  ('teal-pearl-bracelet', 'Teal Pearl Bracelet', 'Bracelet', 'Teal-color stone beads, pearl accent, elastic cord', 468, 'assets/products/teal-pearl-bracelet.jpg', 'A teal-toned bracelet that brings a clean color accent to neutral styling.'),
  ('silver-lapis-bracelet', 'Silver Lapis Bracelet', 'Bracelet', 'Lapis-color stone, silver-tone spacer details', 548, 'assets/products/silver-lapis-bracelet.jpg', 'A lapis-color bracelet sharpened with silver-tone details for a cooler line.')
on conflict (slug) do update set
  name = excluded.name,
  category = excluded.category,
  material = excluded.material,
  price = excluded.price,
  image_path = excluded.image_path,
  description = excluded.description,
  is_active = true;

-- ---------------------------------------------------------------------------
-- Inventory, game coupons, and secure checkout
-- ---------------------------------------------------------------------------
-- These objects make Supabase the source of truth for price, availability and
-- coupon redemption. The browser must call `place_order`; it must not insert
-- into orders/order_items directly.

alter table public.products
  add column if not exists updated_at timestamptz not null default now();

alter table public.products
  drop constraint if exists products_stock_nonnegative;
alter table public.products
  add constraint products_stock_nonnegative check (stock >= 0);

alter table public.orders
  add column if not exists subtotal_before_discount integer,
  add column if not exists discount_amount integer not null default 0,
  add column if not exists coupon_code text;

create table if not exists public.game_coupons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  code text not null unique,
  product_slug text not null references public.products(slug),
  milestone integer not null check (milestone in (256, 512, 1024, 2048)),
  discount_percent integer not null check (discount_percent between 1 and 100),
  issued_at timestamptz not null default now(),
  redeemed_at timestamptz,
  order_id uuid references public.orders(id) on delete set null,
  unique (user_id, milestone)
);

create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  product_slug text not null references public.products(slug),
  order_id uuid references public.orders(id) on delete set null,
  quantity_delta integer not null check (quantity_delta <> 0),
  reason text not null check (reason in ('order', 'restock', 'adjustment')),
  created_at timestamptz not null default now()
);

alter table public.game_coupons enable row level security;
alter table public.inventory_movements enable row level security;

drop policy if exists "Users can read own game coupons" on public.game_coupons;
create policy "Users can read own game coupons"
on public.game_coupons for select
to authenticated
using (auth.uid() = user_id);

-- Store staff should manage stock through the Supabase dashboard or a
-- service-role API. Customers never receive a direct write policy.
drop policy if exists "Users can read their own orders" on public.orders;
create policy "Users can read their own orders"
on public.orders for select
to authenticated
using (auth.uid() = user_id);

-- Retire the old browser-write checkout policies. RLS remains enabled, so
-- inserts are only possible through the security-definer RPC below.
drop policy if exists "Anyone can place orders" on public.orders;
drop policy if exists "Anyone can add order items" on public.order_items;

-- Persist one reward per signed-in shopper and milestone. The game generates
-- the random product locally; this function validates the tier, product set
-- and ownership before the coupon can later be redeemed by checkout.
create or replace function public.claim_game_coupon(
  p_milestone integer,
  p_product_slug text,
  p_code text
)
returns public.game_coupons
language plpgsql
security definer
set search_path = public
as $$
declare
  v_discount integer;
  v_coupon public.game_coupons;
begin
  if auth.uid() is null then
    raise exception 'Sign in to save a game coupon.';
  end if;

  v_discount := case p_milestone
    when 256 then 3 when 512 then 5 when 1024 then 8 when 2048 then 10
    else null
  end;
  if v_discount is null then
    raise exception 'This reward tier is not valid.';
  end if;

  if p_product_slug not in ('citrine-drop-earrings', 'moon-pearl-bracelet', 'minimal-pearl-chain') then
    raise exception 'This product cannot receive a game coupon.';
  end if;
  if length(trim(coalesce(p_code, ''))) < 8 then
    raise exception 'Coupon code is not valid.';
  end if;

  insert into public.game_coupons (user_id, code, product_slug, milestone, discount_percent)
  values (auth.uid(), trim(p_code), p_product_slug, p_milestone, v_discount)
  on conflict (user_id, milestone) do update
    set code = public.game_coupons.code
  returning * into v_coupon;

  return v_coupon;
end;
$$;

create or replace function public.place_order(
  p_customer_name text,
  p_customer_email text,
  p_shipping_address text,
  p_gift_option text,
  p_items jsonb,
  p_coupon_code text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid := gen_random_uuid();
  v_item jsonb;
  v_product public.products;
  v_coupon public.game_coupons;
  v_slug text;
  v_quantity integer;
  v_subtotal integer := 0;
  v_coupon_target_total integer := 0;
  v_discount integer := 0;
  v_seen_slugs text[] := array[]::text[];
begin
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Your cart is empty.';
  end if;
  if length(trim(coalesce(p_customer_name, ''))) = 0
    or length(trim(coalesce(p_customer_email, ''))) = 0
    or length(trim(coalesce(p_shipping_address, ''))) = 0 then
    raise exception 'Please complete your shipping details.';
  end if;

  if nullif(trim(coalesce(p_coupon_code, '')), '') is not null then
    if auth.uid() is null then
      raise exception 'Sign in to use a game coupon.';
    end if;
    select * into v_coupon
    from public.game_coupons
    where code = trim(p_coupon_code)
      and user_id = auth.uid()
      and redeemed_at is null
    for update;
    if not found then
      raise exception 'This coupon is unavailable or has already been used.';
    end if;
  end if;

  -- Product rows are locked while availability is checked. This prevents two
  -- simultaneous checkouts from selling the same final item.
  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_slug := trim(coalesce(v_item->>'product_slug', ''));
    begin
      v_quantity := (v_item->>'quantity')::integer;
    exception when invalid_text_representation then
      raise exception 'A cart quantity is invalid.';
    end;
    if v_slug = '' or v_quantity is null or v_quantity < 1 then
      raise exception 'A cart item is invalid.';
    end if;
    if v_slug = any(v_seen_slugs) then
      raise exception 'A cart product is duplicated.';
    end if;
    v_seen_slugs := array_append(v_seen_slugs, v_slug);

    select * into v_product
    from public.products
    where slug = v_slug and is_active = true
    for update;
    if not found then
      raise exception 'This product is no longer available.';
    end if;
    if v_product.stock < v_quantity then
      raise exception '% is out of stock.', v_product.name;
    end if;

    v_subtotal := v_subtotal + (v_product.price * v_quantity);
    if v_coupon.id is not null and v_product.slug = v_coupon.product_slug then
      v_coupon_target_total := v_coupon_target_total + (v_product.price * v_quantity);
    end if;
  end loop;

  if v_coupon.id is not null then
    if v_coupon_target_total = 0 then
      raise exception 'Add the coupon product to your cart before using this coupon.';
    end if;
    v_discount := floor(v_coupon_target_total * v_coupon.discount_percent / 100.0)::integer;
  end if;

  insert into public.orders (
    id, user_id, customer_name, customer_email, shipping_address, gift_option,
    subtotal, subtotal_before_discount, discount_amount, coupon_code, status
  ) values (
    v_order_id, auth.uid(), trim(p_customer_name), trim(p_customer_email),
    trim(p_shipping_address), coalesce(nullif(trim(p_gift_option), ''), 'none'),
    v_subtotal - v_discount, v_subtotal, v_discount,
    case when v_coupon.id is null then null else v_coupon.code end, 'received'
  );

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_slug := trim(v_item->>'product_slug');
    v_quantity := (v_item->>'quantity')::integer;
    select * into v_product from public.products where slug = v_slug for update;

    update public.products
    set stock = stock - v_quantity, updated_at = now()
    where slug = v_slug;
    insert into public.order_items (order_id, product_slug, product_name, unit_price, quantity, image_url)
    values (v_order_id, v_product.slug, v_product.name, v_product.price, v_quantity, v_product.image_path);
    insert into public.inventory_movements (product_slug, order_id, quantity_delta, reason)
    values (v_product.slug, v_order_id, -v_quantity, 'order');
  end loop;

  if v_coupon.id is not null then
    update public.game_coupons
    set redeemed_at = now(), order_id = v_order_id
    where id = v_coupon.id;
  end if;

  return jsonb_build_object(
    'order_id', v_order_id,
    'subtotal_before_discount', v_subtotal,
    'discount_amount', v_discount,
    'subtotal', v_subtotal - v_discount
  );
end;
$$;

revoke all on function public.claim_game_coupon(integer, text, text) from public;
grant execute on function public.claim_game_coupon(integer, text, text) to authenticated;
revoke all on function public.place_order(text, text, text, text, jsonb, text) from public;
grant execute on function public.place_order(text, text, text, text, jsonb, text) to anon, authenticated;
