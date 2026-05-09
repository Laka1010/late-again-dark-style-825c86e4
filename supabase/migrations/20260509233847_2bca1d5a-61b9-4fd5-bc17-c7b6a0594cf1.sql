
create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null,
  size text not null default 'M',
  quantity integer not null default 1 check (quantity > 0 and quantity <= 99),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product_id, size)
);

alter table public.cart_items enable row level security;

create policy "Users view own cart"
  on public.cart_items for select
  to authenticated using (auth.uid() = user_id);

create policy "Users insert own cart"
  on public.cart_items for insert
  to authenticated with check (auth.uid() = user_id);

create policy "Users update own cart"
  on public.cart_items for update
  to authenticated using (auth.uid() = user_id);

create policy "Users delete own cart"
  on public.cart_items for delete
  to authenticated using (auth.uid() = user_id);

create trigger cart_items_updated_at
  before update on public.cart_items
  for each row execute function public.touch_updated_at();

create index cart_items_user_id_idx on public.cart_items(user_id);
