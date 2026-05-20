import { useState } from 'react'
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Card } from '@/components/ui/Card'
import { ACCENT, ACCENT_DIM, BG, SURFACE, TEXT_PRIMARY, TEXT_SECONDARY, TEXT_TERTIARY, SUCCESS, WARNING, BORDER } from '@/lib/theme'
import { TAB_BAR_CLEARANCE } from '@/components/TabBar'
import { useFocus } from '@/contexts/FocusContext'
import { useAchievements, useStreakInfo } from '@/hooks/useRewards'
import { getTierColor, formatMinutes } from '@/lib/mockData'
import type { AchievementTier } from '@/lib/mockData'

const { width: SW } = Dimensions.get('window')

export default function RewardsScreen() {
    const insets = useSafeAreaInsets()
    const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all')
    const { totalPoints, streak, todayPoints, todayFocusMinutes } = useFocus()
    const { data: achievements = [] } = useAchievements()
    const { data: streakData } = useStreakInfo()

    const unlockedCount = achievements.filter((a) => a.unlocked).length
    const totalCount = achievements.length
    const filteredAchievements = achievements.filter((a) => {
        if (filter === 'unlocked') return a.unlocked
        if (filter === 'locked') return !a.unlocked
        return true
    })

    const nextLevelPoints = Math.ceil(totalPoints / 500) * 500
    const prevLevelPoints = Math.floor(totalPoints / 500) * 500
    const levelProgress = ((totalPoints - prevLevelPoints) / (nextLevelPoints - prevLevelPoints)) * 100
    const level = Math.floor(totalPoints / 500) + 1

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: BG }}
            contentContainerStyle={[s.container, { paddingTop: insets.top + 16, paddingBottom: TAB_BAR_CLEARANCE + 16 }]}
            showsVerticalScrollIndicator={false}
        >
            <View style={s.header}>
                <Text style={s.title}>Rewards</Text>
            </View>

            <Card style={s.pointsCard}>
                <LinearGradientWrapper style={s.pointsGradient}>
                    <View style={s.pointsTop}>
                        <View>
                            <Text style={s.pointsLabel}>Total Points</Text>
                            <Text style={s.pointsValue}>{totalPoints.toLocaleString()}</Text>
                        </View>
                        <View style={s.pointsBadge}>
                            <Ionicons name="star" size={16} color="#fff" />
                            <Text style={s.pointsLevel}>Level {level}</Text>
                        </View>
                    </View>
                    <View style={s.pointsProgressBg}>
                        <View style={[s.pointsProgressFill, { width: `${levelProgress}%` }]} />
                    </View>
                    <Text style={s.pointsNext}>{nextLevelPoints - totalPoints} points to Level {level + 1}</Text>
                </LinearGradientWrapper>
            </Card>

            <View style={s.todayRow}>
                <View style={s.todayCard}>
                    <Ionicons name="star-outline" size={18} color={ACCENT} />
                    <Text style={s.todayValue}>{todayPoints}</Text>
                    <Text style={s.todayLabel}>Today</Text>
                </View>
                <View style={s.todayCard}>
                    <Ionicons name="flame-outline" size={18} color={WARNING} />
                    <Text style={s.todayValue}>{streak}</Text>
                    <Text style={s.todayLabel}>Streak</Text>
                </View>
                <View style={s.todayCard}>
                    <Ionicons name="timer-outline" size={18} color={SUCCESS} />
                    <Text style={s.todayValue}>{formatMinutes(todayFocusMinutes)}</Text>
                    <Text style={s.todayLabel}>Focus</Text>
                </View>
            </View>

            <Text style={s.sectionTitle}>Streak Calendar</Text>
            <Card style={s.streakCard}>
                <View style={s.streakHeader}>
                    <View style={s.streakInfo}>
                        <Ionicons name="flame" size={24} color={WARNING} />
                        <View>
                            <Text style={s.streakCurrent}>{streakData?.current ?? streak} day streak</Text>
                            <Text style={s.streakBest}>Best: {streakData?.longest ?? 0} days</Text>
                        </View>
                    </View>
                </View>
                <View style={s.streakDays}>
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
                        const isActive = i < (streakData?.current ?? streak) % 7 || (streakData?.current ?? streak) >= 7
                        return (
                            <View key={i} style={s.streakDayCol}>
                                <View style={[s.streakDay, isActive && s.streakDayActive]}>
                                    {isActive && <Ionicons name="checkmark" size={14} color="#fff" />}
                                </View>
                                <Text style={s.streakDayLabel}>{day}</Text>
                            </View>
                        )
                    })}
                </View>
            </Card>

            <Text style={s.sectionTitle}>Achievements</Text>
            <View style={s.achievementFilter}>
                {(['all', 'unlocked', 'locked'] as const).map((f) => (
                    <Pressable
                        key={f}
                        onPress={() => setFilter(f)}
                        style={[s.filterBtn, filter === f && s.filterBtnActive]}
                    >
                        <Text style={[s.filterText, filter === f && s.filterTextActive]}>
                            {f === 'all' ? `All (${totalCount})` : f === 'unlocked' ? `Unlocked (${unlockedCount})` : `Locked (${totalCount - unlockedCount})`}
                        </Text>
                    </Pressable>
                ))}
            </View>

            <View style={s.achievementsGrid}>
                {filteredAchievements.map((ach) => (
                    <Card key={ach.id} style={[s.achievementCard, !ach.unlocked && s.achievementLocked]}>
                        <View style={[s.achievementIcon, { backgroundColor: ach.unlocked ? getTierColor(ach.tier) + '20' : 'rgba(26,26,26,0.04)' }]}>
                            <Ionicons
                                name={ach.icon as any}
                                size={24}
                                color={ach.unlocked ? getTierColor(ach.tier) : TEXT_TERTIARY}
                            />
                        </View>
                        <Text style={[s.achievementTitle, !ach.unlocked && s.achievementTitleLocked]} numberOfLines={1}>
                            {ach.title}
                        </Text>
                        <Text style={s.achievementDesc} numberOfLines={2}>{ach.description}</Text>
                        <View style={s.achievementFooter}>
                            <View style={[s.tierBadge, { backgroundColor: getTierColor(ach.tier) + '20' }]}>
                                <Text style={[s.tierText, { color: getTierColor(ach.tier) }]}>{ach.tier}</Text>
                            </View>
                            <Text style={s.achievementPoints}>+{ach.points} pts</Text>
                        </View>
                        {ach.unlocked && ach.unlockedAt && (
                            <View style={s.unlockedBadge}>
                                <Ionicons name="checkmark-circle" size={12} color={SUCCESS} />
                                <Text style={s.unlockedText}>Unlocked</Text>
                            </View>
                        )}
                    </Card>
                ))}
            </View>

            <Text style={s.sectionTitle}>Points History</Text>
            <Card style={s.pointsHistoryCard}>
                <View style={s.pointsHistoryRow}>
                    <View style={s.pointsHistoryIcon}>
                        <Ionicons name="timer" size={16} color={SUCCESS} />
                    </View>
                    <View style={s.pointsHistoryInfo}>
                        <Text style={s.pointsHistoryTitle}>Focus sessions completed</Text>
                        <Text style={s.pointsHistoryDesc}>2 pts per minute of focus</Text>
                    </View>
                    <Text style={s.pointsHistoryValue}>+{todayFocusMinutes * 2}</Text>
                </View>
                <View style={s.pointsHistoryRow}>
                    <View style={s.pointsHistoryIcon}>
                        <Ionicons name="flame" size={16} color={WARNING} />
                    </View>
                    <View style={s.pointsHistoryInfo}>
                        <Text style={s.pointsHistoryTitle}>Streak bonus</Text>
                        <Text style={s.pointsHistoryDesc}>{streak} day streak multiplier</Text>
                    </View>
                    <Text style={s.pointsHistoryValue}>+{streak * 10}</Text>
                </View>
            </Card>
        </ScrollView>
    )
}

