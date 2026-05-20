export type AppCategory = 'social' | 'entertainment' | 'productivity' | 'communication' | 'gaming' | 'utilities' | 'shopping' | 'news'

export type UsagePeriod = 'today' | 'week' | 'month'

export type FocusMode = 'pomodoro' | 'deep-work' | 'custom'

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum'

export interface AppUsage {
    id: string
    appName: string
    icon: string
    category: AppCategory
    minutesToday: number
    minutesWeek: number
    pickups: number
    lastUsed: string
    blocked: boolean
    dailyLimit: number | null
}

export interface FocusSession {
    id: string
    mode: FocusMode
    duration: number
    startTime: string
    endTime: string | null
    completed: boolean
    appsBlocked: string[]
    pointsEarned: number
    distractions: number
}

export interface DailyGoal {
    id: string
    type: 'screen-time' | 'focus-sessions' | 'app-limit'
    target: number
    current: number
    unit: string
    completed: boolean
}

export interface Achievement {
    id: string
    title: string
    description: string
    icon: string
    tier: AchievementTier
    points: number
    unlocked: boolean
    unlockedAt?: string
}

export interface StreakInfo {
    current: number
    longest: number
    lastActiveDate: string
}

export interface WeeklyReport {
    weekStart: string
    totalScreenTime: number
    focusTime: number
    sessionsCompleted: number
    pointsEarned: number
    topApps: { name: string; minutes: number }[]
    dailyBreakdown: { day: string; screenTime: number; focusTime: number }[]
}

export const demoUser = {
    fullName: 'Alex Chen',
    email: 'alex.chen@example.com',
    initials: 'AC',
}

export const appUsageData: AppUsage[] = [
    { id: 'app-1', appName: 'Instagram', icon: 'instagram', category: 'social', minutesToday: 87, minutesWeek: 542, pickups: 34, lastUsed: '2m ago', blocked: false, dailyLimit: 60 },
    { id: 'app-2', appName: 'TikTok', icon: 'videocam', category: 'entertainment', minutesToday: 62, minutesWeek: 410, pickups: 28, lastUsed: '15m ago', blocked: false, dailyLimit: 45 },
    { id: 'app-3', appName: 'WhatsApp', icon: 'chatbubble', category: 'communication', minutesToday: 34, minutesWeek: 198, pickups: 45, lastUsed: '5m ago', blocked: false, dailyLimit: null },
    { id: 'app-4', appName: 'YouTube', icon: 'play-circle', category: 'entertainment', minutesToday: 45, minutesWeek: 312, pickups: 12, lastUsed: '1h ago', blocked: false, dailyLimit: 60 },
    { id: 'app-5', appName: 'Twitter / X', icon: 'logo-twitter', category: 'social', minutesToday: 28, minutesWeek: 175, pickups: 22, lastUsed: '30m ago', blocked: false, dailyLimit: 30 },
    { id: 'app-6', appName: 'Spotify', icon: 'musical-notes', category: 'entertainment', minutesToday: 95, minutesWeek: 620, pickups: 8, lastUsed: 'Now', blocked: false, dailyLimit: null },
    { id: 'app-7', appName: 'Reddit', icon: 'globe', category: 'news', minutesToday: 23, minutesWeek: 145, pickups: 15, lastUsed: '2h ago', blocked: false, dailyLimit: 30 },
    { id: 'app-8', appName: 'Candy Crush', icon: 'game-controller', category: 'gaming', minutesToday: 18, minutesWeek: 98, pickups: 9, lastUsed: '3h ago', blocked: false, dailyLimit: 20 },
]

export const focusSessions: FocusSession[] = [
    { id: 'session-1', mode: 'pomodoro', duration: 25, startTime: '2026-05-18T09:00:00Z', endTime: '2026-05-18T09:25:00Z', completed: true, appsBlocked: ['Instagram', 'TikTok', 'Twitter / X'], pointsEarned: 50, distractions: 0 },
    { id: 'session-2', mode: 'deep-work', duration: 50, startTime: '2026-05-18T10:00:00Z', endTime: '2026-05-18T10:50:00Z', completed: true, appsBlocked: ['Instagram', 'TikTok', 'YouTube', 'Reddit'], pointsEarned: 100, distractions: 1 },
    { id: 'session-3', mode: 'pomodoro', duration: 25, startTime: '2026-05-18T14:00:00Z', endTime: '2026-05-18T14:18:00Z', completed: false, appsBlocked: ['Instagram', 'TikTok'], pointsEarned: 15, distractions: 3 },
    { id: 'session-4', mode: 'custom', duration: 45, startTime: '2026-05-17T11:00:00Z', endTime: '2026-05-17T11:45:00Z', completed: true, appsBlocked: ['Instagram', 'TikTok', 'Twitter / X', 'Reddit'], pointsEarned: 90, distractions: 0 },
    { id: 'session-5', mode: 'pomodoro', duration: 25, startTime: '2026-05-17T15:00:00Z', endTime: '2026-05-17T15:25:00Z', completed: true, appsBlocked: ['Instagram', 'TikTok'], pointsEarned: 50, distractions: 1 },
]

export const dailyGoals: DailyGoal[] = [
    { id: 'goal-1', type: 'screen-time', target: 180, current: 259, unit: 'min', completed: false },
    { id: 'goal-2', type: 'focus-sessions', target: 4, current: 2, unit: 'sessions', completed: false },
    { id: 'goal-3', type: 'app-limit', target: 30, current: 28, unit: 'min (Twitter)', completed: false },
]

