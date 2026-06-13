alter table service_records
  add column if not exists duration_hours numeric default 0;

alter table service_records
  add column if not exists duration_status text default 'confirmed';

alter table service_records
  add column if not exists confirmed_by uuid null;

alter table service_records
  add column if not exists confirmed_at timestamptz null;
