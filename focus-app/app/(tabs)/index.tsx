import { useMemo, useState } from 'react'
import { View, ScrollView, StyleSheet, RefreshControl, Pressable } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useQueryClient } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import { Svg, Circle, G } from 'react-native-svg'
import { Text } from '@/components/ui/Text'
import { Card } from '@/components/ui/Card'
import { ACCENT, ACCENT_DIM, BG, SURFACE, TEXT_PRIMARY, TEXT_SECONDARY, TEXT_TERTIARY, SUCCESS, WARNING, ERROR } from '@/lib/theme'
import { TAB_BAR_CLEARANCE } from '@/components/TabBar'
import { useFocus } from '@/contexts/FocusContext'
import { useTodayScreenTime, useTopApps, useCategoryBreakdown } from '@/hooks/useUsageStats'
import { useDailyGoals } from '@/hooks/useGoals'
import { formatMinutes, getCategoryColor } from '@/lib/mockData'
import UsagePermissionPrompt from '@/components/UsagePermissionPrompt'

const PROGRESS_RADIUS = 45
const PROGRESS_CIRCUMFERENCE = 2 * Math.PI * PROGRESS_RADIUS

export default function DashboardScreen() {
    const insets = useSafeAreaInsets()
    const [refreshing, setRefreshing] = useState(false)
    const queryClient = useQueryClient()
    const { todayPoints, streak, todayFocusMinutes, todaySessionsCompleted, sessionState } = useFocus()
    const { data: screenTime = 0 } = useTodayScreenTime()
    const { data: topApps = [] } = useTopApps(4)
    const { data: categories = [] } = useCategoryBreakdown()
    const { data: goals = [] } = useDailyGoals()

    const greeting = (() => {
        const h = new Date().getHours()
        if (h < 12) return 'Good morning'
        if (h < 17) return 'Good afternoon'
        return 'Good evening'
    })()

    const completedGoals = goals.filter((g) => g.completed).length
    const totalGoals = goals.length
    const screenTimeGoal = 180
    const screenTimePercent = Math.min((screenTime / screenTimeGoal) * 100, 100)
    const focusPercent = Math.min((todayFocusMinutes / 60) * 100, 100)
    const focusStrokeOffset = PROGRESS_CIRCUMFERENCE - (focusPercent / 100) * PROGRESS_CIRCUMFERENCE

    const onRefresh = async () => {
        setRefreshing(true)
        await queryClient.invalidateQueries({ queryKey: ['app-usage'] })
        await queryClient.invalidateQueries({ queryKey: ['today-screen-time'] })
        setRefreshing(false)
    }

    return (
        <>
        <ScrollView
            style={{ flex: 1, backgroundColor: BG }}
            contentContainerStyle={[s.container, { paddingTop: insets.top + 16, paddingBottom: TAB_BAR_CLEARANCE + 16 }]}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT} />}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <View style={s.header}>
                <View style={s.headerTop}>
                    <View style={s.avatarRow}>
                        <View style={s.avatar}>
                            <Text style={s.avatarText}>M</Text>
                        </View>
                        <View>
                            <Text style={s.greeting}>Good morning,</Text>
                            <Text style={s.name}>Moinuddin.</Text>
                        </View>
                    </View>
                    {sessionState === 'running' || sessionState === 'paused' ? (
                        <Pressable onPress={() => router.push('/(tabs)/focus')} style={s.liveBadge}>
                            <View style={s.liveDot} />
                            <Text style={s.liveText}>Focusing</Text>
                        </Pressable>
                    ) : (
                        <Pressable style={s.notifBtn}>
                            <Ionicons name="notifications-outline" size={22} color={TEXT_SECONDARY} />
                        </Pressable>
                    )}
                </View>
                <Text style={s.subtitle}>Here is your daily focus overview.</Text>
            </View>

            {/* Daily Focus Progress Card */}
            <Card style={s.progressCard}>
                <View style={s.progressRow}>
                    <View style={s.progressCircleWrap}>
                        <Svg width={PROGRESS_RADIUS * 2 + 16} height={PROGRESS_RADIUS * 2 + 16}>
                            <G rotation="-90" origin={`${PROGRESS_RADIUS + 8}, ${PROGRESS_RADIUS + 8}`}>
                                <Circle
                                    cx={PROGRESS_RADIUS + 8}
                                    cy={PROGRESS_RADIUS + 8}
                                    r={PROGRESS_RADIUS}
                                    fill="none"
                                    stroke="rgba(26,26,26,0.06)"
                                    strokeWidth={8}
                                />
                                <Circle
                                    cx={PROGRESS_RADIUS + 8}
                                    cy={PROGRESS_RADIUS + 8}
                                    r={PROGRESS_RADIUS}
                                    fill="none"
                                    stroke={ACCENT}
                                    strokeWidth={8}
                                    strokeLinecap="round"
                                    strokeDasharray={PROGRESS_CIRCUMFERENCE}
                                    strokeDashoffset={focusStrokeOffset}
                                />
                            </G>
                        </Svg>
                        <View style={s.progressCenter}>
                            <Text style={s.progressPercent}>{Math.round(focusPercent)}%</Text>
                            <Text style={s.progressLabel}>Focus</Text>
                        </View>
                    </View>
                    <View style={s.progressInfo}>
                        <Text style={s.progressTitle}>Daily Focus Progress</Text>
                        <Text style={s.progressDesc}>
                            {focusPercent >= 80 ? 'Great job! You\'re crushing your focus goals today.' :
                             focusPercent >= 50 ? 'You\'re on track to meet your deep work goals today.' :
                             'Consider a short focus session to boost your progress.'}
                        </Text>
                        <Pressable
                            onPress={() => router.push('/(tabs)/focus')}
                            style={({ pressed }) => [s.startTimerBtn, pressed && { opacity: 0.85 }]}
                        >
                            <Ionicons name="timer" size={16} color="#fff" />
                            <Text style={s.startTimerText}>Start Focus Timer</Text>
                        </Pressable>
                    </View>
                </View>
            </Card>

            {/* Stats Row */}
            <View style={s.statsRow}>
                <View style={s.statCard}>
                    <Ionicons name="star" size={18} color={ACCENT} />
                    <Text style={s.statValue}>{todayPoints}</Text>
                    <Text style={s.statLabel}>Points</Text>
                </View>
                <View style={s.statCard}>
                    <Ionicons name="flame" size={18} color={WARNING} />
                    <Text style={s.statValue}>{streak}</Text>
                    <Text style={s.statLabel}>Streak</Text>
                </View>
                <View style={s.statCard}>
                    <Ionicons name="timer" size={18} color={SUCCESS} />
                    <Text style={s.statValue}>{todayFocusMinutes}m</Text>
                    <Text style={s.statLabel}>Focus</Text>
                </View>
            </View>

            {/* Screen Time Card */}
            <Text style={s.sectionTitle}>Screen Time Today</Text>
            <Card style={s.screenTimeCard}>
                <View style={s.screenTimeHeader}>
                    <Text style={s.screenTimeValue}>{formatMinutes(screenTime)}</Text>
                    <Text style={[s.screenTimeLabel, screenTime > screenTimeGoal && { color: ERROR }]}>
                        {screenTime > screenTimeGoal ? `${formatMinutes(screenTime - screenTimeGoal)} over goal` : `${formatMinutes(screenTimeGoal - screenTime)} remaining`}
                    </Text>
                </View>
                <View style={s.progressBarBg}>
                    <View style={[s.progressBarFill, { width: `${screenTimePercent}%`, backgroundColor: screenTime > screenTimeGoal ? ERROR : ACCENT }]} />
                </View>
                <Text style={s.screenTimeGoalText}>Goal: {formatMinutes(screenTimeGoal)}</Text>
            </Card>

            {/* AI Insights Card */}
            <Text style={s.sectionTitle}>AI Insights</Text>
            <Card style={s.insightsCard}>
                <View style={s.insightsIcon}>
                    <Ionicons name="sparkles" size={20} color={ACCENT} />
                </View>
                <View style={s.insightsContent}>
                    <Text style={s.insightsTitle}>Your peak productivity typically occurs between 10 AM and 12 PM.</Text>
                    <Text style={s.insightsDesc}>Try scheduling your most important tasks during this window for maximum efficiency.</Text>
                </View>
            </Card>

            {/* Top Apps */}
            <Text style={s.sectionTitle}>Top Apps</Text>
            <View style={s.appGrid}>
                {topApps.map((app) => (
                    <Card key={app.id} style={s.appCard}>
                        <View style={[s.appIcon, { backgroundColor: getCategoryColor(app.category) + '15' }]}>
                            <Ionicons name={app.icon as any} size={20} color={getCategoryColor(app.category)} />
                        </View>
                        <Text style={s.appName} numberOfLines={1}>{app.appName}</Text>
                        <Text style={s.appTime}>{formatMinutes(app.minutesToday)}</Text>
                    </Card>
                ))}
            </View>

            {/* CTA Button */}
            <Pressable
                onPress={() => router.push('/(tabs)/focus')}
                style={({ pressed }) => [s.focusCta, pressed && { opacity: 0.9 }]}
            >
                <Text style={s.focusCtaText}>Design Your Focus</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
            </Pressable>
        </ScrollView>
        <UsagePermissionPrompt onGranted={() => queryClient.invalidateQueries({ queryKey: ['app-usage'] })} />
        </>
    )
}

