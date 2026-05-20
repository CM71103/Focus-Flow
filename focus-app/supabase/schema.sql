-- FocusFlow Supabase Database Schema

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    total_points INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    lifetime_sessions INTEGER DEFAULT 0,
    lifetime_focus_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Focus sessions table
CREATE TABLE IF NOT EXISTS public.focus_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    mode TEXT NOT NULL CHECK (mode IN ('pomodoro', 'deep-work', 'custom')),
    duration_minutes INTEGER NOT NULL,
    completed BOOLEAN DEFAULT false,
    points_earned INTEGER DEFAULT 0,
    distractions INTEGER DEFAULT 0,
    blocked_apps TEXT[] DEFAULT '{}',
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Achievements table
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    achievement_id TEXT NOT NULL,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- Daily stats table
CREATE TABLE IF NOT EXISTS public.daily_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    focus_minutes INTEGER DEFAULT 0,
    sessions_completed INTEGER DEFAULT 0,
    points_earned INTEGER DEFAULT 0,
    screen_time_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Settings table
CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    block_notifications BOOLEAN DEFAULT true,
    strict_mode BOOLEAN DEFAULT false,
    daily_reminder BOOLEAN DEFAULT true,
    weekly_report BOOLEAN DEFAULT true,
    sound_enabled BOOLEAN DEFAULT true,
    haptics_enabled BOOLEAN DEFAULT true,
    reminder_hour INTEGER DEFAULT 9,
    reminder_minute INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Focus sessions policies
CREATE POLICY "Users can view own sessions" ON public.focus_sessions
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON public.focus_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON public.focus_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- Achievements policies
CREATE POLICY "Users can view own achievements" ON public.user_achievements
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON public.user_achievements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Daily stats policies
CREATE POLICY "Users can view own daily stats" ON public.daily_stats
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own daily stats" ON public.daily_stats
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own daily stats" ON public.daily_stats
    FOR UPDATE USING (auth.uid() = user_id);

-- Settings policies
CREATE POLICY "Users can view own settings" ON public.user_settings
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON public.user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON public.user_settings
    FOR UPDATE USING (auth.uid() = user_id);

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
    
    INSERT INTO public.user_settings (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_focus_sessions_user_id ON public.focus_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_started_at ON public.focus_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_daily_stats_user_date ON public.daily_stats(user_id, date);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
