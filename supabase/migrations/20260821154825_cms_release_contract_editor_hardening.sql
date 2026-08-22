create or replace function private.set_content_seo_authority(
  p_id uuid,
  p_primary_keyword text default null::text,
  p_secondary_keywords text[] default '{}'::text[],
  p_semantic_terms text[] default '{}'::text[],
  p_search_intent text default null::text,
  p_author_display_name text default null::text,
  p_reviewer_display_name text default null::text,
  p_reviewer_credentials text default null::text,
  p_last_reviewed_at timestamptz default null::timestamptz,
  p_references jsonb default '[]'::jsonb,
  p_medical_disclaimer text default null::text,
  p_featured_image_alt text default null::text
)
returns uuid
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_status public.content_status;
  v_version integer;
  v_snapshot jsonb;
begin
  if not private.is_content_staff() then raise exception 'content staff required'; end if;
  if p_search_intent is not null and p_search_intent not in ('informational','transactional','navigational','commercial','local') then raise exception 'invalid search intent'; end if;
  if jsonb_typeof(coalesce(p_references,'[]'::jsonb)) <> 'array' then raise exception 'references must be array'; end if;
  if nullif(trim(coalesce(p_medical_disclaimer,'')),'') is not null then
    raise exception 'medical disclaimer is centralized and cannot be stored per page';
  end if;

  select status into v_status from public.content where id=p_id for update;
  if v_status is null then raise exception 'content not found'; end if;
  if v_status in ('published'::public.content_status,'scheduled'::public.content_status) then
    raise exception 'live or scheduled content authority data must be changed through an editable version workflow';
  end if;

  update public.content set
    primary_keyword=nullif(trim(p_primary_keyword),''),
    secondary_keywords=coalesce(p_secondary_keywords,'{}'),
    semantic_terms=coalesce(p_semantic_terms,'{}'),
    search_intent=nullif(trim(p_search_intent),''),
    author_display_name=nullif(trim(p_author_display_name),''),
    reviewer_display_name=nullif(trim(p_reviewer_display_name),''),
    reviewer_credentials=nullif(trim(p_reviewer_credentials),''),
    last_reviewed_at=p_last_reviewed_at,
    references_json=coalesce(p_references,'[]'::jsonb),
    medical_disclaimer=null,
    featured_image_alt=nullif(trim(p_featured_image_alt),'')
  where id=p_id;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(p_id::text));
  select coalesce(max(version),0)+1 into v_version from public.content_versions where content_id=p_id;
  select to_jsonb(c) into v_snapshot from public.content c where c.id=p_id;
  insert into public.content_versions(content_id,version,snapshot,created_by)
  values(p_id,v_version,v_snapshot,(select auth.uid()));

  insert into public.audit_logs(actor_id,entity_type,entity_id,action,after_data)
  values((select auth.uid()),'content',p_id::text,'content_seo_authority_update',
    jsonb_build_object('primary_keyword',p_primary_keyword,'search_intent',p_search_intent,
      'references_count',jsonb_array_length(coalesce(p_references,'[]'::jsonb)),'version',v_version,
      'disclaimer_policy','central'));
  return p_id;
end;
$function$;

create or replace function private.set_content_release_contract_v6(p_id uuid, p_contract jsonb)
returns uuid
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_status public.content_status;
  v_existing jsonb;
  v_schema jsonb;
  v_questions jsonb := '[]'::jsonb;
  v_claims jsonb := '[]'::jsonb;
  v_versions jsonb := '[]'::jsonb;
  v_page_mechanism jsonb := '{}'::jsonb;
  v_originality jsonb := '{}'::jsonb;
  v_interactive_quality jsonb := '{}'::jsonb;
  v_confidence numeric := 0;
  v_version integer;
  v_snapshot jsonb;
  v_page_kind text;
  v_strategic_value text;
  v_rewrite_method text;