export const achievements: Achievement[] = [
    { id: 'ach-1', title: 'First Focus', description: 'Complete your first focus session', icon: 'play-circle', tier: 'bronze', points: 25, unlocked: true, unlockedAt: '2026-05-10' },
    { id: 'ach-2', title: '3-Day Streak', description: 'Maintain a 3-day focus streak', icon: 'flame', tier: 'bronze', points: 50, unlocked: true, unlockedAt: '2026-05-13' },
    { id: 'ach-3', title: 'Week Warrior', description: 'Complete 7 focus sessions in a week', icon: 'trophy', tier: 'silver', points: 100, unlocked: true, unlockedAt: '2026-05-16' },
    { id: 'ach-4', title: 'Deep Diver', description: 'Complete a 60-minute deep work session', icon: 'hourglass', tier: 'silver', points: 150, unlocked: false },
    { id: 'ach-5', title: 'Screen Master', description: 'Stay under daily screen time limit for 7 days', icon: 'shield-checkmark', tier: 'gold', points: 200, unlocked: false },
    { id: 'ach-6', title: 'Zen Master', description: 'Complete 10 sessions with zero distractions', icon: 'leaf', tier: 'gold', points: 300, unlocked: false },
    { id: 'ach-7', title: 'Monthly Champion', description: 'Earn 5000 points in a month', icon: 'star', tier: 'platinum', points: 500, unlocked: false },
    { id: 'ach-8', title: 'Habit Builder', description: 'Maintain a 30-day focus streak', icon: 'infinite', tier: 'platinum', points: 1000, unlocked: false },
]

export const streakInfo: StreakInfo = {
    current: 5,
    longest: 12,
    lastActiveDate: '2026-05-18',
}

export const weeklyReport: WeeklyReport = {
    weekStart: '2026-05-12',
    totalScreenTime: 2145,
    focusTime: 385,
    sessionsCompleted: 14,
    pointsEarned: 1250,
    topApps: [
        { name: 'Spotify', minutes: 620 },
        { name: 'Instagram', minutes: 542 },
        { name: 'TikTok', minutes: 410 },
        { name: 'YouTube', minutes: 312 },
        { name: 'WhatsApp', minutes: 198 },
    ],
    dailyBreakdown: [
        { day: 'Mon', screenTime: 320, focusTime: 50 },
        { day: 'Tue', screenTime: 285, focusTime: 75 },
        { day: 'Wed', screenTime: 350, focusTime: 45 },
        { day: 'Thu', screenTime: 290, focusTime: 80 },
        { day: 'Fri', screenTime: 310, focusTime: 60 },
        { day: 'Sat', screenTime: 340, focusTime: 40 },
        { day: 'Sun', screenTime: 250, focusTime: 35 },
    ],
}

export const hourlyUsageToday = [
    { hour: '6am', minutes: 5 },
    { hour: '7am', minutes: 15 },
    { hour: '8am', minutes: 32 },
    { hour: '9am', minutes: 10 },
    { hour: '10am', minutes: 8 },
    { hour: '11am', minutes: 22 },
    { hour: '12pm', minutes: 45 },
    { hour: '1pm', minutes: 38 },
    { hour: '2pm', minutes: 12 },
    { hour: '3pm', minutes: 28 },
    { hour: '4pm', minutes: 35 },
    { hour: '5pm', minutes: 42 },
]

export const categoryBreakdown = [
    { category: 'Social', minutes: 115, percentage: 32, color: '#f472b6' },
    { category: 'Entertainment', minutes: 202, percentage: 56, color: '#a78bfa' },
    { category: 'Communication', minutes: 34, percentage: 9, color: '#60a5fa' },
    { category: 'Gaming', minutes: 18, percentage: 5, color: '#fbbf24' },
]

export const pomodoroPresets = [
    { label: 'Quick Focus', work: 15, shortBreak: 3, longBreak: 10, rounds: 2 },
    { label: 'Classic', work: 25, shortBreak: 5, longBreak: 15, rounds: 4 },
    { label: 'Deep Work', work: 50, shortBreak: 10, longBreak: 20, rounds: 3 },
    { label: 'Ultra', work: 90, shortBreak: 15, longBreak: 30, rounds: 2 },
]

export function getCategoryColor(category: AppCategory): string {
    const colors: Record<AppCategory, string> = {
        social: '#f472b6',
        entertainment: '#a78bfa',
        productivity: '#4ade80',
        communication: '#60a5fa',
        gaming: '#fbbf24',
        utilities: '#94a3b8',
        shopping: '#fb923c',
        news: '#f87171',
    }
    return colors[category]
}

export function formatMinutes(minutes: number): string {
    if (minutes < 60) return `${minutes}m`
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export function getTierColor(tier: AchievementTier): string {
    switch (tier) {
        case 'bronze': return '#cd7f32'
        case 'silver': return '#c0c0c0'
        case 'gold': return '#ffd700'
        case 'platinum': return '#e5e4e2'
    }
}

export const supportFaq = [
    { id: 'faq-1', question: 'How do focus sessions work?', answer: 'Choose a preset or custom duration, select apps to block, and start focusing. You earn points for every minute of focused time.' },
    { id: 'faq-2', question: 'How are points calculated?', answer: 'You earn 2 points per minute of focus time. Completing full sessions and maintaining streaks gives bonus points.' },
    { id: 'faq-3', question: 'Can I change my daily screen time goal?', answer: 'Yes, go to Profile > Daily Goals to adjust your screen time limit and focus session targets.' },
]
