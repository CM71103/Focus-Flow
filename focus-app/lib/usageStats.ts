import { Platform, NativeModules } from 'react-native'

export interface AppUsageData {
    packageName: string
    appName: string
    foregroundTime: number
    launchCount: number
    lastUsed: number
    category: string
}

export interface HourlyUsageData {
    hour: number
    foregroundTime: number
    unlockCount: number
}

export interface UsageStatsResult {
    success: boolean
    data: AppUsageData[]
    error?: string
}

export interface HourlyUsageResult {
    success: boolean
    data: HourlyUsageData[]
    error?: string
}

const { UsageStatsModule } = NativeModules

const isAndroid = Platform.OS === 'android'
const hasNativeModule = !!UsageStatsModule

export async function getAppUsage(period: 'today' | 'week' | 'month'): Promise<UsageStatsResult> {
    if (!isAndroid || !hasNativeModule) {
        return { success: false, data: [], error: 'Usage stats only available on Android with native module' }
    }

    try {
        const result = await UsageStatsModule.getAppUsage(period)
        return result
    } catch (error) {
        return { success: false, data: [], error: error instanceof Error ? error.message : 'Unknown error' }
    }
}

export async function getHourlyUsage(date: string): Promise<HourlyUsageResult> {
    if (!isAndroid || !hasNativeModule) {
        return { success: false, data: [], error: 'Usage stats only available on Android with native module' }
    }

    try {
        const result = await UsageStatsModule.getHourlyUsage(date)
        return result
    } catch (error) {
        return { success: false, data: [], error: error instanceof Error ? error.message : 'Unknown error' }
    }
}

export async function requestUsagePermission(): Promise<boolean> {
    if (!isAndroid || !hasNativeModule) {
        return false
    }

    try {
        return await UsageStatsModule.requestUsagePermission()
    } catch {
        return false
    }
}

export async function checkUsagePermission(): Promise<boolean> {
    if (!isAndroid || !hasNativeModule) {
        return false
    }

    try {
        return await UsageStatsModule.checkUsagePermission()
    } catch {
        return false
    }
}

export function openUsageSettings(): void {
    if (!isAndroid || !hasNativeModule) {
        return
    }

    UsageStatsModule.openUsageSettings()
}

export const UsageStats = {
    getAppUsage,
    getHourlyUsage,
    requestUsagePermission,
    checkUsagePermission,
    openUsageSettings,
    isAvailable: isAndroid && hasNativeModule,
}
