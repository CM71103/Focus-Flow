import { useState, useEffect } from 'react'
import { View, ScrollView, StyleSheet, Pressable, Switch, Alert } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Card } from '@/components/ui/Card'
import { ACCENT, ACCENT_DIM, BG, SURFACE, TEXT_PRIMARY, TEXT_SECONDARY, TEXT_TERTIARY, BORDER, SUCCESS, WARNING } from '@/lib/theme'
import { TAB_BAR_CLEARANCE } from '@/components/TabBar'
import { useFocus } from '@/contexts/FocusContext'
import { useProfile } from '@/hooks/useProfile'
import { useDailyGoals } from '@/hooks/useGoals'
import { useProfileSettings } from '@/hooks/useProfileSettings'
import { formatMinutes } from '@/lib/mockData'
import { AppBlocking } from '@/lib/appBlocking'

export default function ProfileScreen() {
    const insets = useSafeAreaInsets()
    const { totalPoints, streak } = useFocus()
    const { data: profile } = useProfile()
    const { data: goals = [] } = useDailyGoals()
    const { settings, updateSetting, loaded } = useProfileSettings()
    const [serviceEnabled, setServiceEnabled] = useState(false)

    useEffect(() => {
        AppBlocking.isServiceEnabled().then(setServiceEnabled)
    }, [])

    const handleTestBlocking = async () => {
        if (!serviceEnabled) {
            Alert.alert('Service Not Enabled', 'Please enable the Accessibility Service first.', [{ text: 'OK' }])
            return
        }
        await AppBlocking.setBlockedApps(['com.android.chrome'])
        Alert.alert(
            'Test Blocking Active',
            'Try opening Chrome. You should be redirected back to FocusFlow.',
            [{ text: 'Stop Test', onPress: () => AppBlocking.stopBlocking() }]
        )
    }

    if (!loaded) return null

    const completedGoals = goals.filter((g) => g.completed).length

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: BG }}
            contentContainerStyle={[s.container, { paddingTop: insets.top + 16, paddingBottom: TAB_BAR_CLEARANCE + 16 }]}
            showsVerticalScrollIndicator={false}
        >
            <View style={s.header}>
                <Text style={s.title}>Profile</Text>
            </View>

            <Card style={s.profileCard}>
                <View style={s.profileTop}>
                    <View style={s.avatar}>
                        <Text style={s.avatarText}>{profile?.initials ?? 'U'}</Text>
                    </View>
                    <View style={s.profileInfo}>
                        <Text style={s.profileName}>{profile?.fullName ?? 'User'}</Text>
                        <Text style={s.profileEmail}>{profile?.email ?? ''}</Text>
                    </View>
                </View>
                <View style={s.profileStats}>
                    <View style={s.profileStat}>
                        <Text style={s.profileStatValue}>{totalPoints.toLocaleString()}</Text>
                        <Text style={s.profileStatLabel}>Points</Text>
                    </View>
                    <View style={s.profileStatDivider} />
                    <View style={s.profileStat}>
                        <Text style={s.profileStatValue}>{streak}</Text>
                        <Text style={s.profileStatLabel}>Streak</Text>
                    </View>
                    <View style={s.profileStatDivider} />
                    <View style={s.profileStat}>
                        <Text style={s.profileStatValue}>{completedGoals}</Text>
                        <Text style={s.profileStatLabel}>Goals</Text>
                    </View>
                </View>
            </Card>

            <Text style={s.sectionTitle}>Daily Goals</Text>
            <Card style={s.goalsCard}>
                {goals.map((goal, i) => (
                    <View key={goal.id} style={[s.goalRow, i < goals.length - 1 && s.goalDivider]}>
                        <View style={s.goalLeft}>
                            <View style={[s.goalIcon, { backgroundColor: goal.completed ? 'rgba(39,174,96,0.1)' : ACCENT_DIM }]}>
                                <Ionicons
                                    name={goal.type === 'screen-time' ? 'phone-portrait-outline' : goal.type === 'focus-sessions' ? 'timer-outline' : 'lock-closed-outline'}
                                    size={18}
                                    color={goal.completed ? SUCCESS : ACCENT}
                                />
                            </View>
                            <View>
                                <Text style={s.goalTitle}>
                                    {goal.type === 'screen-time' ? 'Screen Time Limit' : goal.type === 'focus-sessions' ? 'Focus Sessions' : 'App Limit'}
                                </Text>
                                <Text style={s.goalDetail}>
                                    {goal.type === 'screen-time' ? `${formatMinutes(goal.current)} / ${formatMinutes(goal.target)}` :
                                     goal.type === 'focus-sessions' ? `${goal.current} / ${goal.target} sessions` :
                                     `${goal.current} / ${goal.target} ${goal.unit}`}
                                </Text>
                            </View>
                        </View>
                        {goal.completed ? (
                            <Ionicons name="checkmark-circle" size={22} color={SUCCESS} />
                        ) : (
                            <View style={s.goalProgressRing}>
                                <Text style={s.goalProgressText}>{Math.round((goal.current / goal.target) * 100)}%</Text>
                            </View>
                        )}
                    </View>
                ))}
            </Card>

            <Text style={s.sectionTitle}>Focus Settings</Text>
            <Card style={s.settingsCard}>
                <SettingRow
                    icon="notifications-outline"
                    title="Block Notifications"
                    subtitle="Silence notifications during focus sessions"
                    value={settings.blockNotifications}
                    onToggle={(v) => updateSetting('blockNotifications', v)}
                />
                <View style={s.settingsDivider} />
                <SettingRow
                    icon="lock-closed-outline"
                    title="Strict Mode"
                    subtitle="Prevent exiting focus session early"
                    value={settings.strictMode}
                    onToggle={(v) => updateSetting('strictMode', v)}
                />
                <View style={s.settingsDivider} />
                <SettingRow
                    icon="alarm-outline"
                    title="Daily Reminder"
                    subtitle="Get reminded to start a focus session"
                    value={settings.dailyReminder}
                    onToggle={(v) => updateSetting('dailyReminder', v)}
                />
                <View style={s.settingsDivider} />
                <SettingRow
                    icon="mail-outline"
                    title="Weekly Report"
                    subtitle="Receive a weekly screen time summary"
                    value={settings.weeklyReport}
                    onToggle={(v) => updateSetting('weeklyReport', v)}
                />
            </Card>

            <Text style={s.sectionTitle}>Preferences</Text>
            <Card style={s.settingsCard}>
                <SettingRow
                    icon="volume-high-outline"
                    title="Sound Effects"
                    subtitle="Play sounds for session start/end"
                    value={settings.soundEnabled}
                    onToggle={(v) => updateSetting('soundEnabled', v)}
                />
                <View style={s.settingsDivider} />
                <SettingRow
                    icon="hand-left-outline"
                    title="Haptic Feedback"
                    subtitle="Vibrate on session events"
                    value={settings.hapticsEnabled}
                    onToggle={(v) => updateSetting('hapticsEnabled', v)}
                />
            </Card>

            <Text style={s.sectionTitle}>App Blocking</Text>
            <Card style={s.settingsCard}>
                <View style={s.settingRow}>
                    <View style={s.settingIcon}>
                        <Ionicons name={serviceEnabled ? 'checkmark-circle' : 'close-circle'} size={20} color={serviceEnabled ? SUCCESS : WARNING} />
                    </View>
                    <View style={s.settingInfo}>
                        <Text style={s.settingTitle}>Accessibility Service</Text>
                        <Text style={s.settingSubtitle}>{serviceEnabled ? 'Enabled - App blocking active' : 'Not enabled - Tap to enable'}</Text>
                    </View>
                    {!serviceEnabled && (
                        <Pressable onPress={() => AppBlocking.startService()} style={s.enableBtn}>
                            <Text style={s.enableBtnText}>Enable</Text>
                        </Pressable>
                    )}
                </View>
                <View style={s.settingsDivider} />
                <PressableRow icon="shield-checkmark-outline" title="Test App Blocking" onPress={handleTestBlocking} />
            </Card>

            <Text style={s.sectionTitle}>App</Text>
            <Card style={s.appSettingsCard}>
                <PressableRow icon="information-circle-outline" title="About FocusFlow" onPress={() => {}} />
                <View style={s.appSettingsDivider} />
                <PressableRow icon="shield-checkmark-outline" title="Privacy Policy" onPress={() => router.push('/privacy')} />
                <View style={s.appSettingsDivider} />
                <PressableRow icon="document-text-outline" title="Terms of Service" onPress={() => router.push('/terms')} />
                <View style={s.appSettingsDivider} />
                <PressableRow icon="help-circle-outline" title="Help & Support" onPress={() => router.push('/support')} />
            </Card>

            <View style={s.versionText}>
                <Text style={s.version}>FocusFlow v1.0.0</Text>
            </View>
        </ScrollView>
    )
}

