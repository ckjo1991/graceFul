create extension if not exists pgcrypto;

alter table public.prayers
add column if not exists device_id text;

alter table public.reports
add column if not exists device_id text;

alter table public.prayer_reports
add column if not exists device_id text;

create table if not exists public.abuse_events (
  id bigint generated always as identity primary key,
  device_id text not null default 'unknown',
  entity_type text not null,
  reason text not null,
  spam_score integer,
  signals jsonb not null default '[]'::jsonb,
  preview text,
  created_at timestamptz not null default now()
);

create index if not exists abuse_events_created_at_idx
  on public.abuse_events (created_at desc);

create index if not exists abuse_events_device_id_idx
  on public.abuse_events (device_id);

create index if not exists abuse_events_reason_idx
  on public.abuse_events (reason);

create or replace function public.graceful_normalize_text(p_text text)
returns text
language sql
immutable
as $$
  select trim(
    regexp_replace(
      lower(coalesce(p_text, '')),
      '[^a-z0-9]+',
      ' ',
      'g'
    )
  );
$$;

create or replace function public.graceful_spam_assessment(p_text text)
returns jsonb
language plpgsql
as $$
declare
  v_text text := coalesce(p_text, '');
  v_lower text := lower(v_text);
  v_signals text[] := '{}';
  v_score integer := 0;
  v_has_promo boolean := false;
  v_has_solicitation boolean := false;
  v_has_recruitment boolean := false;
  v_has_chain boolean := false;
  v_has_affiliate boolean := false;
  v_has_repeat boolean := false;
  v_punctuation_count integer := 0;
  v_uppercase_count integer := 0;
  v_alpha_count integer := 0;
begin
  if v_text ~* '(https?://|www\.|t\.me/|wa\.me/|(^|\s)@[a-z0-9_]{2,})' then
    v_score := v_score + 4;
    v_signals := array_append(v_signals, 'url_or_handle');
  end if;

  v_has_promo := (
    v_lower like '%buy now%' or
    v_lower like '%pm me%' or
    v_lower like '%guaranteed%' or
    v_lower like '%investment%' or
    v_lower like '%crypto%' or
    v_lower like '%forex%' or
    v_lower like '%casino%' or
    v_lower like '%loan%' or
    v_lower like '%sign up%' or
    v_lower like '%earn money%' or
    v_lower like '%passive income%' or
    v_lower like '%coaching program%' or
    v_lower like '%make money from home%' or
    v_lower like '%deliverance sessions%' or
    v_lower like '%deliverance session%' or
    v_lower like '%online coaching program%'
  );

  if v_has_promo then
    v_score := v_score + 2;
    v_signals := array_append(v_signals, 'promo_keywords');
  end if;

  v_has_solicitation := (
    v_text ~* '\bdonate\b' or
    v_text ~* '\braising funds?\b' or
    v_text ~* '\bpaypal\b' or
    v_text ~* '\bgcash\b' or
    v_lower like '%any amount helps%' or
    v_lower like '%send support%'
  );

  if v_has_solicitation then
    v_score := v_score + 4;
    v_signals := array_append(v_signals, 'solicitation_keywords');
  end if;

  v_has_recruitment := (
    v_text ~* '\bjoin\b.{0,30}\b(facebook|discord|telegram|group|circle)\b' or
    v_lower like '%facebook group%' or
    v_lower like '%church discord%' or
    v_lower like '%prayer circle%' or
    v_text ~* '\bsearch\b.{0,40}\b(prayer circle|group)\b'
  );

  if v_has_recruitment then
    v_score := v_score + 4;
    v_signals := array_append(v_signals, 'recruitment_keywords');
  end if;

  v_has_chain := (
    v_lower like '%share this with five people%' or
    v_lower like '%type amen%' or
    v_lower like '%pass this message along%' or
    v_lower like '%watch what happens%'
  );

  if v_has_chain then
    v_score := v_score + 4;
    v_signals := array_append(v_signals, 'chain_message');
  end if;

  v_has_affiliate := (
    v_lower like '%this program helped me earn money online%' or
    v_lower like '%earn money online%' or
    v_lower like '%highly recommended%'
  );

  if v_has_affiliate then
    v_score := v_score + 2;
    v_signals := array_append(v_signals, 'affiliate_style');
  end if;

  select exists(
    select 1
    from (
      select token, count(*) as token_count
      from unnest(regexp_split_to_array(public.graceful_normalize_text(v_text), '\s+')) as token
      where length(token) > 1
      group by token
      having count(*) >= 4
    ) repeated
  )
  into v_has_repeat;

  if v_has_repeat then
    v_score := v_score + 2;
    v_signals := array_append(v_signals, 'repeated_token_burst');
  end if;

  v_punctuation_count := char_length(regexp_replace(v_text, '[^!?]', '', 'g'));
  if v_punctuation_count >= 6 then
    v_score := v_score + 1;
    v_signals := array_append(v_signals, 'excess_punctuation');
  end if;

  v_uppercase_count := char_length(regexp_replace(v_text, '[^A-Z]', '', 'g'));
  v_alpha_count := char_length(regexp_replace(v_text, '[^A-Za-z]', '', 'g'));
  if char_length(v_text) >= 30 and v_alpha_count > 0 and (v_uppercase_count::numeric / v_alpha_count::numeric) >= 0.6 then
    v_score := v_score + 1;
    v_signals := array_append(v_signals, 'high_caps_ratio');
  end if;

  return jsonb_build_object(
    'score', v_score,
    'signals', to_jsonb(v_signals),
    'should_block', v_score >= 4,
    'should_flag', v_score between 2 and 3
  );
