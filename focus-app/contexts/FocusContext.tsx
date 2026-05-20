import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Haptics from 'expo-haptics'
import { track } from '@/lib/analytics'
import { AppBlocking } from '@/lib/appBlocking'
import { checkNewAchievements, getUnlockedAchievements, unlockAchievement, type UserStats } from '@/lib/achievements'
import { Sounds } from '@/lib/sounds'
import { syncFocusSession, syncDailyStats, syncProfile, syncAchievement } from '@/lib/supabaseSync'

export type SessionState = 'idle' | 'running' | 'paused' | 'break'

export interface FocusSessionConfig {
    mode: 'pomodoro' | 'deep-work' | 'custom'
    workMinutes: number
    breakMinutes: number
    longBreakMinutes: number
    rounds: number
    blockedApps: string[]
}

interface FocusState {
    sessionState: SessionState
    currentRound: number
    totalRounds: number
    timeRemaining: number
    totalWorkTime: number
    distractions: number
    sessionConfig: FocusSessionConfig
    totalPoints: number
    todayPoints: number
    streak: number
    todayFocusMinutes: number
    todaySessionsCompleted: number
    blockedAppTriggered: string | null
}

interface FocusContextValue extends FocusState {
    startSession: (config: FocusSessionConfig) => void
    pauseSession: () => void
    resumeSession: () => void
    stopSession: () => void
    recordDistraction: () => void
    addPoints: (points: number) => void
    resetDailyStats: () => void
    dismissBlockedApp: () => void
    reportDistractionFromBlock: () => void
}

const STORAGE_KEYS = {
    totalPoints: 'focusflow_total_points',
    streak: 'focusflow_streak',
    longestStreak: 'focusflow_longest_streak',
    lastActiveDate: 'focusflow_last_active_date',
    todayPoints: 'focusflow_today_points',
    todayFocusMinutes: 'focusflow_today_focus_minutes',
    todaySessionsCompleted: 'focusflow_today_sessions_completed',
    todayDate: 'focusflow_today_date',
    lifetimeSessions: 'focusflow_lifetime_sessions',
    lifetimeFocusMinutes: 'focusflow_lifetime_focus_minutes',
    zeroDistractionSessions: 'focusflow_zero_distraction_sessions',
    deepWorkSessions: 'focusflow_deep_work_sessions',
    weeklySessions: 'focusflow_weekly_sessions',
    monthlyPoints: 'focusflow_monthly_points',
}

const FocusContext = createContext<FocusContextValue | null>(null)

export function useFocus() {
    const ctx = useContext(FocusContext)
    if (!ctx) throw new Error('useFocus must be used within FocusProvider')
    return ctx
}

function getTodayStr() {
    return new Date().toISOString().split('T')[0]
}

async function loadStoredValue(key: string, fallback: number): Promise<number> {
    try {
        const val = await AsyncStorage.getItem(key)
        return val ? parseInt(val, 10) : fallback
    } catch {
        return fallback
    }
}

async function storeValue(key: string, value: number) {
    try {
        await AsyncStorage.setItem(key, String(value))
    } catch { /* ignore */ }
}

async function storeString(key: string, value: string) {
    try {
        await AsyncStorage.setItem(key, value)
    } catch { /* ignore */ }
}

