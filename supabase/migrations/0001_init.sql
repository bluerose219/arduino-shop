-- 아두이노 쇼핑몰 초기 스키마

-- ───────── 테이블 ─────────
create table public.categories (
  slug text primary key,
  name text not null,
  sort int not null default 0,
  image_url text
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  category_slug text not null references public.categories(slug),
  name text not null,
  description text not null default '',
  price int not null check (price >= 0),
  stock int not null default 0 check (stock >= 0),
  image_url text,
  specs jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index products_category_idx on public.products(category_slug);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  phone text,
  address text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_no text not null unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  order_name text not null,
  items_price int not null,
  shipping_fee int not null,
  total_price int not null,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'shipping', 'delivered', 'cancelled')),
  recipient text not null,
  phone text not null,
  address text not null,
  memo text,
  payment_key text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);
create index orders_user_idx on public.orders(user_id, created_at desc);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  image_url text,
  price int not null,
  quantity int not null check (quantity > 0)
);
create index order_items_order_idx on public.order_items(order_id);

-- 서버 전용 설정 (API로 노출되지 않는 스키마)
create schema if not exists private;
create table private.app_config (
  key text primary key,
  value text not null
);

-- ───────── 함수 ─────────
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- 회원가입 시 프로필 자동 생성
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, new.raw_user_meta_data ->> 'name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 주문 생성: 가격은 DB 기준으로 계산 (클라이언트 금액 조작 방지)
-- p_items: [{"product_id": "...", "quantity": 2}, ...]
create or replace function public.create_order(
  p_items jsonb,
  p_recipient text,
  p_phone text,
  p_address text,
  p_memo text default null
)
returns text
language plpgsql security definer set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_order_id uuid;
  v_order_no text;
  v_items_price int := 0;
  v_shipping int;
  v_count int := 0;
  v_first_name text;
  r record;
begin
  if v_user is null then
    raise exception '로그인이 필요합니다';
  end if;
  if jsonb_array_length(coalesce(p_items, '[]'::jsonb)) = 0 then
    raise exception '주문할 상품이 없습니다';
  end if;

  v_order_no := 'ORD' || to_char(now(), 'YYYYMMDDHH24MISS')
    || upper(substr(md5(gen_random_uuid()::text), 1, 6));

  insert into public.orders (order_no, user_id, order_name, items_price, shipping_fee,
                             total_price, recipient, phone, address, memo)
  values (v_order_no, v_user, '', 0, 0, 0, p_recipient, p_phone, p_address, p_memo)
  returning id into v_order_id;

  for r in
    select p.id, p.name, p.price, p.stock, p.image_url, (i ->> 'quantity')::int as qty
    from jsonb_array_elements(p_items) i
    join public.products p on p.id = (i ->> 'product_id')::uuid and p.is_active
  loop
    if r.qty is null or r.qty < 1 then
      raise exception '수량이 올바르지 않습니다';
    end if;
    if r.qty > r.stock then
      raise exception '재고가 부족합니다: %', r.name;
    end if;
    insert into public.order_items (order_id, product_id, product_name, image_url, price, quantity)
    values (v_order_id, r.id, r.name, r.image_url, r.price, r.qty);
    v_items_price := v_items_price + r.price * r.qty;
    v_count := v_count + 1;
    if v_first_name is null then
      v_first_name := r.name;
    end if;
  end loop;

  if v_count <> jsonb_array_length(p_items) then
    raise exception '판매 중이 아닌 상품이 포함되어 있습니다';
  end if;

  v_shipping := case when v_items_price >= 30000 then 0 else 3000 end;

  update public.orders
  set items_price = v_items_price,
      shipping_fee = v_shipping,
      total_price = v_items_price + v_shipping,
      order_name = case when v_count > 1
                     then v_first_name || ' 외 ' || (v_count - 1) || '건'
                     else v_first_name end
  where id = v_order_id;

  return v_order_no;
end;
$$;

-- 결제 승인 후 서버에서만 호출 (서버 비밀값 확인)
create or replace function public.mark_order_paid(
  p_order_no text,
  p_payment_key text,
  p_secret text
)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_order public.orders;
begin
  if p_secret is distinct from
     (select value from private.app_config where key = 'order_confirm_secret') then
    raise exception 'unauthorized';
  end if;

  select * into v_order from public.orders where order_no = p_order_no for update;
  if v_order.id is null then
    raise exception '주문을 찾을 수 없습니다';
  end if;
  if v_order.status <> 'pending' then
    return;
  end if;

  update public.orders
  set status = 'paid', payment_key = p_payment_key, paid_at = now()
  where id = v_order.id;

  update public.products p
  set stock = greatest(0, p.stock - oi.quantity)
  from public.order_items oi
  where oi.order_id = v_order.id and oi.product_id = p.id;
end;
$$;

revoke execute on function public.create_order(jsonb, text, text, text, text) from anon;
revoke execute on function public.mark_order_paid(text, text, text) from public;
grant execute on function public.mark_order_paid(text, text, text) to anon, authenticated;

-- ───────── RLS ─────────
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "카테고리 공개 조회" on public.categories for select using (true);
create policy "카테고리 관리자" on public.categories for all
  using (public.is_admin()) with check (public.is_admin());

create policy "상품 공개 조회" on public.products for select
  using (is_active or public.is_admin());
create policy "상품 관리자 등록" on public.products for insert with check (public.is_admin());
create policy "상품 관리자 수정" on public.products for update
  using (public.is_admin()) with check (public.is_admin());
create policy "상품 관리자 삭제" on public.products for delete using (public.is_admin());

create policy "본인 프로필 조회" on public.profiles for select
  using (id = auth.uid() or public.is_admin());
-- role 변경은 막고 이름/연락처/주소만 수정 가능
create policy "본인 프로필 수정" on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid());
revoke update on public.profiles from authenticated;
grant update (name, phone, address) on public.profiles to authenticated;

create policy "본인 주문 조회" on public.orders for select
  using (user_id = auth.uid() or public.is_admin());
create policy "관리자 주문 수정" on public.orders for update
  using (public.is_admin()) with check (public.is_admin());

create policy "본인 주문상품 조회" on public.order_items for select
  using (exists (
    select 1 from public.orders o
    where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())
  ));

-- ───────── 상품 이미지 스토리지 ─────────
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "상품 이미지 공개 조회" on storage.objects for select
  using (bucket_id = 'product-images');
create policy "상품 이미지 관리자 업로드" on storage.objects for insert
  with check (bucket_id = 'product-images' and public.is_admin());
create policy "상품 이미지 관리자 삭제" on storage.objects for delete
  using (bucket_id = 'product-images' and public.is_admin());

-- ───────── 카테고리 ─────────
insert into public.categories (slug, name, sort, image_url) values
  ('boards',  '보드', 1, '/images/categories/boards.jpg'),
  ('sensors', '센서', 2, '/images/categories/sensors.jpg'),
  ('modules', '모듈', 3, '/images/categories/modules.jpg'),
  ('parts',   '부품', 4, '/images/categories/parts.jpg'),
  ('kits',    '키트', 5, '/images/categories/kits.jpg');
