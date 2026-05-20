import { useQuery } from '@tanstack/react-query'
import { UsageStats } from '@/lib/usageStats'
import { appUsageData, hourlyUsageToday, categoryBreakdown, weeklyReport, focusSessions } from '@/lib/mockData'
import type { AppUsage, UsagePeriod, WeeklyReport } from '@/lib/mockData'

function mapNativeAppUsage(nativeData: any[]): AppUsage[] {
    const iconMap: Record<string, string> = {
        social: 'logo-instagram',
        entertainment: 'videocam',
        communication: 'chatbubble',
        gaming: 'game-controller',
        news: 'globe',
        productivity: 'briefcase',
        shopping: 'cart',
        utilities: 'construct',
    }

    return nativeData.map((item, index) => ({
        id: `app-${index}`,
        appName: item.appName || item.packageName,
        icon: iconMap[item.category] || 'apps',
        category: item.category || 'utilities',
        minutesToday: Math.round(item.foregroundTime / 60),
        minutesWeek: Math.round(item.foregroundTime / 60),
        pickups: item.launchCount || 0,
        lastUsed: formatTimeAgo(item.lastUsed),
        blocked: false,
        dailyLimit: null,
    }))
}

function formatTimeAgo(timestamp: number): string {
    if (!timestamp) return 'Unknown'
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
}

export function useAppUsage(period: UsagePeriod = 'today') {
    return useQuery<AppUsage[]>({
        queryKey: ['app-usage', period],
        queryFn: async () => {
            if (UsageStats.isAvailable) {
                const result = await UsageStats.getAppUsage(period)
                if (result.success && result.data.length > 0) {
                    return mapNativeAppUsage(result.data)
                }
            }
            return appUsageData
        },
        staleTime: 30_000,
    })
}

export function useHourlyUsage() {
    return useQuery({
        queryKey: ['hourly-usage'],
        queryFn: async () => {
            if (UsageStats.isAvailable) {
                const today = new Date().toISOString().split('T')[0]
                const result = await UsageStats.getHourlyUsage(today)
                if (result.success && result.data && result.data.length > 0) {
                    return result.data.map((item: any) => ({
                        hour: `${item.hour > 12 ? item.hour - 12 : item.hour}${item.hour === 0 ? 'am' : item.hour === 12 ? 'pm' : item.hour > 12 ? 'pm' : 'am'}`,
                        minutes: Math.round(item.foregroundTime / 60),
                    }))
                }
            }
            return hourlyUsageToday
        },
        placeholderData: hourlyUsageToday,
        staleTime: 30_000,
    })
}

export function useCategoryBreakdown(period: UsagePeriod = 'today') {
    return useQuery({
        queryKey: ['category-breakdown', period],
        queryFn: async () => {
            if (UsageStats.isAvailable) {
                const result = await UsageStats.getAppUsage(period)
                if (result.success && result.data && result.data.length > 0) {
                    const categoryMap: Record<string, number> = {}
                    let total = 0

                    result.data.forEach((item: any) => {
                        const cat = item.category || 'utilities'
                        const minutes = Math.round(item.foregroundTime / 60)
                        categoryMap[cat] = (categoryMap[cat] || 0) + minutes
                        total += minutes
                    })

                    const colors: Record<string, string> = {
                        social: '#f472b6',
                        entertainment: '#a78bfa',
                        communication: '#60a5fa',
                        gaming: '#fbbf24',
                        news: '#f87171',
                        productivity: '#4ade80',
                        shopping: '#fb923c',
                        utilities: '#94a3b8',
                    }

                    return Object.entries(categoryMap)
                        .map(([category, minutes]) => ({
                            category: category.charAt(0).toUpperCase() + category.slice(1),
                            minutes,
                            percentage: total > 0 ? Math.round((minutes / total) * 100) : 0,
                            color: colors[category] || '#94a3b8',
                        }))
                        .sort((a, b) => b.minutes - a.minutes)
                }
            }
            return categoryBreakdown
        },
        placeholderData: categoryBreakdown,
        staleTime: 30_000,
    })
}

export function useWeeklyReport(period: 'week' | 'month' = 'week') {
    return useQuery<WeeklyReport>({
        queryKey: ['weekly-report', period],
        queryFn: async () => {
            if (UsageStats.isAvailable) {
                const result = await UsageStats.getAppUsage(period === 'week' ? 'week' : 'month')
                if (result.success && result.data && result.data.length > 0) {
                    const totalMinutes = result.data.reduce((sum: number, item: any) =>
                        sum + Math.round(item.foregroundTime / 60), 0)

                    const topApps = result.data
                        .sort((a: any, b: any) => b.foregroundTime - a.foregroundTime)
                        .slice(0, 5)
                        .map((item: any) => ({
                            name: item.appName || item.packageName,
                            minutes: Math.round(item.foregroundTime / 60),
                        }))

                    return {
                        ...weeklyReport,
                        totalScreenTime: totalMinutes,
                        topApps,
                    }
                }
            }
            return weeklyReport
        },
        placeholderData: weeklyReport,
        staleTime: 300_000,
    })
}

export function useFocusSessions() {
    return useQuery({
        queryKey: ['focus-sessions'],
        queryFn: () => Promise.resolve(focusSessions),
        placeholderData: focusSessions,
        staleTime: 60_000,
    })
}

export function useTodayScreenTime() {
    return useQuery({
        queryKey: ['today-screen-time'],
        queryFn: async () => {
            if (UsageStats.isAvailable) {
                const result = await UsageStats.getAppUsage('today')
                if (result.success && result.data.length > 0) {
                    return result.data.reduce((sum: number, item: any) =>
                        sum + Math.round(item.foregroundTime / 60), 0)
                }
            }
            const total = appUsageData.reduce((sum, app) => sum + app.minutesToday, 0)
            return total
        },
        staleTime: 30_000,
    })
}

export function useTopApps(limit = 5) {
    return useQuery({
        queryKey: ['top-apps', limit],
        queryFn: async () => {
            if (UsageStats.isAvailable) {
                const result = await UsageStats.getAppUsage('today')
                if (result.success && result.data && result.data.length > 0) {
                    const mapped = mapNativeAppUsage(result.data)
                    return mapped.sort((a, b) => b.minutesToday - a.minutesToday).slice(0, limit)
                }
            }
            const sorted = [...appUsageData].sort((a, b) => b.minutesToday - a.minutesToday)
            return sorted.slice(0, limit)
        },
        placeholderData: [...appUsageData].sort((a, b) => b.minutesToday - a.minutesToday).slice(0, limit),
        staleTime: 30_000,
    })
}

export function useUsagePermission() {
    return useQuery({
        queryKey: ['usage-permission'],
        queryFn: async () => {
            if (UsageStats.isAvailable) {
                return await UsageStats.checkUsagePermission()
            }
            return false
        },
        staleTime: 5_000,
    })
}
