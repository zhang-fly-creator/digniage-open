-- Zhilao v2.7 lightweight elder store and contact support.
-- Internal only. Not intended for public display or AI prompt input.

alter table public.elders
add column if not exists store_name text;

alter table public.elders
add column if not exists contact_note text;

alter table public.elders
add column if not exists other_contact_info text;
