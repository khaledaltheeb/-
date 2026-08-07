create or replace function private.admin_upsert_tag(p_id uuid default null,p_slug text default null,p_name_ar text default null,p_description text default null,p_is_active boolean default true)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_id uuid;begin
 if (select auth.uid()) is null or not private.is_admin() then raise exception 'admin required'; end if;
 if p_slug is null or p_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' then raise exception 'invalid slug'; end if;
 if nullif(pg_catalog.btrim(coalesce(p_name_ar,'')),'') is null then raise exception 'name required'; end if;
 if p_id is null then insert into public.tags(slug,name_ar,description,is_active) values(p_slug,pg_catalog.btrim(p_name_ar),nullif(pg_catalog.btrim(coalesce(p_description,'')),''),p_is_active) returning id into v_id;
 else update public.tags set slug=p_slug,name_ar=pg_catalog.btrim(p_name_ar),description=nullif(pg_catalog.btrim(coalesce(p_description,'')),''),is_active=p_is_active where id=p_id returning id into v_id; if v_id is null then raise exception 'tag not found'; end if; end if;
 return v_id;end;$$;
create or replace function public.admin_upsert_tag(p_id uuid default null,p_slug text default null,p_name_ar text default null,p_description text default null,p_is_active boolean default true) returns uuid language sql security invoker set search_path='' as $$select private.admin_upsert_tag(p_id,p_slug,p_name_ar,p_description,p_is_active);$$;
revoke all on function public.admin_upsert_tag(uuid,text,text,text,boolean) from public,anon;grant execute on function public.admin_upsert_tag(uuid,text,text,text,boolean) to authenticated,service_role;

create or replace function private.admin_delete_tag_safe(p_id uuid) returns boolean language plpgsql security definer set search_path='' as $$begin
 if (select auth.uid()) is null or not private.is_admin() then raise exception 'admin required'; end if;
 if exists(select 1 from public.content_tags where tag_id=p_id) then raise exception 'tag is in use'; end if;
 delete from public.tags where id=p_id; return found;end;$$;
create or replace function public.admin_delete_tag_safe(p_id uuid) returns boolean language sql security invoker set search_path='' as $$select private.admin_delete_tag_safe(p_id);$$;
revoke all on function public.admin_delete_tag_safe(uuid) from public,anon;grant execute on function public.admin_delete_tag_safe(uuid) to authenticated,service_role;

create or replace function private.set_content_relations(p_content_id uuid,p_category_ids uuid[] default '{}'::uuid[],p_tag_ids uuid[] default '{}'::uuid[])
returns uuid language plpgsql security definer set search_path='' as $$
declare v_role public.app_role;v_author uuid;v_status public.content_status;v_sector uuid;v_primary uuid;begin
 if (select auth.uid()) is null then raise exception 'authentication required'; end if;
 v_role:=private.current_role(); select author_id,status,sector_id,category_id into v_author,v_status,v_sector,v_primary from public.content where id=p_content_id for update;
 if v_status is null then raise exception 'content not found'; end if;
 if v_role in ('owner','admin','editor') then null; elsif v_role='specialist' and v_author=(select auth.uid()) and v_status='draft' then null; else raise exception 'relation update denied'; end if;
 if exists(select 1 from unnest(coalesce(p_category_ids,'{}'::uuid[])) x(id) left join public.categories c on c.id=x.id where c.id is null or (v_sector is not null and c.sector_id is distinct from v_sector)) then raise exception 'category does not belong to content sector'; end if;
 if exists(select 1 from unnest(coalesce(p_tag_ids,'{}'::uuid[])) x(id) left join public.tags t on t.id=x.id where t.id is null or t.is_active is distinct from true) then raise exception 'invalid tag'; end if;
 delete from public.content_categories where content_id=p_content_id;
 if v_primary is not null then insert into public.content_categories(content_id,category_id,is_primary) values(p_content_id,v_primary,true) on conflict(content_id,category_id) do update set is_primary=true; end if;
 insert into public.content_categories(content_id,category_id,is_primary) select p_content_id,id,false from unnest(coalesce(p_category_ids,'{}'::uuid[])) id where id is distinct from v_primary on conflict(content_id,category_id) do nothing;
 delete from public.content_tags where content_id=p_content_id;
 insert into public.content_tags(content_id,tag_id) select p_content_id,id from unnest(coalesce(p_tag_ids,'{}'::uuid[])) id on conflict(content_id,tag_id) do nothing;
 insert into public.audit_logs(actor_id,entity_type,entity_id,action,after_data) values((select auth.uid()),'content',p_content_id::text,'taxonomy_relations_updated',jsonb_build_object('categories',coalesce(p_category_ids,'{}'::uuid[]),'tags',coalesce(p_tag_ids,'{}'::uuid[])));
 return p_content_id;end;$$;
create or replace function public.set_content_relations(p_content_id uuid,p_category_ids uuid[] default '{}'::uuid[],p_tag_ids uuid[] default '{}'::uuid[]) returns uuid language sql security invoker set search_path='' as $$select private.set_content_relations(p_content_id,p_category_ids,p_tag_ids);$$;
revoke all on function public.set_content_relations(uuid,uuid[],uuid[]) from public,anon;grant execute on function public.set_content_relations(uuid,uuid[],uuid[]) to authenticated,service_role;
