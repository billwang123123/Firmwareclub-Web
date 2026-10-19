-- =============================================================================
-- Embedded Club Website — Initial Schema
-- Run in Supabase SQL Editor (Database -> SQL Editor -> New query)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- profiles: 1:1 with auth.users
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text unique not null,
  avatar_url  text,
  github_url  text,
  is_admin    boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all"
  on public.profiles for select
  using (true);

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self"
  on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and is_admin = (select is_admin from public.profiles where id = auth.uid())
  );

-- Only service role can insert profiles (handled by trigger below) or set is_admin
drop policy if exists "profiles_insert_service" on public.profiles;
create policy "profiles_insert_service"
  on public.profiles for insert
  with check (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- Trigger: auto-create profile on signup
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_username text;
  candidate text;
  counter int := 0;
begin
  base_username := coalesce(
    new.raw_user_meta_data->>'username',
    split_part(new.email, '@', 1)
  );
  candidate := base_username;
  while exists (select 1 from public.profiles where username = candidate) loop
    counter := counter + 1;
    candidate := base_username || counter::text;
  end loop;

  insert into public.profiles (id, username, avatar_url, github_url)
  values (
    new.id,
    candidate,
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'github_url'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- blog_posts
-- -----------------------------------------------------------------------------
create table if not exists public.blog_posts (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  title        text not null,
  excerpt      text not null,
  cover_url    text,
  body_md      text not null,
  author_id    uuid not null references public.profiles(id),
  published_at timestamptz not null default now()
);

create index if not exists blog_posts_published_at_idx
  on public.blog_posts (published_at desc);

alter table public.blog_posts enable row level security;

drop policy if exists "blog_posts_select_all" on public.blog_posts;
create policy "blog_posts_select_all"
  on public.blog_posts for select using (true);

drop policy if exists "blog_posts_admin_write" on public.blog_posts;
create policy "blog_posts_admin_write"
  on public.blog_posts for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  )
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- -----------------------------------------------------------------------------
-- members
-- -----------------------------------------------------------------------------
create table if not exists public.members (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  avatar_url text,
  grade      text,
  major      text,
  tags       text[] not null default '{}',
  bio        text,
  github_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists members_sort_idx
  on public.members (sort_order, created_at);

alter table public.members enable row level security;

drop policy if exists "members_select_all" on public.members;
create policy "members_select_all"
  on public.members for select using (true);

drop policy if exists "members_admin_write" on public.members;
create policy "members_admin_write"
  on public.members for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  )
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- -----------------------------------------------------------------------------
-- posts (forum threads)
-- -----------------------------------------------------------------------------
create table if not exists public.posts (
  id          uuid primary key default gen_random_uuid(),
  author_id   uuid not null references public.profiles(id),
  title       text not null,
  body_md     text not null,
  tag         text not null,
  cover_url   text,
  like_count  int not null default 0,
  reply_count int not null default 0,
  created_at  timestamptz not null default now(),
  constraint posts_tag_check check (
    tag in ('STM32','Arduino','ESP32','嵌入式Linux','RTOS','工具链','杂谈')
  )
);

create index if not exists posts_created_at_idx
  on public.posts (created_at desc);

create index if not exists posts_tag_created_at_idx
  on public.posts (tag, created_at desc);

alter table public.posts enable row level security;

drop policy if exists "posts_select_all" on public.posts;
create policy "posts_select_all"
  on public.posts for select using (true);

drop policy if exists "posts_insert_authenticated" on public.posts;
create policy "posts_insert_authenticated"
  on public.posts for insert
  with check (auth.uid() = author_id);

drop policy if exists "posts_update_author_or_admin" on public.posts;
create policy "posts_update_author_or_admin"
  on public.posts for update
  using (
    auth.uid() = author_id
    or exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

drop policy if exists "posts_delete_author_or_admin" on public.posts;
create policy "posts_delete_author_or_admin"
  on public.posts for delete
  using (
    auth.uid() = author_id
    or exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- -----------------------------------------------------------------------------
-- replies
-- -----------------------------------------------------------------------------
create table if not exists public.replies (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.posts(id) on delete cascade,
  parent_id  uuid references public.replies(id) on delete cascade,
  author_id  uuid not null references public.profiles(id),
  body_md    text not null,
  like_count int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists replies_post_id_idx
  on public.replies (post_id, created_at);

alter table public.replies enable row level security;

drop policy if exists "replies_select_all" on public.replies;
create policy "replies_select_all"
  on public.replies for select using (true);

drop policy if exists "replies_insert_authenticated" on public.replies;
create policy "replies_insert_authenticated"
  on public.replies for insert
  with check (auth.uid() = author_id);

drop policy if exists "replies_update_author_or_admin" on public.replies;
create policy "replies_update_author_or_admin"
  on public.replies for update
  using (
    auth.uid() = author_id
    or exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

drop policy if exists "replies_delete_author_or_admin" on public.replies;
create policy "replies_delete_author_or_admin"
  on public.replies for delete
  using (
    auth.uid() = author_id
    or exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- Maintain reply_count on parent post
create or replace function public.bump_reply_count()
returns trigger
language plpgsql
as $$
begin
  if (tg_op = 'INSERT') then
    update public.posts set reply_count = reply_count + 1 where id = new.post_id;
  elsif (tg_op = 'DELETE') then
    update public.posts set reply_count = greatest(0, reply_count - 1) where id = old.post_id;
  end if;
  return null;
end;
$$;

drop trigger if exists replies_count_trigger on public.replies;
create trigger replies_count_trigger
  after insert or delete on public.replies
  for each row execute function public.bump_reply_count();

-- -----------------------------------------------------------------------------
-- likes
-- -----------------------------------------------------------------------------
create table if not exists public.likes (
  user_id     uuid not null references public.profiles(id) on delete cascade,
  target_id   uuid not null,
  target_type text not null check (target_type in ('post','reply')),
  created_at  timestamptz not null default now(),
  primary key (user_id, target_id, target_type)
);

alter table public.likes enable row level security;

drop policy if exists "likes_select_all" on public.likes;
create policy "likes_select_all"
  on public.likes for select using (true);

drop policy if exists "likes_insert_self" on public.likes;
create policy "likes_insert_self"
  on public.likes for insert
  with check (auth.uid() = user_id);

drop policy if exists "likes_delete_self" on public.likes;
create policy "likes_delete_self"
  on public.likes for delete
  using (auth.uid() = user_id);

-- Maintain like_count on posts / replies
create or replace function public.bump_like_count()
returns trigger
language plpgsql
as $$
begin
  if (tg_op = 'INSERT') then
    if new.target_type = 'post' then
      update public.posts set like_count = like_count + 1 where id = new.target_id;
    else
      update public.replies set like_count = like_count + 1 where id = new.target_id;
    end if;
  elsif (tg_op = 'DELETE') then
    if old.target_type = 'post' then
      update public.posts set like_count = greatest(0, like_count - 1) where id = old.target_id;
    else
      update public.replies set like_count = greatest(0, like_count - 1) where id = old.target_id;
    end if;
  end if;
  return null;
end;
$$;

drop trigger if exists likes_count_trigger on public.likes;
create trigger likes_count_trigger
  after insert or delete on public.likes
  for each row execute function public.bump_like_count();

-- -----------------------------------------------------------------------------
-- Realtime: enable for posts / replies / likes
-- -----------------------------------------------------------------------------
alter publication supabase_realtime add table public.posts;
alter publication supabase_realtime add table public.replies;
alter publication supabase_realtime add table public.likes;

-- -----------------------------------------------------------------------------
-- Storage: public-assets bucket
-- Run in Supabase Storage UI or via SQL:
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('public-assets', 'public-assets', true)
on conflict (id) do nothing;

-- Allow public read of public-assets bucket
drop policy if exists "public_assets_read" on storage.objects;
create policy "public_assets_read"
  on storage.objects for select
  using (bucket_id = 'public-assets');

-- Authenticated users can upload to a folder named after their own user id
drop policy if exists "public_assets_insert_self" on storage.objects;
create policy "public_assets_insert_self"
  on storage.objects for insert
  with check (
    bucket_id = 'public-assets'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Admins can upload anywhere in public-assets
drop policy if exists "public_assets_admin_insert" on storage.objects;
create policy "public_assets_admin_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'public-assets'
    and exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- Owners can update/delete their own files
drop policy if exists "public_assets_update_self" on storage.objects;
create policy "public_assets_update_self"
  on storage.objects for update
  using (
    bucket_id = 'public-assets'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "public_assets_delete_self" on storage.objects;
create policy "public_assets_delete_self"
  on storage.objects for delete
  using (
    bucket_id = 'public-assets'
    and (
      auth.uid()::text = (storage.foldername(name))[1]
      or exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
    )
  );
