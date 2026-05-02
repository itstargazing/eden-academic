create extension if not exists pgcrypto;

create table if not exists user_profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  profile_data jsonb not null,
  created_at timestamptz default now()
);

create table if not exists syllabus_data (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  course_name text,
  weeks jsonb,
  major_assessments jsonb,
  created_at timestamptz default now()
);

create table if not exists thesis_drafts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  title text,
  topic text,
  outline jsonb,
  updated_at timestamptz default now()
);

create table if not exists research_profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  title text,
  abstract text,
  tags text[],
  university text,
  created_at timestamptz default now()
);

alter table user_profiles enable row level security;
alter table syllabus_data enable row level security;
alter table thesis_drafts enable row level security;
alter table research_profiles enable row level security;

drop policy if exists "Own data only" on user_profiles;
drop policy if exists "Own data only" on syllabus_data;
drop policy if exists "Own data only" on thesis_drafts;
drop policy if exists "Own data only" on research_profiles;

create policy "Own data only" on user_profiles for all using (auth.uid() = user_id);
create policy "Own data only" on syllabus_data for all using (auth.uid() = user_id);
create policy "Own data only" on thesis_drafts for all using (auth.uid() = user_id);
create policy "Own data only" on research_profiles for all using (auth.uid() = user_id);