function SettingRow({ icon, title, subtitle, value, onToggle }: { icon: string; title: string; subtitle: string; value: boolean; onToggle: (v: boolean) => void }) {
    return (
        <View style={s.settingRow}>
            <View style={s.settingIcon}>
                <Ionicons name={icon as any} size={20} color={ACCENT} />
            </View>
            <View style={s.settingInfo}>
                <Text style={s.settingTitle}>{title}</Text>
                <Text style={s.settingSubtitle}>{subtitle}</Text>
            </View>
            <Switch
                value={value}
                onValueChange={onToggle}
                trackColor={{ false: 'rgba(26,26,26,0.1)', true: ACCENT }}
                thumbColor="#fff"
            />
        </View>
    )
}

function PressableRow({ icon, title, onPress }: { icon: string; title: string; onPress: () => void }) {
    return (
        <Pressable onPress={onPress} style={({ pressed }) => [s.pressableRow, pressed && { opacity: 0.7 }]}>
            <View style={s.settingIcon}>
                <Ionicons name={icon as any} size={20} color={TEXT_SECONDARY} />
            </View>
            <Text style={s.pressableTitle}>{title}</Text>
            <Ionicons name="chevron-forward" size={16} color={TEXT_TERTIARY} />
        </Pressable>
    )
}

