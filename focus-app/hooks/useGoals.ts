import { useQuery } from '@tanstack/react-query'
import { supabase, isSupabaseEnabled } from '@/lib/supabase'
import { dailyGoals as mockGoals } from '@/lib/mockData'
import type { DailyGoal } from '@/lib/mockData'
import { useFocus } from '@/contexts/FocusContext'
import { useTodayScreenTime } from '@/hooks/useUsageStats'

export function useDailyGoals() {
    const { todayFocusMinutes, todaySessionsCompleted } = useFocus()
    const { data: screenTime = 0 } = useTodayScreenTime()

    return useQuery<DailyGoal[]>({
        queryKey: ['daily-goals', todayFocusMinutes, todaySessionsCompleted, screenTime],
        queryFn: async () => {
            let screenTimeGoal = 180

            if (isSupabaseEnabled) {
                try {
                    const { data: { user } } = await supabase.auth.getUser()
                    if (user?.user_metadata?.daily_screen_time_goal) {
                        screenTimeGoal = user.user_metadata.daily_screen_time_goal
                    }
                } catch {
                }
            }

            const focusSessionGoal = 4

            return [
                {
                    id: 'goal-1',
                    type: 'screen-time',
                    target: screenTimeGoal,
                    current: screenTime,
                    unit: 'min',
                    completed: screenTime <= screenTimeGoal,
                },
                {
                    id: 'goal-2',
                    type: 'focus-sessions',
                    target: focusSessionGoal,
                    current: todaySessionsCompleted,
                    unit: 'sessions',
                    completed: todaySessionsCompleted >= focusSessionGoal,
                },
                {
                    id: 'goal-3',
                    type: 'app-limit',
                    target: 30,
                    current: Math.min(screenTime, 30),
                    unit: 'min (Twitter)',
                    completed: screenTime <= 30,
                },
            ]
        },
        placeholderData: mockGoals,
        staleTime: 30_000,
    })
}

export function useCompletedGoals() {
    const { data: goals = [] } = useDailyGoals()
    return useQuery({
        queryKey: ['completed-goals', goals],
        queryFn: () => goals.filter((g) => g.completed),
        staleTime: 30_000,
    })
}

export function useActiveGoals() {
    const { data: goals = [] } = useDailyGoals()
    return useQuery({
        queryKey: ['active-goals', goals],
        queryFn: () => goals.filter((g) => !g.completed),
        staleTime: 30_000,
    })
}
