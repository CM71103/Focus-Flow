import { useState } from 'react'
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Card } from '@/components/ui/Card'
import { ACCENT, ACCENT_DIM, BG, SURFACE, TEXT_PRIMARY, TEXT_SECONDARY, TEXT_TERTIARY, SUCCESS, BORDER } from '@/lib/theme'
import { TAB_BAR_CLEARANCE } from '@/components/TabBar'
import { useWeeklyReport, useHourlyUsage, useCategoryBreakdown, useFocusSessions } from '@/hooks/useUsageStats'
import { formatMinutes } from '@/lib/mockData'

const { width: SW } = Dimensions.get('window')
const CHART_HEIGHT = 180
const BAR_WIDTH = (SW - 80) / 7

export default function StatsScreen() {
    const insets = useSafeAreaInsets()
    const [period, setPeriod] = useState<'week' | 'month'>('week')
    const { data: report } = useWeeklyReport(period)
    const { data: hourly } = useHourlyUsage()
    const { data: categories } = useCategoryBreakdown(period)
    const { data: sessions } = useFocusSessions()

    if (!report) return null

    const maxScreenTime = Math.max(...report.dailyBreakdown.map((d) => d.screenTime))
    const avgScreenTime = Math.round(report.totalScreenTime / 7)
    const avgFocusTime = Math.round(report.focusTime / 7)

    const completedSessions = sessions?.filter((s) => s.completed).length ?? 0
    const totalPoints = sessions?.reduce((sum, s) => sum + s.pointsEarned, 0) ?? 0

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: BG }}
            contentContainerStyle={[s.container, { paddingTop: insets.top + 16, paddingBottom: TAB_BAR_CLEARANCE + 16 }]}
            showsVerticalScrollIndicator={false}
        >
            <View style={s.header}>
                <Text style={s.title}>Statistics</Text>
                <View style={s.periodToggle}>
                    <Pressable onPress={() => setPeriod('week')} style={[s.periodBtn, period === 'week' && s.periodBtnActive]}>
                        <Text style={[s.periodText, period === 'week' && s.periodTextActive]}>Week</Text>
                    </Pressable>
                    <Pressable onPress={() => setPeriod('month')} style={[s.periodBtn, period === 'month' && s.periodBtnActive]}>
                        <Text style={[s.periodText, period === 'month' && s.periodTextActive]}>Month</Text>
                    </Pressable>
                </View>
            </View>

            <View style={s.summaryRow}>
                <View style={[s.summaryCard, s.summaryCardAccent]}>
                    <Text style={s.summaryValue}>{formatMinutes(report.totalScreenTime)}</Text>
                    <Text style={s.summaryLabel}>Total Screen Time</Text>
                </View>
                <View style={[s.summaryCard, s.summaryCardGreen]}>
                    <Text style={s.summaryValue}>{formatMinutes(report.focusTime)}</Text>
                    <Text style={s.summaryLabel}>Focus Time</Text>
                </View>
            </View>

            <View style={s.statsRow}>
                <View style={s.statItem}>
                    <Text style={s.statValue}>{report.sessionsCompleted}</Text>
                    <Text style={s.statLabel}>Sessions</Text>
                </View>
                <View style={s.statDivider} />
                <View style={s.statItem}>
                    <Text style={s.statValue}>{formatMinutes(avgScreenTime)}</Text>
                    <Text style={s.statLabel}>Daily Avg</Text>
                </View>
                <View style={s.statDivider} />
                <View style={s.statItem}>
                    <Text style={s.statValue}>{totalPoints}</Text>
                    <Text style={s.statLabel}>Points</Text>
                </View>
            </View>

            <Text style={s.sectionTitle}>Daily Screen Time</Text>
            <Card style={s.chartCard}>
                <View style={s.chartContainer}>
                    {report.dailyBreakdown.map((day, i) => {
                        const barHeight = (day.screenTime / maxScreenTime) * (CHART_HEIGHT - 40)
                        const focusHeight = (day.focusTime / maxScreenTime) * (CHART_HEIGHT - 40)
                        return (
                            <View key={day.day} style={s.barWrapper}>
                                <View style={s.barStack}>
                                    <View style={[s.barFocus, { height: focusHeight }]} />
                                    <View style={[s.barFill, { height: barHeight - focusHeight }]} />
                                </View>
                                <Text style={s.barLabel}>{day.day}</Text>
                            </View>
                        )
                    })}
                </View>
                <View style={s.chartLegend}>
                    <View style={s.legendItem}>
                        <View style={[s.legendDot, { backgroundColor: ACCENT }]} />
                        <Text style={s.legendText}>Screen Time</Text>
                    </View>
                    <View style={s.legendItem}>
                        <View style={[s.legendDot, { backgroundColor: SUCCESS }]} />
                        <Text style={s.legendText}>Focus Time</Text>
                    </View>
                </View>
            </Card>

            <Text style={s.sectionTitle}>Hourly Usage Today</Text>
            <Card style={s.hourlyCard}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.hourlyScroll}>
                    {hourly?.map((h) => {
                        const maxH = Math.max(...(hourly?.map((x) => x.minutes) || [1]))
                        const hHeight = (h.minutes / maxH) * 80
                        return (
                            <View key={h.hour} style={s.hourlyBar}>
                                <Text style={s.hourlyValue}>{h.minutes}m</Text>
                                <View style={[s.hourlyFill, { height: Math.max(hHeight, 4) }]} />
                                <Text style={s.hourlyLabel}>{h.hour}</Text>
                            </View>
                        )
                    })}
                </ScrollView>
            </Card>

            <Text style={s.sectionTitle}>Category Breakdown</Text>
            <Card style={s.categoryCard}>
                {categories?.map((cat, i) => (
                    <View key={cat.category} style={s.categoryItem}>
                        <View style={s.categoryHeader}>
                            <View style={s.categoryHeaderLeft}>
                                <View style={[s.categoryDot, { backgroundColor: cat.color }]} />
                                <Text style={s.categoryName}>{cat.category}</Text>
                            </View>
                            <Text style={s.categoryMinutes}>{formatMinutes(cat.minutes)}</Text>
                        </View>
                        <View style={s.categoryBarBg}>
                            <View style={[s.categoryBarFill, { width: `${cat.percentage}%`, backgroundColor: cat.color }]} />
                        </View>
                    </View>
                ))}
            </Card>

            <Text style={s.sectionTitle}>Top Distracting Apps</Text>
            <Card style={s.topAppsCard}>
                {report.topApps.slice(0, 5).map((app, i) => (
                    <View key={app.name} style={[s.topAppRow, i < report.topApps.length - 1 && s.topAppDivider]}>
                        <View style={s.topAppRank}>
                            <Text style={s.rankText}>#{i + 1}</Text>
                        </View>
                        <View style={s.topAppInfo}>
                            <Text style={s.topAppName}>{app.name}</Text>
                            <Text style={s.topAppTime}>{formatMinutes(app.minutes)} this week</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={TEXT_TERTIARY} />
                    </View>
                ))}
            </Card>

            <Text style={s.sectionTitle}>Insights</Text>
            <View style={s.insightsContainer}>
                {avgScreenTime > 180 && (
                    <Card style={s.insightCard}>
                        <Ionicons name="trending-up" size={20} color="#f39c12" />
                        <View style={s.insightTextWrap}>
                            <Text style={s.insightTitle}>Above daily goal</Text>
                            <Text style={s.insightDesc}>Your average screen time is {formatMinutes(avgScreenTime - 180)} over your 3h daily goal.</Text>
                        </View>
                    </Card>
                )}
                {report.focusTime > 300 && (
                    <Card style={s.insightCard}>
                        <Ionicons name="trophy" size={20} color={SUCCESS} />
                        <View style={s.insightTextWrap}>
                            <Text style={s.insightTitle}>Great focus streak!</Text>
                            <Text style={s.insightDesc}>You've focused for {formatMinutes(report.focusTime)} this week. Keep it up!</Text>
                        </View>
                    </Card>
                )}
                <Card style={s.insightCard}>
                    <Ionicons name="bulb" size={20} color={ACCENT} />
                    <View style={s.insightTextWrap}>
                        <Text style={s.insightTitle}>Tip</Text>
                        <Text style={s.insightDesc}>Your peak usage is around noon. Try scheduling focus sessions before then.</Text>
                    </View>
                </Card>
            </View>
        </ScrollView>
    )
}