const s = StyleSheet.create({
    container: { paddingHorizontal: 20, gap: 16 },
    header: { gap: 4 },
    title: { fontSize: 28, fontWeight: '800', color: TEXT_PRIMARY, letterSpacing: -0.6 },
    profileCard: { padding: 20, gap: 16 },
    profileTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    avatar: { width: 56, height: 56, borderRadius: 18, backgroundColor: ACCENT_DIM, alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontSize: 20, fontWeight: '800', color: ACCENT },
    profileInfo: { flex: 1, gap: 2 },
    profileName: { fontSize: 18, fontWeight: '700', color: TEXT_PRIMARY },
    profileEmail: { fontSize: 13, color: TEXT_SECONDARY },
    profileStats: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(26,26,26,0.04)', borderRadius: 14, paddingVertical: 12 },
    profileStat: { flex: 1, alignItems: 'center', gap: 2 },
    profileStatDivider: { width: 1, height: 24, backgroundColor: BORDER },
    profileStatValue: { fontSize: 18, fontWeight: '800', color: TEXT_PRIMARY },
    profileStatLabel: { fontSize: 11, color: TEXT_TERTIARY },
    sectionTitle: { fontSize: 11, fontWeight: '700', color: TEXT_TERTIARY, letterSpacing: 0.8, textTransform: 'uppercase', marginTop: 4 },
    goalsCard: { paddingVertical: 4, paddingHorizontal: 0 },
    goalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
    goalDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(26,26,26,0.06)' },
    goalLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    goalIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    goalTitle: { fontSize: 14, fontWeight: '600', color: TEXT_PRIMARY },
    goalDetail: { fontSize: 12, color: TEXT_SECONDARY },
    goalProgressRing: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: ACCENT, alignItems: 'center', justifyContent: 'center' },
    goalProgressText: { fontSize: 10, fontWeight: '700', color: ACCENT },
    settingsCard: { paddingVertical: 4, paddingHorizontal: 0 },
    settingRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
    settingsDivider: { height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(26,26,26,0.06)', marginLeft: 56 },
    settingIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: ACCENT_DIM, alignItems: 'center', justifyContent: 'center' },
    settingInfo: { flex: 1, gap: 2 },
    settingTitle: { fontSize: 14, fontWeight: '600', color: TEXT_PRIMARY },
    settingSubtitle: { fontSize: 12, color: TEXT_SECONDARY },
    appSettingsCard: { paddingVertical: 4, paddingHorizontal: 0 },
    pressableRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
    appSettingsDivider: { height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(26,26,26,0.06)', marginLeft: 56 },
    pressableTitle: { flex: 1, fontSize: 14, color: TEXT_PRIMARY, fontWeight: '500' },
    enableBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, backgroundColor: ACCENT },
    enableBtnText: { fontSize: 12, fontWeight: '700', color: '#fff' },
    versionText: { alignItems: 'center', paddingVertical: 12 },
    version: { fontSize: 12, color: TEXT_TERTIARY },
})
