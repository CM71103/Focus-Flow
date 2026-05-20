import { useState, useEffect, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { scheduleDailyReminder, cancelDailyReminder, isDailyReminderScheduled } from '@/lib/notifications'

const STORAGE_KEY = 'focusflow_settings'

interface ProfileSettings {
    blockNotifications: boolean
    strictMode: boolean
    dailyReminder: boolean
    weeklyReport: boolean
    soundEnabled: boolean
    hapticsEnabled: boolean
    pushEnabled: boolean
    weeklyDigest: boolean
    compactMode: boolean
}

const DEFAULT_SETTINGS: ProfileSettings = {
    blockNotifications: true,
    strictMode: false,
    dailyReminder: true,
    weeklyReport: true,
    soundEnabled: true,
    hapticsEnabled: true,
    pushEnabled: true,
    weeklyDigest: true,
    compactMode: false,
}

export function useProfileSettings() {
    const [settings, setSettings] = useState<ProfileSettings>(DEFAULT_SETTINGS)
    const [loaded, setLoaded] = useState(false)

    useEffect(() => {
        const load = async () => {
            try {
                const data = await AsyncStorage.getItem(STORAGE_KEY)
                if (data) {
                    setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(data) })
                }

                const reminderScheduled = await isDailyReminderScheduled()
                setSettings((prev) => ({ ...prev, dailyReminder: reminderScheduled }))
            } catch {
            } finally {
                setLoaded(true)
            }
        }
        load()
    }, [])

    const updateSetting = useCallback(async <K extends keyof ProfileSettings>(key: K, value: ProfileSettings[K]) => {
        setSettings((prev) => {
            const next = { ...prev, [key]: value }
            AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {})
            return next
        })

        if (key === 'dailyReminder') {
            if (value) {
                await scheduleDailyReminder(9, 0)
            } else {
                await cancelDailyReminder()
            }
        }
    }, [])

    return { settings, updateSetting, loaded }
}