function Pressable({ onPress, style, children }: { onPress: () => void; style: any; children: React.ReactNode }) {
    const { Pressable: RNPressable } = require('react-native')
    return <RNPressable onPress={onPress} style={style}>{children}</RNPressable>
}

const s = StyleSheet.create({
    container: { paddingHorizontal: 20, gap: 16 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: 28, fontWeight: '800', color: TEXT_PRIMARY, letterSpacing: -0.6 },
    periodToggle: { flexDirection: 'row', backgroundColor: 'rgba(26,26,26,0.06)', borderRadius: 12, padding: 2 },
    periodBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10 },
    periodBtnActive: { backgroundColor: ACCENT },
    periodText: { fontSize: 12, fontWeight: '600', color: TEXT_TERTIARY },
    periodTextActive: { color: '#fff' },
    summaryRow: { flexDirection: 'row', gap: 10 },
    summaryCard: { flex: 1, padding: 16, borderRadius: 20, gap: 4, backgroundColor: SURFACE, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
    summaryCardAccent: { borderWidth: 1, borderColor: ACCENT_DIM },
    summaryCardGreen: { borderWidth: 1, borderColor: 'rgba(39,174,96,0.2)' },
    summaryValue: { fontSize: 22, fontWeight: '800', color: TEXT_PRIMARY },
    summaryLabel: { fontSize: 12, color: TEXT_SECONDARY },
    statsRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: SURFACE, borderRadius: 16, paddingVertical: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
    statItem: { flex: 1, alignItems: 'center', gap: 2 },
    statDivider: { width: 1, height: 24, backgroundColor: BORDER },
    statValue: { fontSize: 18, fontWeight: '700', color: TEXT_PRIMARY },
    statLabel: { fontSize: 11, color: TEXT_TERTIARY },
    sectionTitle: { fontSize: 11, fontWeight: '700', color: TEXT_TERTIARY, letterSpacing: 0.8, textTransform: 'uppercase', marginTop: 4 },
    chartCard: { paddingVertical: 16, gap: 12 },
    chartContainer: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: CHART_HEIGHT, paddingHorizontal: 8 },
    barWrapper: { alignItems: 'center', gap: 6 },
    barStack: { width: BAR_WIDTH * 0.5, borderRadius: 4, overflow: 'hidden', flexDirection: 'column-reverse' },
    barFill: { backgroundColor: ACCENT, borderRadius: 4 },
    barFocus: { backgroundColor: SUCCESS, borderRadius: 4 },
    barLabel: { fontSize: 11, color: TEXT_TERTIARY, fontWeight: '600' },
    chartLegend: { flexDirection: 'row', justifyContent: 'center', gap: 20 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    legendDot: { width: 8, height: 8, borderRadius: 4 },
    legendText: { fontSize: 11, color: TEXT_SECONDARY },
    hourlyCard: { paddingVertical: 12 },
    hourlyScroll: { paddingHorizontal: 12, gap: 8 },
    hourlyBar: { alignItems: 'center', gap: 4, width: 40 },
    hourlyValue: { fontSize: 10, color: TEXT_TERTIARY },
    hourlyFill: { width: 20, borderRadius: 4, backgroundColor: ACCENT_DIM },
    hourlyLabel: { fontSize: 10, color: TEXT_TERTIARY, fontWeight: '500' },
    categoryCard: { paddingVertical: 8, paddingHorizontal: 0 },
    categoryItem: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
    categoryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    categoryHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    categoryDot: { width: 10, height: 10, borderRadius: 5 },
    categoryName: { fontSize: 14, color: TEXT_PRIMARY, fontWeight: '500' },
    categoryMinutes: { fontSize: 13, fontWeight: '600', color: TEXT_PRIMARY },
    categoryBarBg: { height: 6, borderRadius: 3, backgroundColor: 'rgba(26,26,26,0.06)' },
    categoryBarFill: { height: 6, borderRadius: 3 },
    topAppsCard: { paddingVertical: 4, paddingHorizontal: 0 },
    topAppRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
    topAppDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(26,26,26,0.06)' },
    topAppRank: { width: 28, height: 28, borderRadius: 8, backgroundColor: ACCENT_DIM, alignItems: 'center', justifyContent: 'center' },
    rankText: { fontSize: 11, fontWeight: '700', color: ACCENT },
    topAppInfo: { flex: 1, gap: 2 },
    topAppName: { fontSize: 14, color: TEXT_PRIMARY, fontWeight: '600' },
    topAppTime: { fontSize: 12, color: TEXT_SECONDARY },
    insightsContainer: { gap: 10 },
    insightCard: { flexDirection: 'row', gap: 12, paddingVertical: 14 },
    insightTextWrap: { flex: 1, gap: 4 },
    insightTitle: { fontSize: 14, fontWeight: '700', color: TEXT_PRIMARY },
    insightDesc: { fontSize: 12, color: TEXT_SECONDARY, lineHeight: 18 },
})