function LinearGradientWrapper({ style, children }: { style: any; children: React.ReactNode }) {
    const { LinearGradient } = require('expo-linear-gradient')
    return (
        <LinearGradient colors={['rgba(201,169,110,0.15)', 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={style}>
            {children}
        </LinearGradient>
    )
}

function Pressable({ onPress, style, children }: { onPress: () => void; style: any; children: React.ReactNode }) {
    const { Pressable: RNPressable } = require('react-native')
    return <RNPressable onPress={onPress} style={style}>{children}</RNPressable>
}

const s = StyleSheet.create({
    container: { paddingHorizontal: 20, gap: 16 },
    header: { gap: 4 },
    title: { fontSize: 28, fontWeight: '800', color: TEXT_PRIMARY, letterSpacing: -0.6 },
    pointsCard: { padding: 0, overflow: 'hidden', borderRadius: 24 },
    pointsGradient: { padding: 20, gap: 12 },
    pointsTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    pointsLabel: { fontSize: 13, color: TEXT_SECONDARY, fontWeight: '500' },
    pointsValue: { fontSize: 36, fontWeight: '800', color: TEXT_PRIMARY, letterSpacing: -1 },
    pointsBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: ACCENT, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    pointsLevel: { fontSize: 13, fontWeight: '700', color: '#fff' },
    pointsProgressBg: { height: 8, borderRadius: 4, backgroundColor: 'rgba(26,26,26,0.08)' },
    pointsProgressFill: { height: 8, borderRadius: 4, backgroundColor: ACCENT },
    pointsNext: { fontSize: 12, color: TEXT_SECONDARY },
    todayRow: { flexDirection: 'row', gap: 10 },
    todayCard: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 20, gap: 4, backgroundColor: SURFACE, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
    todayValue: { fontSize: 20, fontWeight: '800', color: TEXT_PRIMARY },
    todayLabel: { fontSize: 11, color: TEXT_TERTIARY, fontWeight: '600' },
    sectionTitle: { fontSize: 11, fontWeight: '700', color: TEXT_TERTIARY, letterSpacing: 0.8, textTransform: 'uppercase', marginTop: 4 },
    streakCard: { padding: 16, gap: 14 },
    streakHeader: {},
    streakInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    streakCurrent: { fontSize: 16, fontWeight: '700', color: TEXT_PRIMARY },
    streakBest: { fontSize: 12, color: TEXT_SECONDARY },
    streakDays: { flexDirection: 'row', justifyContent: 'space-around' },
    streakDayCol: { alignItems: 'center', gap: 6 },
    streakDay: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(26,26,26,0.06)', alignItems: 'center', justifyContent: 'center' },
    streakDayActive: { backgroundColor: WARNING },
    streakDayLabel: { fontSize: 11, color: TEXT_TERTIARY, fontWeight: '600' },
    achievementFilter: { flexDirection: 'row', gap: 8 },
    filterBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14, backgroundColor: 'rgba(26,26,26,0.06)' },
    filterBtnActive: { backgroundColor: ACCENT_DIM },
    filterText: { fontSize: 12, fontWeight: '600', color: TEXT_TERTIARY },
    filterTextActive: { color: ACCENT },
    achievementsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    achievementCard: { width: (SW - 50) / 2, padding: 14, gap: 10, position: 'relative' },
    achievementLocked: { opacity: 0.5 },
    achievementIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    achievementTitle: { fontSize: 14, fontWeight: '700', color: TEXT_PRIMARY },
    achievementTitleLocked: { color: TEXT_TERTIARY },
    achievementDesc: { fontSize: 11, color: TEXT_SECONDARY, lineHeight: 16 },
    achievementFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    tierBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    tierText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
    achievementPoints: { fontSize: 12, fontWeight: '600', color: ACCENT },
    unlockedBadge: { position: 'absolute', top: 10, right: 10, flexDirection: 'row', alignItems: 'center', gap: 4 },
    unlockedText: { fontSize: 10, fontWeight: '600', color: SUCCESS },
    pointsHistoryCard: { paddingVertical: 4, paddingHorizontal: 0 },
    pointsHistoryRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
    pointsHistoryIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(39,174,96,0.1)', alignItems: 'center', justifyContent: 'center' },
    pointsHistoryInfo: { flex: 1, gap: 2 },
    pointsHistoryTitle: { fontSize: 13, fontWeight: '600', color: TEXT_PRIMARY },
    pointsHistoryDesc: { fontSize: 11, color: TEXT_SECONDARY },
    pointsHistoryValue: { fontSize: 14, fontWeight: '700', color: SUCCESS },
})
