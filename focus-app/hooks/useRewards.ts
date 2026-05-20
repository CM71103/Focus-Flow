import { useQuery } from '@tanstack/react-query'
import { supabase, isSupabaseEnabled } from '@/lib/supabase'
import { ACHIEVEMENT_DEFS, getUnlockedAchievements } from '@/lib/achievements'
import { focusSessions } from '@/lib/mockData'
import type { Achievement } from '@/lib/mockData'
import { useFocus } from '@/contexts/FocusContext'

function mapToAchievement(def: typeof ACHIEVEMENT_DEFS[0], unlocked: boolean): Achievement {
    return {
        id: def.id,
        title: def.title,
        description: def.description,
        icon: def.icon,
        tier: def.tier,
        points: def.points,
        unlocked,
    }
}

export function useAchievements() {
    return useQuery<Achievement[]>({
        queryKey: ['achievements'],
        queryFn: async () => {
            const unlocked = await getUnlockedAchievements()
            return ACHIEVEMENT_DEFS.map((def) => mapToAchievement(def, unlocked.has(def.id)))
        },
        placeholderData: ACHIEVEMENT_DEFS.map((def) => mapToAchievement(def, false)),
        staleTime: 300_000,
    })
}

export function useStreakInfo() {
    const { streak, todayFocusMinutes } = useFocus()
    return useQuery({
        queryKey: ['streak-info'],
        queryFn: () => Promise.resolve({
            current: streak,
            longest: streak,
            lastActiveDate: todayFocusMinutes > 0 ? new Date().toISOString().split('T')[0] : '',
        }),
        staleTime: 60_000,
    })
}

export function useUnlockedAchievements() {
    return useQuery({
        queryKey: ['unlocked-achievements'],
        queryFn: async () => {
            const unlocked = await getUnlockedAchievements()
            return ACHIEVEMENT_DEFS.filter((def) => unlocked.has(def.id)).map((def) => mapToAchievement(def, true))
        },
        staleTime: 300_000,
    })
}

export function useLockedAchievements() {
    return useQuery({
        queryKey: ['locked-achievements'],
        queryFn: async () => {
            const unlocked = await getUnlockedAchievements()
            return ACHIEVEMENT_DEFS.filter((def) => !unlocked.has(def.id)).map((def) => mapToAchievement(def, false))
        },
        staleTime: 300_000,
    })
}

export function useFocusSessions() {
    return useQuery({
        queryKey: ['focus-sessions'],
        queryFn: async () => {
            if (!isSupabaseEnabled) return focusSessions

            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return focusSessions

            const { data, error } = await supabase
                .from('focus_sessions')
                .select('*')
                .eq('user_id', user.id)
                .order('started_at', { ascending: false })
                .limit(20)

            if (error || !data) return focusSessions

            return data.map((s) => ({
                id: s.id,
                mode: s.mode as 'pomodoro' | 'deep-work' | 'custom',
                duration: s.duration_minutes,
                startTime: s.started_at,
                endTime: s.completed_at,
                completed: s.completed,
                appsBlocked: s.blocked_apps || [],
                pointsEarned: s.points_earned,
                distractions: s.distractions,
            }))
        },
        placeholderData: focusSessions,
        staleTime: 60_000,
    })
}