begin
  if not private.is_content_staff() then raise exception 'content staff required'; end if;
  if jsonb_typeof(coalesce(p_contract,'{}'::jsonb)) <> 'object' then raise exception 'release contract must be an object'; end if;

  select status,coalesce(schema_json,'{}'::jsonb)
  into v_status,v_existing
  from public.content
  where id=p_id
  for update;
  if v_status is null then raise exception 'content not found'; end if;
  if v_status not in ('draft'::public.content_status,'scientific_review'::public.content_status,'editorial_review'::public.content_status,'seo_review'::public.content_status,'accessibility_review'::public.content_status) then
    raise exception 'release contract can only be edited in an editable review state';
  end if;

  if p_contract ? 'search_intent_questions' then
    if jsonb_typeof(p_contract->'search_intent_questions') <> 'array' then raise exception 'search_intent_questions must be an array'; end if;
    v_questions := p_contract->'search_intent_questions';
    if jsonb_array_length(v_questions) > 100 then raise exception 'too many search intent questions'; end if;
    if exists(select 1 from jsonb_array_elements(v_questions) e where jsonb_typeof(e)<>'string' or char_length(trim(e #>> '{}'))<3) then
      raise exception 'search intent questions must be non-empty strings';
    end if;
  end if;

  if p_contract ? 'claim_source_map' then
    if jsonb_typeof(p_contract->'claim_source_map') <> 'array' then raise exception 'claim_source_map must be an array'; end if;
    v_claims := p_contract->'claim_source_map';
    if jsonb_array_length(v_claims) > 200 then raise exception 'too many mapped claims'; end if;
    if exists(
      select 1 from jsonb_array_elements(v_claims) e
      where jsonb_typeof(e)<>'object'
        or nullif(trim(e->>'claim'),'') is null
        or jsonb_typeof(e->'sources')<>'array'
        or jsonb_array_length(e->'sources')<1
        or exists(select 1 from jsonb_array_elements(e->'sources') s where jsonb_typeof(s)<>'string' or char_length(trim(s #>> '{}'))<1)
    ) then raise exception 'each mapped claim requires text and at least one source reference'; end if;
  end if;

  if p_contract ? 'source_versions_reviewed' then
    if jsonb_typeof(p_contract->'source_versions_reviewed') <> 'array' then raise exception 'source_versions_reviewed must be an array'; end if;
    v_versions := p_contract->'source_versions_reviewed';
    if jsonb_array_length(v_versions) > 100 then raise exception 'too many source versions'; end if;
    if exists(select 1 from jsonb_array_elements(v_versions) e where jsonb_typeof(e)<>'string' or char_length(trim(e #>> '{}'))<1) then
      raise exception 'source versions must be non-empty strings';
    end if;
  end if;

  if p_contract ? 'page_mechanism' then
    if jsonb_typeof(p_contract->'page_mechanism') <> 'object' then raise exception 'page_mechanism must be an object'; end if;
    v_page_mechanism := jsonb_build_object(
      'purpose',left(trim(coalesce(p_contract#>>'{page_mechanism,purpose}','')),4000),
      'audience',left(trim(coalesce(p_contract#>>'{page_mechanism,audience}','')),4000),
      'interaction_model',left(trim(coalesce(p_contract#>>'{page_mechanism,interaction_model}','')),4000),
      'content_model',left(trim(coalesce(p_contract#>>'{page_mechanism,content_model}','')),4000)
    );
  end if;

  if p_contract ? 'originality_report' then
    if jsonb_typeof(p_contract->'originality_report') <> 'object' then raise exception 'originality_report must be an object'; end if;
    v_originality := jsonb_build_object(
      'passed',(p_contract#>>'{originality_report,passed}')='true',
      'notes',left(trim(coalesce(p_contract#>>'{originality_report,notes}','')),4000)
    );
  end if;

  if p_contract ? 'interactive_quality' then
    if jsonb_typeof(p_contract->'interactive_quality') <> 'object' then raise exception 'interactive_quality must be an object'; end if;
    if coalesce(p_contract#>>'{interactive_quality,privacy_mode}','') not in ('','local-only','anonymous-no-storage') then raise exception 'invalid interactive privacy mode'; end if;
    if coalesce(p_contract#>>'{interactive_quality,generated_trials}','') !~ '^[0-9]*$'
      or coalesce(p_contract#>>'{interactive_quality,accepted_correct_answers}','') !~ '^[0-9]*$'
      or coalesce(p_contract#>>'{interactive_quality,rejected_wrong_answers}','') !~ '^[0-9]*$'
      or coalesce(p_contract#>>'{interactive_quality,error_count}','') !~ '^[0-9]*$' then
      raise exception 'interactive quality counters must be non-negative integers';
    end if;
    v_interactive_quality := jsonb_build_object(
      'engine_tested',(p_contract#>>'{interactive_quality,engine_tested}')='true',
      'generated_trials',coalesce(nullif(p_contract#>>'{interactive_quality,generated_trials}','')::integer,0),
      'accepted_correct_answers',coalesce(nullif(p_contract#>>'{interactive_quality,accepted_correct_answers}','')::integer,0),
      'rejected_wrong_answers',coalesce(nullif(p_contract#>>'{interactive_quality,rejected_wrong_answers}','')::integer,0),
      'error_count',coalesce(nullif(p_contract#>>'{interactive_quality,error_count}','')::integer,0),
      'privacy_mode',nullif(p_contract#>>'{interactive_quality,privacy_mode}','')
    );
  end if;

  if coalesce(p_contract->>'classification_confidence','') <> '' then
    if p_contract->>'classification_confidence' !~ '^(0([.][0-9]+)?|1([.]0+)?)$' then raise exception 'classification confidence must be between 0 and 1'; end if;
    v_confidence := (p_contract->>'classification_confidence')::numeric;
  end if;

  v_page_kind := case when p_contract->>'page_kind' in ('interactive','editorial') then p_contract->>'page_kind' else 'editorial' end;
  v_strategic_value := case when p_contract->>'strategic_scientific_value'='high' then 'high' else 'standard' end;
  v_rewrite_method := case when p_contract->>'rewrite_method'='evidence-led-rewrite' then 'evidence-led-rewrite' else null end;

  v_schema := v_existing
    - 'content_contract_version' - 'search_intent_questions' - 'claim_source_map' - 'source_versions_reviewed'
    - 'taxonomy_reviewed' - 'classification_confidence' - 'classification_rationale'
    - 'rewrite_method' - 'originality_report' - 'page_mechanism' - 'disclaimer_url' - 'disclaimer_label'
    - 'page_kind' - 'strategic_scientific_value' - 'uniqueness_rationale' - 'interactive_quality';

  v_schema := v_schema || jsonb_build_object(
    'content_contract_version',6,
    'search_intent_questions',v_questions,
    'claim_source_map',v_claims,
    'source_versions_reviewed',v_versions,
    'taxonomy_reviewed',(p_contract->>'taxonomy_reviewed')='true',
    'classification_confidence',v_confidence,
    'classification_rationale',left(trim(coalesce(p_contract->>'classification_rationale','')),8000),
    'rewrite_method',v_rewrite_method,
    'originality_report',v_originality,
    'page_mechanism',v_page_mechanism,
    'disclaimer_url','/disclaimer',
    'disclaimer_label','إخلاء المسؤولية والتنبيهات',
    'page_kind',v_page_kind,
    'strategic_scientific_value',v_strategic_value,
    'uniqueness_rationale',left(trim(coalesce(p_contract->>'uniqueness_rationale','')),8000),
    'interactive_quality',v_interactive_quality
  );

  update public.content set schema_json=v_schema, medical_disclaimer=null where id=p_id;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(p_id::text));
  select coalesce(max(version),0)+1 into v_version from public.content_versions where content_id=p_id;
  select to_jsonb(c) into v_snapshot from public.content c where c.id=p_id;
  insert into public.content_versions(content_id,version,snapshot,created_by)
  values(p_id,v_version,v_snapshot,(select auth.uid()));
  insert into public.audit_logs(actor_id,entity_type,entity_id,action,after_data)
  values((select auth.uid()),'content',p_id::text,'content_release_contract_v6_update',
    jsonb_build_object('version',v_version,'contract_version',6,'questions',jsonb_array_length(v_questions),'claims',jsonb_array_length(v_claims),'source_versions',jsonb_array_length(v_versions)));
  return p_id;
end;
$function$;

create or replace function public.set_content_release_contract_v6(p_id uuid,p_contract jsonb)
returns uuid
language sql
set search_path to ''
as $function$
  select private.set_content_release_contract_v6(p_id,p_contract);
$function$;

revoke all on function private.set_content_release_contract_v6(uuid,jsonb) from public;
revoke all on function public.set_content_release_contract_v6(uuid,jsonb) from public;
grant execute on function private.set_content_release_contract_v6(uuid,jsonb) to authenticated, service_role;
grant execute on function public.set_content_release_contract_v6(uuid,jsonb) to authenticated, service_role;

create or replace function private.admin_platform_integrity()
returns table(check_key text,severity text,issue_count bigint,summary text)
language plpgsql
stable security definer
set search_path to ''
as $function$
begin
  if not private.is_admin() then raise exception 'admin required'; end if;

  return query
  select 'conversation_participant_count','error',count(*)::bigint,'محادثات لا تحتوي طرفين بالضبط'
  from public.conversations c
  where (select count(*) from public.conversation_participants cp where cp.conversation_id=c.id)<>2;

  return query
  select 'message_sender_membership','error',count(*)::bigint,'رسائل مرسلها ليس عضوًا في المحادثة'
  from public.messages m
  where not exists(select 1 from public.conversation_participants cp where cp.conversation_id=m.conversation_id and cp.user_id=m.sender_id);

  return query
  select 'appointment_conversation_alignment','error',count(*)::bigint,'مواعيد لا تتطابق مع هدف أو طالب المحادثة المرتبطة'
  from public.appointments a
  left join public.conversations c on c.id=a.conversation_id
  where a.conversation_id is not null and (
    c.id is null
    or (a.specialist_id is distinct from c.specialist_id)
    or (a.center_id is distinct from c.center_id)
    or not exists(select 1 from public.conversation_participants cp where cp.conversation_id=a.conversation_id and cp.user_id=a.requester_id)
  );

  return query
  select 'verified_specialist_contact_readiness','warn',count(*)::bigint,'مختصون موثقون لا يملكون حسابًا فعّالًا لاستقبال الرسائل والمواعيد'
  from public.specialists s
  left join public.profiles p on p.id=s.user_id
  where s.is_active=true and s.verification='verified'::public.verification_status and (s.user_id is null or p.id is null or p.is_active is distinct from true);

  return query
  select 'verified_center_contact_readiness','warn',count(*)::bigint,'مراكز موثقة لا تملك مدير حساب فعّالًا لاستقبال الرسائل والمواعيد'
  from public.centers c
  left join public.profiles p on p.id=c.manager_user_id
  where c.is_active=true and c.verification='verified'::public.verification_status and (c.manager_user_id is null or p.id is null or p.is_active is distinct from true);

  return query
  select 'redirect_cycles','error',count(*)::bigint,'تحويلات نشطة تدخل في حلقة أو سلسلة غير آمنة'
  from public.redirects r
  where r.is_active=true and not private.validate_redirect_chain(r.source_path,r.destination_path,r.id);

  return query
  select 'sensitive_direct_grants','error',count(*)::bigint,'صلاحيات مباشرة غير مسموحة على الجداول الحساسة'
  from information_schema.role_table_grants g
  where g.table_schema='public'
    and g.grantee in ('anon','authenticated')
    and g.table_name in ('conversations','conversation_participants','messages','notifications','user_blocks','conversation_reports','appointments','audit_logs')
    and g.privilege_type in ('SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER');

  return query
  select 'published_content_meta_description','warn',count(*)::bigint,'صفحات منشورة بلا Meta Description تحريرية'
  from public.content c
  where c.status='published'::public.content_status and c.published_at is not null and c.published_at<=now() and nullif(trim(coalesce(c.seo_description,'')),'') is null;

  return query
  select 'published_content_author','warn',count(*)::bigint,'صفحات منشورة بلا اسم مؤلف ظاهر'
  from public.content c
  where c.status='published'::public.content_status and c.published_at is not null and c.published_at<=now() and nullif(trim(coalesce(c.author_display_name,'')),'') is null;

  return query
  select 'medical_content_disclaimer','warn',count(*)::bigint,'صفحات V6 الطبية المنشورة التي لا تطابق سياسة إخلاء المسؤولية المركزية'
  from public.content c
  where c.status='published'::public.content_status and c.published_at is not null and c.published_at<=now()
    and c.content_type in ('condition','protocol','intervention','assessment')
    and case when coalesce(c.schema_json->>'content_contract_version','') ~ '^[0-9]+$' then (c.schema_json->>'content_contract_version')::integer else 0 end >= 6
    and (
      nullif(trim(coalesce(c.medical_disclaimer,'')),'') is not null
      or c.schema_json->>'disclaimer_url' is distinct from '/disclaimer'
      or c.schema_json->>'disclaimer_label' is distinct from 'إخلاء المسؤولية والتنبيهات'
    );
end;
$function$;
