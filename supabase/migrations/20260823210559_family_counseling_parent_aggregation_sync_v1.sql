create or replace function private.sync_content_primary_category_relation()
returns trigger
language plpgsql
set search_path to ''
as $function$
declare
  v_family_root uuid;
  v_is_family_descendant boolean := false;
begin
  delete from public.content_categories cc
  where cc.content_id=new.id
    and cc.is_primary=true
    and (new.category_id is null or cc.category_id is distinct from new.category_id);

  if new.category_id is not null then
    insert into public.content_categories(content_id,category_id,is_primary)
    values(new.id,new.category_id,true)
    on conflict(content_id,category_id) do update set is_primary=true;
  end if;

  select c.id into v_family_root
  from public.categories c
  where c.slug='family-counseling'
    and c.is_active=true
  limit 1;

  if v_family_root is not null then
    if new.category_id is not null and new.category_id <> v_family_root then
      with recursive ancestors as (
        select c.id,c.parent_id
        from public.categories c
        where c.id=new.category_id
        union all
        select p.id,p.parent_id
        from public.categories p
        join ancestors a on p.id=a.parent_id
      )
      select exists(select 1 from ancestors where id=v_family_root)
      into v_is_family_descendant;
    end if;

    if v_is_family_descendant then
      insert into public.content_categories(content_id,category_id,is_primary)
      values(new.id,v_family_root,false)
      on conflict(content_id,category_id) do update
      set is_primary=case when public.content_categories.is_primary then true else false end;
    elsif new.category_id is distinct from v_family_root then
      delete from public.content_categories cc
      where cc.content_id=new.id
        and cc.category_id=v_family_root
        and cc.is_primary=false;
    end if;
  end if;

  return new;
end;
$function$;

with family_root as (
  select id from public.categories where slug='family-counseling' and is_active=true limit 1
), descendants as (
  with recursive tree as (
    select c.id,c.parent_id
    from public.categories c
    where c.parent_id=(select id from family_root)
    union all
    select c.id,c.parent_id
    from public.categories c
    join tree t on c.parent_id=t.id
    where c.is_active=true
  )
  select id from tree
)
insert into public.content_categories(content_id,category_id,is_primary)
select distinct c.id,(select id from family_root),false
from public.content c
where c.category_id in (select id from descendants)
  and (select id from family_root) is not null
on conflict(content_id,category_id) do nothing;