end;
$$;

create or replace function public.graceful_insert_post_guarded(
  p_id text,
  p_emotion text,
  p_category text,
  p_message text,
  p_support text,
  p_device_id text,
  p_wants_follow_up boolean,
  p_hearts integer,
  p_allow_translation boolean
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_device_id text := coalesce(nullif(trim(p_device_id), ''), 'unknown');
  v_normalized_message text := public.graceful_normalize_text(p_message);
  v_ten_min_count integer := 0;
  v_twenty_four_hour_count integer := 0;
  v_has_duplicate boolean := false;
  v_spam jsonb := public.graceful_spam_assessment(p_message);
  v_spam_score integer := coalesce((v_spam->>'score')::integer, 0);
  v_should_block boolean := coalesce((v_spam->>'should_block')::boolean, false);
  v_should_flag boolean := coalesce((v_spam->>'should_flag')::boolean, false);
begin
  select count(*)
    into v_ten_min_count
  from public.posts
  where coalesce(device_id, 'unknown') = v_device_id
    and created_at >= now() - interval '10 minutes';

  select count(*)
    into v_twenty_four_hour_count
  from public.posts
  where coalesce(device_id, 'unknown') = v_device_id
    and created_at >= now() - interval '24 hours';

  if v_ten_min_count >= 3 or v_twenty_four_hour_count >= 12 then
    insert into public.abuse_events (device_id, entity_type, reason, preview)
    values (v_device_id, 'post', 'rate_limited', left(coalesce(p_message, ''), 240));
    return jsonb_build_object('ok', false, 'reason', 'rate_limited');
  end if;

  select exists(
    select 1
    from public.posts
    where coalesce(device_id, 'unknown') = v_device_id
      and public.graceful_normalize_text(message) = v_normalized_message
      and created_at >= now() - interval '24 hours'
  )
  into v_has_duplicate;

  if v_has_duplicate then
    insert into public.abuse_events (device_id, entity_type, reason, preview)
    values (v_device_id, 'post', 'duplicate', left(coalesce(p_message, ''), 240));
    return jsonb_build_object('ok', false, 'reason', 'duplicate');
  end if;

  if v_should_block then
    insert into public.abuse_events (device_id, entity_type, reason, spam_score, signals, preview)
    values (
      v_device_id,
      'post',
      'spam_blocked',
      v_spam_score,
      coalesce(v_spam->'signals', '[]'::jsonb),
      left(coalesce(p_message, ''), 240)
    );
    return jsonb_build_object(
      'ok', false,
      'reason', 'spam_blocked',
      'spam_score', v_spam_score,
      'signals', coalesce(v_spam->'signals', '[]'::jsonb)
    );
  end if;

  if v_should_flag then
    insert into public.abuse_events (device_id, entity_type, reason, spam_score, signals, preview)
    values (
      v_device_id,
      'post',
      'spam_flagged',
      v_spam_score,
      coalesce(v_spam->'signals', '[]'::jsonb),
      left(coalesce(p_message, ''), 240)
    );
  end if;

  insert into public.posts (
    id,
    emotion,
    category,
    message,
    support,
    created_at,
    device_id,
    wants_follow_up,
    hearts,
    allow_translation
  )
  values (
    p_id,
    p_emotion,
    p_category,
    p_message,
    p_support,
    now(),
    v_device_id,
    coalesce(p_wants_follow_up, false),
    coalesce(p_hearts, 0),
    coalesce(p_allow_translation, true)
  );

  return jsonb_build_object(
    'ok', true,
    'spam_score', v_spam_score,
    'signals', coalesce(v_spam->'signals', '[]'::jsonb),
    'flagged', v_should_flag
  );
end;
$$;

create or replace function public.graceful_insert_prayer_guarded(
  p_id text,
  p_post_id text,
  p_message text,
  p_device_id text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_device_id text := coalesce(nullif(trim(p_device_id), ''), 'unknown');
  v_normalized_message text := public.graceful_normalize_text(p_message);
  v_ten_min_count integer := 0;
  v_twenty_four_hour_count integer := 0;
  v_has_duplicate boolean := false;
  v_spam jsonb := public.graceful_spam_assessment(p_message);
  v_spam_score integer := coalesce((v_spam->>'score')::integer, 0);
  v_should_block boolean := coalesce((v_spam->>'should_block')::boolean, false);
  v_should_flag boolean := coalesce((v_spam->>'should_flag')::boolean, false);
begin
  select count(*)
    into v_ten_min_count
  from public.prayers
  where coalesce(device_id, 'unknown') = v_device_id
    and created_at >= now() - interval '10 minutes';

  select count(*)
    into v_twenty_four_hour_count
  from public.prayers
  where coalesce(device_id, 'unknown') = v_device_id
    and created_at >= now() - interval '24 hours';

  if v_ten_min_count >= 10 or v_twenty_four_hour_count >= 40 then
    insert into public.abuse_events (device_id, entity_type, reason, preview)
    values (v_device_id, 'prayer', 'rate_limited', left(coalesce(p_message, ''), 240));
    return jsonb_build_object('ok', false, 'reason', 'rate_limited');
  end if;

  select exists(
    select 1
    from public.prayers
    where coalesce(device_id, 'unknown') = v_device_id
      and public.graceful_normalize_text(message) = v_normalized_message
      and created_at >= now() - interval '24 hours'
  )
  into v_has_duplicate;

  if v_has_duplicate then
    insert into public.abuse_events (device_id, entity_type, reason, preview)
    values (v_device_id, 'prayer', 'duplicate', left(coalesce(p_message, ''), 240));
    return jsonb_build_object('ok', false, 'reason', 'duplicate');
  end if;

  if v_should_block then
    insert into public.abuse_events (device_id, entity_type, reason, spam_score, signals, preview)
    values (
      v_device_id,
      'prayer',
      'spam_blocked',
      v_spam_score,
      coalesce(v_spam->'signals', '[]'::jsonb),
      left(coalesce(p_message, ''), 240)
    );
    return jsonb_build_object(
      'ok', false,
      'reason', 'spam_blocked',
      'spam_score', v_spam_score,
      'signals', coalesce(v_spam->'signals', '[]'::jsonb)
    );
  end if;

  if v_should_flag then
    insert into public.abuse_events (device_id, entity_type, reason, spam_score, signals, preview)
    values (
      v_device_id,
      'prayer',
      'spam_flagged',
      v_spam_score,
      coalesce(v_spam->'signals', '[]'::jsonb),
      left(coalesce(p_message, ''), 240)
    );
  end if;

  insert into public.prayers (id, post_id, message, created_at, device_id)
  values (p_id, p_post_id, p_message, now(), v_device_id);

  return jsonb_build_object(
    'ok', true,
    'spam_score', v_spam_score,
    'signals', coalesce(v_spam->'signals', '[]'::jsonb),
    'flagged', v_should_flag
  );
end;
$$;

create or replace function public.graceful_insert_report_guarded(
  p_post_id text,
  p_reason text,
  p_device_id text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_device_id text := coalesce(nullif(trim(p_device_id), ''), 'unknown');
  v_count integer := 0;
begin
  select count(*)
    into v_count
  from public.reports
  where coalesce(device_id, 'unknown') = v_device_id
    and created_at >= now() - interval '1 hour';

  if v_count >= 20 then
    insert into public.abuse_events (device_id, entity_type, reason)
    values (v_device_id, 'report', 'rate_limited');
    return jsonb_build_object('ok', false, 'reason', 'rate_limited');
  end if;

  insert into public.reports (id, post_id, reason, created_at, device_id)
  values (gen_random_uuid(), p_post_id, p_reason, now(), v_device_id);

  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.graceful_insert_prayer_report_guarded(
  p_prayer_id text,
  p_post_id text,
  p_reason text,
  p_device_id text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_device_id text := coalesce(nullif(trim(p_device_id), ''), 'unknown');
  v_count integer := 0;
begin
  select count(*)
    into v_count
  from public.prayer_reports
  where coalesce(device_id, 'unknown') = v_device_id
    and created_at >= now() - interval '1 hour';

  if v_count >= 20 then
    insert into public.abuse_events (device_id, entity_type, reason)
    values (v_device_id, 'prayer_report', 'rate_limited');
    return jsonb_build_object('ok', false, 'reason', 'rate_limited');
  end if;

  insert into public.prayer_reports (id, prayer_id, post_id, reason, created_at, device_id)
  values (gen_random_uuid(), p_prayer_id, p_post_id, p_reason, now(), v_device_id);

  return jsonb_build_object('ok', true);
end;
$$;

grant execute on function public.graceful_insert_post_guarded(
  text,
  text,
  text,
  text,
  text,
  text,
  boolean,
  integer,
  boolean
) to anon, authenticated;

grant execute on function public.graceful_insert_prayer_guarded(
  text,
  text,
  text,
  text
) to anon, authenticated;

grant execute on function public.graceful_insert_report_guarded(
  text,
  text,
  text
) to anon, authenticated;

grant execute on function public.graceful_insert_prayer_report_guarded(
  text,
  text,
  text,
  text
) to anon, authenticated;
