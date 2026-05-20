import { NativeModules, NativeEventEmitter, Platform } from 'react-native'

const { AppBlockingModule } = NativeModules

const eventEmitter = AppBlockingModule ? new NativeEventEmitter(AppBlockingModule) : null

export const AppBlocking = {
    isAvailable: Platform.OS === 'android' && !!AppBlockingModule,

    async startService(): Promise<boolean> {
        if (!this.isAvailable) return false
        try {
            return await AppBlockingModule.startBlockingService()
        } catch {
            return false
        }
    },

    async setBlockedApps(apps: string[]): Promise<boolean> {
        if (!this.isAvailable) return false
        try {
            return await AppBlockingModule.setBlockedApps(apps)
        } catch {
            return false
        }
    },

    async stopBlocking(): Promise<boolean> {
        if (!this.isAvailable) return false
        try {
            return await AppBlockingModule.stopBlocking()
        } catch {
            return false
        }
    },

    async isEnabled(): Promise<boolean> {
        if (!this.isAvailable) return false
        try {
            return await AppBlockingModule.isAccessibilityEnabled()
        } catch {
            return false
        }
    },

    async isServiceEnabled(): Promise<boolean> {
        if (!this.isAvailable) return false
        try {
            return await AppBlockingModule.isAccessibilityServiceEnabled()
        } catch {
            return false
        }
    },

    async openAccessibilitySettings(): Promise<boolean> {
        return this.startService()
    },

    addListener(callback: (event: { packageName: string }) => void) {
        if (!eventEmitter) return () => {}
        const subscription = eventEmitter.addListener('onAppBlocked', callback)
        return () => subscription.remove()
    },
}
