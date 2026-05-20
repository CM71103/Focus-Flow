import * as Haptics from 'expo-haptics'

type SoundType = 'sessionComplete' | 'achievementUnlock' | 'sessionStart' | 'distraction'

export const Sounds = {
    async playSessionStart() {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        await new Promise((r) => setTimeout(r, 100))
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    },

    async playSessionComplete() {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        await new Promise((r) => setTimeout(r, 150))
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        await new Promise((r) => setTimeout(r, 150))
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    },

    async playAchievementUnlock() {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        await new Promise((r) => setTimeout(r, 100))
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        await new Promise((r) => setTimeout(r, 100))
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
    },

    async playDistraction() {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
        await new Promise((r) => setTimeout(r, 100))
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    },

    async init() {
        // No initialization needed for haptics
    },

    async cleanup() {
        // No cleanup needed for haptics
    },
}
