create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  channel text check (channel in ('meli','amazon')) not null,
  marketplace text not null,
  margin_pct numeric not null,
  status text not null default 'queued',
  file_url text not null,
  created_at timestamptz default now(),
  finished_at timestamptz
);

create table if not exists items_input (
  id bigserial primary key,
  job_id uuid references jobs(id) on delete cascade,
  row_idx int not null,
  sku text,
  name text,
  cost numeric,
  ean text,
  upc text,
  asin text
);

create table if not exists sku_map (
  sku text primary key,
  asin text,
  ean text,
  upc text,
  brand text,
  model text,
  updated_at timestamptz default now()
);

create table if not exists items_output (
  id bigserial primary key,
  job_id uuid references jobs(id) on delete cascade,
  row_idx int not null,
  sku text,
  channel text,
  marketplace text,
  found_price numeric,
  currency text,
  url text,
  buybox boolean,
  lowest numeric,
  fee_estimate numeric,
  target_price numeric,
  margin_bruto_ok boolean,
  margin_neto_ok boolean,
  created_at timestamptz default now()
);

create table if not exists files (
  job_id uuid references jobs(id) on delete cascade,
  input_url text,
  output_url text
);
