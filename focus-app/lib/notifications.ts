import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

const REMINDER_KEY = 'focusflow_daily_reminder_scheduled'
const REMINDER_TIME_KEY = 'focusflow_daily_reminder_time'

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
})

export async function requestNotificationPermission(): Promise<boolean> {
    try {
        const { status } = await Notifications.requestPermissionsAsync()
        return status === 'granted'
    } catch {
        return false
    }
}

export async function scheduleDailyReminder(hour: number = 9, minute: number = 0): Promise<boolean> {
    try {
        const hasPermission = await requestNotificationPermission()
        if (!hasPermission) return false

        await Notifications.cancelAllScheduledNotificationsAsync()

        const now = new Date()
        const scheduledTime = new Date()
        scheduledTime.setHours(hour, minute, 0, 0)

        if (scheduledTime <= now) {
            scheduledTime.setDate(scheduledTime.getDate() + 1)
        }

        const trigger = {
            hour,
            minute,
            repeats: true,
        } as Notifications.NotificationTriggerInput

        await Notifications.scheduleNotificationAsync({
            content: {
                title: 'Time to Focus! ',
                body: 'Start your daily focus session and build your streak.',
                sound: 'default',
                priority: Notifications.AndroidNotificationPriority.HIGH,
            },
            trigger,
        })

        await AsyncStorage.setItem(REMINDER_KEY, 'true')
        await AsyncStorage.setItem(REMINDER_TIME_KEY, `${hour}:${minute}`)

        return true
    } catch {
        return false
    }
}

export async function cancelDailyReminder(): Promise<boolean> {
    try {
        await Notifications.cancelAllScheduledNotificationsAsync()
        await AsyncStorage.setItem(REMINDER_KEY, 'false')
        return true
    } catch {
        return false
    }
}

export async function isDailyReminderScheduled(): Promise<boolean> {
    try {
        const scheduled = await AsyncStorage.getItem(REMINDER_KEY)
        return scheduled === 'true'
    } catch {
        return false
    }
}
