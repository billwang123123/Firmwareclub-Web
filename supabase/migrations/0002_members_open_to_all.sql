-- =============================================================================
-- 成员管理开放给所有登录用户
-- 规则：所有人可添加；仅创建者本人或管理员可编辑/删除
-- =============================================================================

-- 1. 加 created_by 字段（记录是谁添加的）
alter table public.members
  add column if not exists created_by uuid references public.profiles(id) on delete set null;

create index if not exists members_created_by_idx on public.members(created_by);

-- 2. 重写 RLS 策略
drop policy if exists "members_admin_write" on public.members;
drop policy if exists "members_select_all" on public.members;
drop policy if exists "members_insert_authenticated" on public.members;
drop policy if exists "members_update_own_or_admin" on public.members;
drop policy if exists "members_delete_own_or_admin" on public.members;

-- 所有人可读
create policy "members_select_all" on public.members
  for select using (true);

-- 登录用户可添加，且 created_by 必须是自己
create policy "members_insert_authenticated" on public.members
  for insert with check (auth.uid() = created_by);

-- 创建者本人或管理员可改
create policy "members_update_own_or_admin" on public.members
  for update using (
    auth.uid() = created_by
    or exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- 创建者本人或管理员可删
create policy "members_delete_own_or_admin" on public.members
  for delete using (
    auth.uid() = created_by
    or exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- 3. 给已有的示例成员补上 created_by（归给第一个管理员）
update public.members
set created_by = (
  select id from public.profiles where is_admin = true order by created_at asc limit 1
)
where created_by is null;
