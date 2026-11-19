-- 临时发帖函数：用于批量插入示例帖子
-- 用法：select create_post('标题', '标签', '正文Markdown');
-- 跑完帖子后可以 drop function create_post(text,text,text); 删除

create or replace function public.create_post(
  p_title text,
  p_tag   text,
  p_body  text
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_author uuid;
  v_id uuid;
begin
  select id into v_author
  from public.profiles
  where is_admin = true
  order by created_at asc
  limit 1;

  if v_author is null then
    select id into v_author from public.profiles order by created_at asc limit 1;
  end if;

  insert into public.posts (author_id, title, body_md, tag)
  values (v_author, p_title, p_body, p_tag)
  returning id into v_id;

  return v_id;
end;
$$;