export function FocusProvider({ children }: { children: React.ReactNode }) {
    const [sessionState, setSessionState] = useState<SessionState>('idle')
    const [currentRound, setCurrentRound] = useState(1)
    const [totalRounds, setTotalRounds] = useState(4)
    const [timeRemaining, setTimeRemaining] = useState(0)
    const [totalWorkTime, setTotalWorkTime] = useState(0)
    const [distractions, setDistractions] = useState(0)
    const [sessionConfig, setSessionConfig] = useState<FocusSessionConfig>({
        mode: 'pomodoro',
        workMinutes: 25,
        breakMinutes: 5,
        longBreakMinutes: 15,
        rounds: 4,
        blockedApps: [],
    })
    const [totalPoints, setTotalPoints] = useState(0)
    const [todayPoints, setTodayPoints] = useState(0)
    const [streak, setStreak] = useState(0)
    const [longestStreak, setLongestStreak] = useState(0)
    const [todayFocusMinutes, setTodayFocusMinutes] = useState(0)
    const [todaySessionsCompleted, setTodaySessionsCompleted] = useState(0)
    const [blockedAppTriggered, setBlockedAppTriggered] = useState<string | null>(null)
    const [lifetimeSessions, setLifetimeSessions] = useState(0)
    const [lifetimeFocusMinutes, setLifetimeFocusMinutes] = useState(0)
    const [zeroDistractionSessions, setZeroDistractionSessions] = useState(0)
    const [deepWorkSessions, setDeepWorkSessions] = useState(0)
    const [weeklySessions, setWeeklySessions] = useState(0)
    const [monthlyPoints, setMonthlyPoints] = useState(0)

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const sessionStartTimeRef = useRef<number>(0)

    useEffect(() => {
        const init = async () => {
            const storedDate = await AsyncStorage.getItem(STORAGE_KEYS.todayDate)
            const today = getTodayStr()

            if (storedDate !== today) {
                await AsyncStorage.setItem(STORAGE_KEYS.todayDate, today)
                await storeValue(STORAGE_KEYS.todayPoints, 0)
                await storeValue(STORAGE_KEYS.todayFocusMinutes, 0)
                await storeValue(STORAGE_KEYS.todaySessionsCompleted, 0)

                const lastActive = await AsyncStorage.getItem(STORAGE_KEYS.lastActiveDate)
                if (lastActive) {
                    const last = new Date(lastActive)
                    const now = new Date(today)
                    const diff = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))
                    if (diff > 1) {
                        await storeValue(STORAGE_KEYS.streak, 0)
                        setStreak(0)
                    }
                }
            }

            const tp = await loadStoredValue(STORAGE_KEYS.totalPoints, 0)
            const tdp = await loadStoredValue(STORAGE_KEYS.todayPoints, 0)
            const str = await loadStoredValue(STORAGE_KEYS.streak, 0)
            const lng = await loadStoredValue(STORAGE_KEYS.longestStreak, 0)
            const tfm = await loadStoredValue(STORAGE_KEYS.todayFocusMinutes, 0)
            const tsc = await loadStoredValue(STORAGE_KEYS.todaySessionsCompleted, 0)
            const ls = await loadStoredValue(STORAGE_KEYS.lifetimeSessions, 0)
            const lfm = await loadStoredValue(STORAGE_KEYS.lifetimeFocusMinutes, 0)
            const zds = await loadStoredValue(STORAGE_KEYS.zeroDistractionSessions, 0)
            const dws = await loadStoredValue(STORAGE_KEYS.deepWorkSessions, 0)
            const ws = await loadStoredValue(STORAGE_KEYS.weeklySessions, 0)
            const mp = await loadStoredValue(STORAGE_KEYS.monthlyPoints, 0)

            setTotalPoints(tp)
            setTodayPoints(tdp)
            setStreak(str)
            setLongestStreak(lng)
            setTodayFocusMinutes(tfm)
            setTodaySessionsCompleted(tsc)
            setLifetimeSessions(ls)
            setLifetimeFocusMinutes(lfm)
            setZeroDistractionSessions(zds)
            setDeepWorkSessions(dws)
            setWeeklySessions(ws)
            setMonthlyPoints(mp)
        }
        init()
    }, [])

    useEffect(() => {
        const removeListener = AppBlocking.addListener((event) => {
            if (sessionState === 'running') {
                setBlockedAppTriggered(event.packageName)
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
            }
        })
        return () => removeListener()
    }, [sessionState])

    const clearTimer = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
        }
    }, [])

    const tick = useCallback(() => {
        setTimeRemaining((prev) => {
            if (prev <= 1) {
                return 0
            }
            return prev - 1
        })
    }, [])

    useEffect(() => {
        if (sessionState === 'running' || sessionState === 'break') {
            intervalRef.current = setInterval(tick, 1000)
        } else {
            clearTimer()
        }
        return clearTimer
    }, [sessionState, tick, clearTimer])

    useEffect(() => {
        if (timeRemaining === 0 && (sessionState === 'running' || sessionState === 'break')) {
            clearTimer()
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
            Sounds.playSessionComplete()

            const handleSessionComplete = async () => {
                if (sessionState === 'running') {
                    const workMinutes = sessionConfig.workMinutes
                    setTotalWorkTime((prev) => prev + workMinutes)
                    setTodayFocusMinutes((prev) => {
                        const newVal = prev + workMinutes
                        storeValue(STORAGE_KEYS.todayFocusMinutes, newVal)
                        return newVal
                    })
                    setLifetimeFocusMinutes((prev) => {
                        const newVal = prev + workMinutes
                        storeValue(STORAGE_KEYS.lifetimeFocusMinutes, newVal)
                        return newVal
                    })

                    const pointsEarned = workMinutes * 2
                    const newTotal = totalPoints + pointsEarned
                    const newToday = todayPoints + pointsEarned
                    setTotalPoints(newTotal)
                    setTodayPoints(newToday)
                    storeValue(STORAGE_KEYS.totalPoints, newTotal)
                    storeValue(STORAGE_KEYS.todayPoints, newToday)
                    setMonthlyPoints((prev) => {
                        const newVal = prev + pointsEarned
                        storeValue(STORAGE_KEYS.monthlyPoints, newVal)
                        return newVal
                    })

                    track('focus_session_completed', {
                        mode: sessionConfig.mode,
                        duration: workMinutes,
                        points: pointsEarned,
                        distractions,
                    })

                    if (currentRound >= totalRounds) {
                        setSessionState('idle')
                        setTodaySessionsCompleted((prev) => {
                            const newVal = prev + 1
                            storeValue(STORAGE_KEYS.todaySessionsCompleted, newVal)
                            return newVal
                        })
                        setLifetimeSessions((prev) => {
                            const newVal = prev + 1
                            storeValue(STORAGE_KEYS.lifetimeSessions, newVal)
                            return newVal
                        })
                        setWeeklySessions((prev) => {
                            const newVal = prev + 1
                            storeValue(STORAGE_KEYS.weeklySessions, newVal)
                            return newVal
                        })

                        if (distractions === 0) {
                            setZeroDistractionSessions((prev) => {
                                const newVal = prev + 1
                                storeValue(STORAGE_KEYS.zeroDistractionSessions, newVal)
                                return newVal
                            })
                        }

                        if (sessionConfig.mode === 'deep-work') {
                            setDeepWorkSessions((prev) => {
                                const newVal = prev + 1
                                storeValue(STORAGE_KEYS.deepWorkSessions, newVal)
                                return newVal
                            })
                        }

                        const newStreak = streak + 1
                        const newLongest = Math.max(longestStreak, newStreak)
                        setStreak(newStreak)
                        setLongestStreak(newLongest)
                        storeValue(STORAGE_KEYS.streak, newStreak)
                        storeValue(STORAGE_KEYS.longestStreak, newLongest)
                        storeString(STORAGE_KEYS.lastActiveDate, getTodayStr())

                        const stats: UserStats = {
                            totalSessionsCompleted: lifetimeSessions + 1,
                            totalFocusMinutes: lifetimeFocusMinutes + workMinutes,
                            currentStreak: newStreak,
                            longestStreak: newStreak,
                            totalPoints: newTotal,
                            zeroDistractionSessions: distractions === 0 ? zeroDistractionSessions + 1 : zeroDistractionSessions,
                            deepWorkSessions: sessionConfig.mode === 'deep-work' ? deepWorkSessions + 1 : deepWorkSessions,
                            weeklySessions: weeklySessions + 1,
                            monthlyPoints: monthlyPoints + pointsEarned,
                        }

                        const unlocked = await getUnlockedAchievements()
                        const newUnlocks = checkNewAchievements(stats, unlocked)
                        for (const id of newUnlocks) {
                            await unlockAchievement(id)
                            await syncAchievement(id)
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
                            Sounds.playAchievementUnlock()
                        }

                        await syncFocusSession({
                            mode: sessionConfig.mode,
                            duration: workMinutes,
                            completed: true,
                            pointsEarned,
                            distractions,
                            blockedApps: sessionConfig.blockedApps,
                            startedAt: new Date(Date.now() - workMinutes * 60000).toISOString(),
                            completedAt: new Date().toISOString(),
                        })

                        await syncDailyStats({
                            date: getTodayStr(),
                            focusMinutes: todayFocusMinutes + workMinutes,
                            sessionsCompleted: todaySessionsCompleted + 1,
                            pointsEarned: newToday,
                        })

                        await syncProfile({
                            totalPoints: newTotal,
                            currentStreak: newStreak,
                            longestStreak: Math.max(longestStreak, newStreak),
                            lifetimeSessions: lifetimeSessions + 1,
                            lifetimeFocusMinutes: lifetimeFocusMinutes + workMinutes,
                        })
                    } else {
                        setSessionState('break')
                        setTimeRemaining(sessionConfig.breakMinutes * 60)
                    }
                } else if (sessionState === 'break') {
                    setCurrentRound((prev) => prev + 1)
                    setSessionState('running')
                    setTimeRemaining(sessionConfig.workMinutes * 60)
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                }
            }

            handleSessionComplete()
        }
    }, [timeRemaining, sessionState])

    const startSession = useCallback(async (config: FocusSessionConfig) => {
        setSessionConfig(config)
        setSessionState('running')
        setCurrentRound(1)
        setTotalRounds(config.rounds)
        setTimeRemaining(config.workMinutes * 60)
        setTotalWorkTime(0)
        setDistractions(0)
        sessionStartTimeRef.current = Date.now()
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        Sounds.playSessionStart()
        track('focus_session_started', { mode: config.mode, duration: config.workMinutes })

        if (config.blockedApps.length > 0) {
            const serviceEnabled = await AppBlocking.isServiceEnabled()
            if (!serviceEnabled) {
                await AppBlocking.startService()
            } else {
                await AppBlocking.setBlockedApps(config.blockedApps)
            }
        }
    }, [])

    const pauseSession = useCallback(() => {
        setSessionState('paused')
        clearTimer()
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }, [clearTimer])

    const resumeSession = useCallback(() => {
        setSessionState(sessionState === 'break' ? 'break' : 'running')
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }, [sessionState])

    const stopSession = useCallback(async () => {
        clearTimer()
        const elapsed = Math.floor((Date.now() - sessionStartTimeRef.current) / 60000)
        if (elapsed > 2) {
            const partialPoints = Math.floor(elapsed * 0.5)
            if (partialPoints > 0) {
                const newTotal = totalPoints + partialPoints
                const newToday = todayPoints + partialPoints
                setTotalPoints(newTotal)
                setTodayPoints(newToday)
                storeValue(STORAGE_KEYS.totalPoints, newTotal)
                storeValue(STORAGE_KEYS.todayPoints, newToday)
            }
        }
        setSessionState('idle')
        setTimeRemaining(0)
        setTotalWorkTime(0)
        setDistractions(0)
        setCurrentRound(1)
        setBlockedAppTriggered(null)
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
        track('focus_session_stopped', { elapsed })

        await AppBlocking.stopBlocking()
    }, [clearTimer, totalPoints, todayPoints])

    const recordDistraction = useCallback(() => {
        setDistractions((prev) => prev + 1)
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
        Sounds.playDistraction()
    }, [])

    const dismissBlockedApp = useCallback(() => {
        setBlockedAppTriggered(null)
    }, [])

    const reportDistractionFromBlock = useCallback(() => {
        setDistractions((prev) => prev + 1)
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
        Sounds.playDistraction()
        track('focus_distraction', { source: 'blocked_app', blockedApp: blockedAppTriggered })
    }, [blockedAppTriggered])

    const addPoints = useCallback((points: number) => {
        const newTotal = totalPoints + points
        const newToday = todayPoints + points
        setTotalPoints(newTotal)
        setTodayPoints(newToday)
        storeValue(STORAGE_KEYS.totalPoints, newTotal)
        storeValue(STORAGE_KEYS.todayPoints, newToday)
    }, [totalPoints, todayPoints])

    const resetDailyStats = useCallback(() => {
        storeValue(STORAGE_KEYS.todayPoints, 0)
        storeValue(STORAGE_KEYS.todayFocusMinutes, 0)
        storeValue(STORAGE_KEYS.todaySessionsCompleted, 0)
        setTodayPoints(0)
        setTodayFocusMinutes(0)
        setTodaySessionsCompleted(0)
    }, [])

    const value: FocusContextValue = {
        sessionState,
        currentRound,
        totalRounds,
        timeRemaining,
        totalWorkTime,
        distractions,
        sessionConfig,
        totalPoints,
        todayPoints,
        streak,
        todayFocusMinutes,
        todaySessionsCompleted,
        blockedAppTriggered,
        startSession,
        pauseSession,
        resumeSession,
        stopSession,
        recordDistraction,
        addPoints,
        resetDailyStats,
        dismissBlockedApp,
        reportDistractionFromBlock,
    }

    return <FocusContext.Provider value={value}>{children}</FocusContext.Provider>
}
