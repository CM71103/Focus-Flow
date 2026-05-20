import { supabase, isSupabaseEnabled } from './supabase'
import AsyncStorage from '@react-native-async-storage/async-storage'

const SYNC_STATUS_KEY = 'focusflow_last_sync'

export interface SyncResult {
    success: boolean
    synced: number
    error?: string
}

async function getLastSyncTime(): Promise<string | null> {
    try {
        return await AsyncStorage.getItem(SYNC_STATUS_KEY)
    } catch {
        return null
    }
}

async function setLastSyncTime(time: string) {
    try {
        await AsyncStorage.setItem(SYNC_STATUS_KEY, time)
    } catch {
        // ignore
    }
}

export async function syncFocusSession(session: {
    mode: string
    duration: number
    completed: boolean
    pointsEarned: number
    distractions: number
    blockedApps: string[]
    startedAt: string
    completedAt?: string
}): Promise<SyncResult> {
    if (!isSupabaseEnabled) {
        return { success: true, synced: 0 }
    }

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, synced: 0, error: 'Not authenticated' }

        const { error } = await supabase
            .from('focus_sessions')
            .insert({
                user_id: user.id,
                mode: session.mode,
                duration_minutes: session.duration,
                completed: session.completed,
                points_earned: session.pointsEarned,
                distractions: session.distractions,
                blocked_apps: session.blockedApps,
                started_at: session.startedAt,
                completed_at: session.completedAt,
            })

        if (error) throw error

        await setLastSyncTime(new Date().toISOString())
        return { success: true, synced: 1 }
    } catch (err: any) {
        return { success: false, synced: 0, error: err.message }
    }
}

export async function syncDailyStats(stats: {
    date: string
    focusMinutes: number
    sessionsCompleted: number
    pointsEarned: number
}): Promise<SyncResult> {
    if (!isSupabaseEnabled) {
        return { success: true, synced: 0 }
    }

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, synced: 0, error: 'Not authenticated' }

        const { error } = await supabase
            .from('daily_stats')
            .upsert({
                user_id: user.id,
                date: stats.date,
                focus_minutes: stats.focusMinutes,
                sessions_completed: stats.sessionsCompleted,
                points_earned: stats.pointsEarned,
            }, { onConflict: 'user_id,date' })

        if (error) throw error

        return { success: true, synced: 1 }
    } catch (err: any) {
        return { success: false, synced: 0, error: err.message }
    }
}

export async function syncProfile(data: {
    totalPoints: number
    currentStreak: number
    longestStreak: number
    lifetimeSessions: number
    lifetimeFocusMinutes: number
}): Promise<SyncResult> {
    if (!isSupabaseEnabled) {
        return { success: true, synced: 0 }
    }

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, synced: 0, error: 'Not authenticated' }

        const { error } = await supabase
            .from('profiles')
            .update({
                total_points: data.totalPoints,
                current_streak: data.currentStreak,
                longest_streak: data.longestStreak,
                lifetime_sessions: data.lifetimeSessions,
                lifetime_focus_minutes: data.lifetimeFocusMinutes,
                updated_at: new Date().toISOString(),
            })
            .eq('id', user.id)

        if (error) throw error

        return { success: true, synced: 1 }
    } catch (err: any) {
        return { success: false, synced: 0, error: err.message }
    }
}

export async function syncAchievement(achievementId: string): Promise<SyncResult> {
    if (!isSupabaseEnabled) {
        return { success: true, synced: 0 }
    }

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, synced: 0, error: 'Not authenticated' }

        const { error } = await supabase
            .from('user_achievements')
            .insert({
                user_id: user.id,
                achievement_id: achievementId,
            })

        if (error) {
            if (error.code === '23505') {
                return { success: true, synced: 0 }
            }
            throw error
        }

        return { success: true, synced: 1 }
    } catch (err: any) {
        return { success: false, synced: 0, error: err.message }
    }
}

export async function fetchCloudProfile() {
    if (!isSupabaseEnabled) {
        return null
    }

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return null

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (error) throw error
        return data
    } catch {
        return null
    }
}

export async function fetchCloudSessions(limit = 20) {
    if (!isSupabaseEnabled) {
        return []
    }

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return []

        const { data, error } = await supabase
            .from('focus_sessions')
            .select('*')
            .eq('user_id', user.id)
            .order('started_at', { ascending: false })
            .limit(limit)

        if (error) throw error
        return data || []
    } catch {
        return []
    }
}

export async function fetchCloudAchievements() {
    if (!isSupabaseEnabled) {
        return []
    }

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return []

        const { data, error } = await supabase
            .from('user_achievements')
            .select('achievement_id, unlocked_at')
            .eq('user_id', user.id)

        if (error) throw error
        return data || []
    } catch {
        return []
    }
}