const s = StyleSheet.create({
    container: { paddingHorizontal: 20, gap: 16 },
    header: { gap: 4 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: ACCENT_DIM, alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontSize: 16, fontWeight: '700', color: ACCENT },
    greeting: { fontSize: 14, color: TEXT_SECONDARY, fontWeight: '500' },
    name: { fontSize: 24, fontWeight: '800', color: TEXT_PRIMARY, letterSpacing: -0.5 },
    subtitle: { fontSize: 14, color: TEXT_SECONDARY, marginTop: 2 },
    notifBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: SURFACE, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
    liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: ACCENT_DIM, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: ACCENT },
    liveText: { fontSize: 12, fontWeight: '600', color: ACCENT },
    progressCard: { padding: 0, overflow: 'hidden' },
    progressRow: { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 16 },
    progressCircleWrap: { width: PROGRESS_RADIUS * 2 + 16, height: PROGRESS_RADIUS * 2 + 16, alignItems: 'center', justifyContent: 'center' },
    progressCenter: { position: 'absolute', alignItems: 'center' },
    progressPercent: { fontSize: 22, fontWeight: '800', color: TEXT_PRIMARY },
    progressLabel: { fontSize: 11, color: TEXT_TERTIARY, fontWeight: '600' },
    progressInfo: { flex: 1, gap: 6 },
    progressTitle: { fontSize: 16, fontWeight: '700', color: TEXT_PRIMARY },
    progressDesc: { fontSize: 13, color: TEXT_SECONDARY, lineHeight: 18 },
    startTimerBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: ACCENT, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, alignSelf: 'flex-start', marginTop: 4 },
    startTimerText: { fontSize: 13, fontWeight: '600', color: '#fff' },
    statsRow: { flexDirection: 'row', gap: 10 },
    statCard: { flex: 1, alignItems: 'center', paddingVertical: 16, backgroundColor: SURFACE, borderRadius: 20, gap: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
    statValue: { fontSize: 20, fontWeight: '800', color: TEXT_PRIMARY },
    statLabel: { fontSize: 11, color: TEXT_TERTIARY, fontWeight: '600' },
    sectionTitle: { fontSize: 11, fontWeight: '700', color: TEXT_TERTIARY, letterSpacing: 0.8, textTransform: 'uppercase', marginTop: 4 },
    screenTimeCard: { paddingVertical: 16, gap: 10 },
    screenTimeHeader: { gap: 2 },
    screenTimeValue: { fontSize: 32, fontWeight: '800', color: TEXT_PRIMARY, letterSpacing: -1 },
    screenTimeLabel: { fontSize: 13, color: TEXT_SECONDARY },
    progressBarBg: { height: 8, borderRadius: 4, backgroundColor: 'rgba(26,26,26,0.06)' },
    progressBarFill: { height: 8, borderRadius: 4 },
    screenTimeGoalText: { fontSize: 12, color: TEXT_TERTIARY },
    insightsCard: { flexDirection: 'row', gap: 14, paddingVertical: 16 },
    insightsIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: ACCENT_DIM, alignItems: 'center', justifyContent: 'center' },
    insightsContent: { flex: 1, gap: 4 },
    insightsTitle: { fontSize: 14, fontWeight: '600', color: TEXT_PRIMARY, lineHeight: 20 },
    insightsDesc: { fontSize: 12, color: TEXT_SECONDARY, lineHeight: 18 },
    appGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    appCard: { width: '48%', alignItems: 'center', paddingVertical: 16, gap: 8 },
    appIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    appName: { fontSize: 12, fontWeight: '600', color: TEXT_PRIMARY, textAlign: 'center', maxWidth: 80 },
    appTime: { fontSize: 11, color: TEXT_TERTIARY },
    focusCta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: TEXT_PRIMARY, paddingVertical: 16, borderRadius: 28, marginTop: 8 },
    focusCtaText: { fontSize: 16, fontWeight: '700', color: '#fff' },
})
