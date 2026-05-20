import AsyncStorage from '@react-native-async-storage/async-storage'

export interface AchievementDef {
    id: string
    title: string
    description: string
    icon: string
    tier: 'bronze' | 'silver' | 'gold' | 'platinum'
    points: number
    check: (stats: UserStats) => boolean
}

export interface UserStats {
    totalSessionsCompleted: number
    totalFocusMinutes: number
    currentStreak: number
    longestStreak: number
    totalPoints: number
    zeroDistractionSessions: number
    deepWorkSessions: number
    weeklySessions: number
    monthlyPoints: number
}

const STORAGE_KEY = 'focusflow_unlocked_achievements'

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
    {
        id: 'ach-1',
        title: 'First Focus',
        description: 'Complete your first focus session',
        icon: 'play-circle',
        tier: 'bronze',
        points: 25,
        check: (stats) => stats.totalSessionsCompleted >= 1,
    },
    {
        id: 'ach-2',
        title: '3-Day Streak',
        description: 'Maintain a 3-day focus streak',
        icon: 'flame',
        tier: 'bronze',
        points: 50,
        check: (stats) => stats.currentStreak >= 3,
    },
    {
        id: 'ach-3',
        title: 'Week Warrior',
        description: 'Complete 7 focus sessions in a week',
        icon: 'trophy',
        tier: 'silver',
        points: 100,
        check: (stats) => stats.weeklySessions >= 7,
    },
    {
        id: 'ach-4',
        title: 'Deep Diver',
        description: 'Complete a 60-minute deep work session',
        icon: 'hourglass',
        tier: 'silver',
        points: 150,
        check: (stats) => stats.deepWorkSessions >= 1,
    },
    {
        id: 'ach-5',
        title: 'Screen Master',
        description: 'Stay under daily screen time limit for 7 days',
        icon: 'shield-checkmark',
        tier: 'gold',
        points: 200,
        check: () => false, // Requires screen time data integration
    },
    {
        id: 'ach-6',
        title: 'Zen Master',
        description: 'Complete 10 sessions with zero distractions',
        icon: 'leaf',
        tier: 'gold',
        points: 300,
        check: (stats) => stats.zeroDistractionSessions >= 10,
    },
    {
        id: 'ach-7',
        title: 'Monthly Champion',
        description: 'Earn 5000 points in a month',
        icon: 'star',
        tier: 'platinum',
        points: 500,
        check: (stats) => stats.monthlyPoints >= 5000,
    },
    {
        id: 'ach-8',
        title: 'Habit Builder',
        description: 'Maintain a 30-day focus streak',
        icon: 'infinite',
        tier: 'platinum',
        points: 1000,
        check: (stats) => stats.currentStreak >= 30,
    },
]

export async function getUnlockedAchievements(): Promise<Set<string>> {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEY)
        return data ? new Set(JSON.parse(data)) : new Set()
    } catch {
        return new Set()
    }
}

export async function unlockAchievement(id: string): Promise<boolean> {
    const unlocked = await getUnlockedAchievements()
    if (unlocked.has(id)) return false
    unlocked.add(id)
    try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...unlocked]))
        return true
    } catch {
        return false
    }
}

export function checkNewAchievements(stats: UserStats, unlocked: Set<string>): string[] {
    const newUnlocks: string[] = []
    for (const def of ACHIEVEMENT_DEFS) {
        if (!unlocked.has(def.id) && def.check(stats)) {
            newUnlocks.push(def.id)
        }
    }
    return newUnlocks
}
