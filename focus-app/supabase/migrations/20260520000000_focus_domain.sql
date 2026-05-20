-- FocusFlow domain tables: focus sessions, daily stats, achievements, user settings
-- Also extends profiles with focus-tracking columns.
-- Run with: supabase db reset  (local)
--           supabase db push   (remote)

-- ── Extend profiles with focus-tracking columns ──────────────────────────────

alter table public.profiles add column if not exists total_points integer not null default 0;
alter table public.profiles add column if not exists current_streak integer not null default 0;
alter table public.profiles add column if not exists longest_streak integer not null default 0;
alter table public.profiles add column if not exists lifetime_sessions integer not null default 0;
alter table public.profiles add column if not exists lifetime_focus_minutes integer not null default 0;

-- ── Focus sessions ───────────────────────────────────────────────────────────

create table if not exists public.focus_sessions (
    id              uuid primary key default gen_random_uuid(),
    user_id         uuid references auth.users(id) on delete cascade not null,
    mode            text not null check (mode in ('pomodoro', 'deep-work', 'custom')),
    duration_minutes integer not null,
    completed       boolean not null default false,
    points_earned   integer not null default 0,
    distractions    integer not null default 0,
    blocked_apps    text[] not null default '{}',
    started_at      timestamptz not null default now(),
    completed_at    timestamptz,
    created_at      timestamptz not null default now()
);

alter table public.focus_sessions enable row level security;

create policy "Users can view own focus sessions"
    on public.focus_sessions for select using (auth.uid() = user_id);

create policy "Users can insert own focus sessions"
    on public.focus_sessions for insert with check (auth.uid() = user_id);

create policy "Users can update own focus sessions"
    on public.focus_sessions for update using (auth.uid() = user_id);

create index if not exists idx_focus_sessions_user_id on public.focus_sessions(user_id);
create index if not exists idx_focus_sessions_started_at on public.focus_sessions(started_at);

-- ── Daily stats ──────────────────────────────────────────────────────────────

create table if not exists public.daily_stats (
    id                  uuid primary key default gen_random_uuid(),
    user_id             uuid references auth.users(id) on delete cascade not null,
    date                date not null,
    focus_minutes       integer not null default 0,
    sessions_completed  integer not null default 0,
    points_earned       integer not null default 0,
    screen_time_minutes integer not null default 0,
    created_at          timestamptz not null default now(),
    updated_at          timestamptz not null default now(),
    unique(user_id, date)
);

alter table public.daily_stats enable row level security;

create policy "Users can view own daily stats"
    on public.daily_stats for select using (auth.uid() = user_id);

create policy "Users can insert own daily stats"
    on public.daily_stats for insert with check (auth.uid() = user_id);

create policy "Users can update own daily stats"
    on public.daily_stats for update using (auth.uid() = user_id);

create index if not exists idx_daily_stats_user_date on public.daily_stats(user_id, date);

-- ── User achievements ────────────────────────────────────────────────────────

create table if not exists public.user_achievements (
    id              uuid primary key default gen_random_uuid(),
    user_id         uuid references auth.users(id) on delete cascade not null,
    achievement_id  text not null,
    unlocked_at     timestamptz not null default now(),
    unique(user_id, achievement_id)
);

alter table public.user_achievements enable row level security;

create policy "Users can view own achievements"
    on public.user_achievements for select using (auth.uid() = user_id);

create policy "Users can insert own achievements"
    on public.user_achievements for insert with check (auth.uid() = user_id);

create index if not exists idx_user_achievements_user_id on public.user_achievements(user_id);

-- ── User settings ────────────────────────────────────────────────────────────

create table if not exists public.user_settings (
    id                  uuid primary key default gen_random_uuid(),
    user_id             uuid references auth.users(id) on delete cascade not null,
    block_notifications boolean not null default true,
    strict_mode         boolean not null default false,
    daily_reminder      boolean not null default true,
    weekly_report       boolean not null default true,
    sound_enabled       boolean not null default true,
    haptics_enabled     boolean not null default true,
    reminder_hour       integer not null default 9,
    reminder_minute     integer not null default 0,
    created_at          timestamptz not null default now(),
    updated_at          timestamptz not null default now(),
    unique(user_id)
);

alter table public.user_settings enable row level security;

create policy "Users can view own settings"
    on public.user_settings for select using (auth.uid() = user_id);

create policy "Users can insert own settings"
    on public.user_settings for insert with check (auth.uid() = user_id);

create policy "Users can update own settings"
    on public.user_settings for update using (auth.uid() = user_id);

-- ── Auto-update updated_at triggers ──────────────────────────────────────────

create or replace trigger focus_sessions_updated_at
    before update on public.focus_sessions
    for each row execute function public.set_updated_at();

create or replace trigger daily_stats_updated_at
    before update on public.daily_stats
    for each row execute function public.set_updated_at();

create or replace trigger user_settings_updated_at
    before update on public.user_settings
    for each row execute function public.set_updated_at();

-- ── Update handle_new_user trigger to also create user_settings ──────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
    insert into public.profiles (id)
    values (new.id)
    on conflict (id) do nothing;

    insert into public.user_settings (user_id)
    values (new.id)
    on conflict (user_id) do nothing;

    return new;
end;
$$;
