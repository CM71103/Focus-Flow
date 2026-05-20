import { useState, useCallback, useMemo, useEffect } from 'react'
import { View, StyleSheet, Pressable, ScrollView, Dimensions, Alert } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withRepeat, withSequence, Easing } from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { Svg, Circle, G, Line, Defs, RadialGradient, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg'
import { Text } from '@/components/ui/Text'
import { Card } from '@/components/ui/Card'
import { ACCENT, ACCENT_DIM, ACCENT_GLOW, BG, SURFACE, SURFACE2, TEXT_PRIMARY, TEXT_SECONDARY, TEXT_TERTIARY, BORDER, SUCCESS, ERROR, WARNING } from '@/lib/theme'
import { TAB_BAR_CLEARANCE } from '@/components/TabBar'
import { useFocus, type FocusSessionConfig } from '@/contexts/FocusContext'
import { pomodoroPresets, appUsageData } from '@/lib/mockData'
import { BlockedAppOverlay } from '@/components/BlockedAppOverlay'
import { AppBlocking } from '@/lib/appBlocking'

const { width: SW } = Dimensions.get('window')
const TIMER_SIZE = SW * 0.65
const TIMER_CENTER = TIMER_SIZE / 2
const OUTER_RADIUS = TIMER_SIZE * 0.42
const INNER_RADIUS = TIMER_SIZE * 0.32

export default function FocusScreen() {
    const insets = useSafeAreaInsets()
    const {
        sessionState,
        currentRound,
        totalRounds,
        timeRemaining,
        distractions,
        sessionConfig,
        blockedAppTriggered,
        startSession,
        pauseSession,
        resumeSession,
        stopSession,
        recordDistraction,
        dismissBlockedApp,
        reportDistractionFromBlock,
    } = useFocus()

    const [selectedPreset, setSelectedPreset] = useState(1)
    const [selectedApps, setSelectedApps] = useState<string[]>(['Instagram', 'TikTok', 'Twitter / X', 'Reddit'])
    const [serviceEnabled, setServiceEnabled] = useState(false)

    useEffect(() => {
        AppBlocking.isServiceEnabled().then(setServiceEnabled)
    }, [])

    const pulseOpacity = useSharedValue(0)
    const pulseScale = useSharedValue(1)

    const isActive = sessionState === 'running' || sessionState === 'break'

    const minutes = Math.floor(timeRemaining / 60)
    const seconds = timeRemaining % 60
    const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

    const progress = useMemo(() => {
        const totalSeconds = (sessionConfig?.workMinutes || 25) * 60
        if (totalSeconds === 0) return 0
        return ((totalSeconds - timeRemaining) / totalSeconds) * 100
    }, [timeRemaining, sessionConfig?.workMinutes])

    const circumference = 2 * Math.PI * (OUTER_RADIUS - 4)
    const strokeDashoffset = circumference - (progress / 100) * circumference

    const circleStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseScale.value }],
        opacity: pulseOpacity.value,
    }))

    const startPulse = useCallback(() => {
        pulseOpacity.value = withRepeat(
            withSequence(
                withTiming(0.3, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
                withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.sin) })
            ),
            -1,
            true
        )
        pulseScale.value = withRepeat(
            withSequence(
                withTiming(1.02, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
                withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) })
            ),
            -1,
            true
        )
    }, [])

    const stopPulse = useCallback(() => {
        pulseOpacity.value = withTiming(0, { duration: 300 })
        pulseScale.value = withTiming(1, { duration: 300 })
    }, [])

    const handleStart = async () => {
        const preset = pomodoroPresets[selectedPreset]
        const config: FocusSessionConfig = {
            mode: selectedPreset === 0 ? 'custom' : selectedPreset === 1 ? 'pomodoro' : selectedPreset === 2 ? 'deep-work' : 'custom',
            workMinutes: preset.work,
            breakMinutes: preset.shortBreak,
            longBreakMinutes: preset.longBreak,
            rounds: preset.rounds,
            blockedApps: selectedApps,
        }

        if (selectedApps.length > 0 && !serviceEnabled) {
            Alert.alert(
                'Enable App Blocking',
                'To block apps during focus sessions, you need to enable the Accessibility Service for FocusFlow.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Enable Now',
                        onPress: async () => {
                            await AppBlocking.startService()
                        },
                    },
                ]
            )
            return
        }

        startSession(config)
        startPulse()
    }

    const handlePause = () => {
        pauseSession()
        stopPulse()
    }

    const handleResume = () => {
        resumeSession()
        startPulse()
    }

    const handleStop = () => {
        stopSession()
        stopPulse()
    }

    const handleDistraction = () => {
        recordDistraction()
    }

    const toggleApp = (appName: string) => {
        setSelectedApps((prev) =>
            prev.includes(appName) ? prev.filter((a) => a !== appName) : [...prev, appName]
        )
    }

    const isBreak = sessionState === 'break'
    const stateLabel = isBreak ? 'Break Time' : 'Focusing'

    if (sessionState === 'idle') {
        return (
            <View style={[s.container, { paddingTop: insets.top + 20, paddingBottom: TAB_BAR_CLEARANCE + 16 }]}>
                <View style={s.header}>
                    <View style={s.logoRow}>
                        <View style={s.logoIcon}>
                            <Ionicons name="leaf" size={20} color={ACCENT} />
                        </View>
                        <Text style={s.title}>FocusFlow</Text>
                    </View>
                    <Text style={s.subtitle}>Flow Beyond Distraction</Text>
                </View>

                {!serviceEnabled && selectedApps.length > 0 && (
                    <Card style={s.warningCard}>
                        <Ionicons name="warning" size={18} color={WARNING} />
                        <View style={s.warningTextWrap}>
                            <Text style={s.warningTitle}>App Blocking Not Enabled</Text>
                            <Text style={s.warningDesc}>Enable Accessibility Service to block apps.</Text>
                        </View>
                        <Pressable onPress={() => AppBlocking.startService()} style={s.warningBtn}>
                            <Text style={s.warningBtnText}>Enable</Text>
                        </Pressable>
                    </Card>
                )}

                <Text style={s.sectionTitle}>Focus Mode</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.presetsScroll} contentContainerStyle={s.presetsContainer}>
                    {(pomodoroPresets || []).map((preset, i) => (
                        <Pressable
                            key={preset.label}
                            onPress={() => setSelectedPreset(i)}
                            style={[s.presetCard, selectedPreset === i && s.presetCardActive]}
                        >
                            {selectedPreset === i && <View style={s.presetActiveIndicator} />}
                            <Text style={[s.presetLabel, selectedPreset === i && s.presetLabelActive]}>{preset.label}</Text>
                            <Text style={s.presetDetail}>{preset.work}m / {preset.shortBreak}m</Text>
                            <Text style={s.presetRounds}>{preset.rounds} rounds</Text>
                        </Pressable>
                    ))}
                </ScrollView>

                <Text style={s.sectionTitle}>Block Distractions</Text>
                <Card style={s.appsCard}>
                    {(appUsageData || []).filter((a) => a.category === 'social' || a.category === 'entertainment' || a.category === 'gaming').map((app) => (
                        <Pressable key={app.id} onPress={() => toggleApp(app.appName)} style={s.appToggle}>
                            <View style={[s.appToggleIcon, selectedApps.includes(app.appName) && { backgroundColor: ACCENT }]}>
                                <Ionicons
                                    name={selectedApps.includes(app.appName) ? 'checkmark' : 'close'}
                                    size={14}
                                    color={selectedApps.includes(app.appName) ? '#fff' : TEXT_TERTIARY}
                                />
                            </View>
                            <Text style={s.appToggleName}>{app.appName}</Text>
                        </Pressable>
                    ))}
                </Card>

                <View style={s.startSection}>
                    <View style={s.startPreview}>
                        <Text style={s.startDuration}>{pomodoroPresets[selectedPreset].work}:00</Text>
                        <Text style={s.startMeta}>{pomodoroPresets[selectedPreset].rounds} rounds · {selectedApps.length} apps blocked</Text>
                    </View>
                    <Pressable onPress={handleStart} style={({ pressed }) => [s.startButton, pressed && { opacity: 0.9 }]}>
                        <LinearGradient
                            colors={[ACCENT, '#b8944f']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={StyleSheet.absoluteFillObject}
                        />
                        <Ionicons name="play" size={18} color="#fff" />
                        <Text style={s.startButtonText}>Start Focus Session</Text>
                    </Pressable>
                </View>
            </View>
        )
    }

    return (
        <View style={[s.container, { paddingTop: insets.top + 20, paddingBottom: TAB_BAR_CLEARANCE + 16 }]}>
            <View style={s.activeHeader}>
                <View style={s.roundBadge}>
                    <Text style={s.roundText}>Round {currentRound}/{totalRounds}</Text>
                </View>
                <View style={[s.stateBadge, isBreak && s.breakBadge]}>
                    <View style={[s.stateDot, { backgroundColor: isBreak ? SUCCESS : ACCENT }]} />
                    <Text style={[s.stateText, { color: isBreak ? SUCCESS : ACCENT }]}>{stateLabel}</Text>
                </View>
            </View>

            <View style={s.timerContainer}>
                <Animated.View style={[s.pulseRing, circleStyle]} />
                
                <View style={s.timerWrapper}>
                    <Svg width={TIMER_SIZE} height={TIMER_SIZE}>
                        <Defs>
                            <RadialGradient id="outerRing" cx="35%" cy="30%" r="65%">
                                <Stop offset="0%" stopColor="#e8dcc8" />
                                <Stop offset="50%" stopColor="#d4c4a8" />
                                <Stop offset="100%" stopColor="#c9b896" />
                            </RadialGradient>
                            
                            <RadialGradient id="innerFace" cx="40%" cy="35%" r="60%">
                                <Stop offset="0%" stopColor="#faf7f2" />
                                <Stop offset="60%" stopColor="#f5f0e8" />
                                <Stop offset="100%" stopColor="#ebe5db" />
                            </RadialGradient>
                            
                            <RadialGradient id="shadowGrad" cx="50%" cy="50%" r="50%">
                                <Stop offset="0%" stopColor="#000" stopOpacity="0" />
                                <Stop offset="100%" stopColor="#000" stopOpacity="0.15" />
                            </RadialGradient>
                            
                            <SvgLinearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <Stop offset="0%" stopColor={ACCENT} />
                                <Stop offset="100%" stopColor="#b8944f" />
                            </SvgLinearGradient>
                        </Defs>

                        <Circle cx={TIMER_CENTER + 4} cy={TIMER_CENTER + 8} r={OUTER_RADIUS + 8} fill="url(#shadowGrad)" />
                        <Circle cx={TIMER_CENTER} cy={TIMER_CENTER} r={OUTER_RADIUS} fill="url(#outerRing)" />
                        <Circle cx={TIMER_CENTER - OUTER_RADIUS * 0.2} cy={TIMER_CENTER - OUTER_RADIUS * 0.25} r={OUTER_RADIUS * 0.5} fill="rgba(255,255,255,0.3)" />
                        <Circle cx={TIMER_CENTER} cy={TIMER_CENTER} r={INNER_RADIUS} fill="url(#innerFace)" />
                        <Circle cx={TIMER_CENTER} cy={TIMER_CENTER + INNER_RADIUS * 0.3} r={INNER_RADIUS * 0.7} fill="rgba(0,0,0,0.03)" />

                        {Array(60).fill(0).map((_, i) => {
                            const angle = (i * 6) - 90
                            const radian = (angle * Math.PI) / 180
                            const isMajor = i % 5 === 0
                            const innerR = OUTER_RADIUS - (isMajor ? 18 : 12)
                            const outerR = OUTER_RADIUS - 6
                            return (
                                <Line
                                    key={i}
                                    x1={TIMER_CENTER + innerR * Math.cos(radian)}
                                    y1={TIMER_CENTER + innerR * Math.sin(radian)}
                                    x2={TIMER_CENTER + outerR * Math.cos(radian)}
                                    y2={TIMER_CENTER + outerR * Math.sin(radian)}
                                    stroke={isMajor ? 'rgba(26,26,26,0.5)' : 'rgba(26,26,26,0.2)'}
                                    strokeWidth={isMajor ? 2.5 : 1.5}
                                    strokeLinecap="round"
                                />
                            )
                        })}

                        <G rotation="-90" origin={`${TIMER_CENTER}, ${TIMER_CENTER}`}>
                            <Circle cx={TIMER_CENTER} cy={TIMER_CENTER} r={OUTER_RADIUS - 4} fill="none" stroke="rgba(26,26,26,0.06)" strokeWidth={6} />
                            <Circle cx={TIMER_CENTER} cy={TIMER_CENTER} r={OUTER_RADIUS - 4} fill="none" stroke="url(#progressGrad)" strokeWidth={6} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} />
                        </G>

                        <Circle cx={TIMER_CENTER} cy={TIMER_CENTER} r={INNER_RADIUS * 0.5} fill="none" stroke="rgba(26,26,26,0.06)" strokeWidth={1} />
                        <Circle cx={TIMER_CENTER} cy={TIMER_CENTER} r={3} fill={ACCENT} />
                    </Svg>

                    <View style={s.timeOverlay}>
                        <Text style={s.timerText}>{timeStr}</Text>
                        {distractions > 0 && (
                            <Text style={s.distractionText}>{distractions} distraction{distractions > 1 ? 's' : ''}</Text>
                        )}
                    </View>
                </View>
            </View>

            <View style={s.controls}>
                {sessionState === 'running' ? (
                    <>
                        <Pressable onPress={handleDistraction} style={s.distractionBtn}>
                            <Ionicons name="phone-portrait-outline" size={18} color={ERROR} />
                            <Text style={s.distractionBtnText}>Distracted</Text>
                        </Pressable>
                        <Pressable onPress={handlePause} style={[s.controlBtn, s.pauseBtn]}>
                            <Ionicons name="pause" size={24} color="#fff" />
                        </Pressable>
                        <Pressable onPress={handleStop} style={[s.controlBtn, s.stopBtn]}>
                            <Ionicons name="stop" size={20} color={TEXT_SECONDARY} />
                        </Pressable>
                    </>
                ) : sessionState === 'paused' ? (
                    <>
                        <View style={{ flex: 1 }} />
                        <Pressable onPress={handleResume} style={[s.controlBtn, s.resumeBtn]}>
                            <Ionicons name="play" size={24} color="#fff" />
                        </Pressable>
                        <Pressable onPress={handleStop} style={[s.controlBtn, s.stopBtn]}>
                            <Ionicons name="stop" size={20} color={TEXT_SECONDARY} />
                        </Pressable>
                    </>
                ) : (
                    <>
                        <View style={{ flex: 1 }} />
                        <Pressable onPress={() => { stopPulse(); handleStop() }} style={[s.controlBtn, s.stopBtn]}>
                            <Ionicons name="stop" size={20} color={TEXT_SECONDARY} />
                        </Pressable>
                    </>
                )}
            </View>

            <View style={s.sessionInfo}>
                <View style={s.infoItem}>
                    <Ionicons name="timer-outline" size={14} color={TEXT_TERTIARY} />
                    <Text style={s.infoText}>{sessionConfig?.workMinutes || 25}m work</Text>
                </View>
                <View style={s.infoDivider} />
                <View style={s.infoItem}>
                    <Ionicons name="cafe-outline" size={14} color={TEXT_TERTIARY} />
                    <Text style={s.infoText}>{sessionConfig?.breakMinutes || 5}m break</Text>
                </View>
                <View style={s.infoDivider} />
                <View style={s.infoItem}>
                    <Ionicons name="lock-closed-outline" size={14} color={TEXT_TERTIARY} />
                    <Text style={s.infoText}>{(sessionConfig?.blockedApps || []).length} blocked</Text>
                </View>
            </View>

            <BlockedAppOverlay
                visible={!!blockedAppTriggered}
                blockedAppName={blockedAppTriggered || ''}
                sessionTimeRemaining={timeRemaining}
                onReportDistraction={reportDistractionFromBlock}
                onDismiss={dismissBlockedApp}
            />
        </View>
    )
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: BG, paddingHorizontal: 20 },
    header: { gap: 4, marginBottom: 24 },
    logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    logoIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: ACCENT_DIM, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 24, fontWeight: '800', color: TEXT_PRIMARY, letterSpacing: -0.5 },
    subtitle: { fontSize: 13, color: TEXT_SECONDARY, marginLeft: 42 },
    warningCard: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, marginBottom: 16, backgroundColor: 'rgba(243,156,18,0.08)', borderWidth: 1, borderColor: 'rgba(243,156,18,0.2)' },
    warningTextWrap: { flex: 1, gap: 2 },
    warningTitle: { fontSize: 13, fontWeight: '700', color: WARNING },
    warningDesc: { fontSize: 11, color: TEXT_SECONDARY },
    warningBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, backgroundColor: WARNING },
    warningBtnText: { fontSize: 12, fontWeight: '700', color: '#fff' },
    sectionTitle: { fontSize: 11, fontWeight: '700', color: TEXT_TERTIARY, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 },
    presetsScroll: { marginBottom: 20 },
    presetsContainer: { gap: 10 },
    presetCard: { width: 130, padding: 14, borderRadius: 20, backgroundColor: SURFACE, borderWidth: 1, borderColor: BORDER, gap: 6, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
    presetCardActive: { borderColor: ACCENT, backgroundColor: ACCENT_DIM },
    presetActiveIndicator: { position: 'absolute', top: 0, left: 0, right: 0, height: 3, backgroundColor: ACCENT },
    presetLabel: { fontSize: 14, fontWeight: '700', color: TEXT_PRIMARY },
    presetLabelActive: { color: ACCENT },
    presetDetail: { fontSize: 11, color: TEXT_SECONDARY },
    presetRounds: { fontSize: 10, color: TEXT_TERTIARY },
    appsCard: { paddingVertical: 10, paddingHorizontal: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
    appToggle: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 14, backgroundColor: 'rgba(26,26,26,0.04)' },
    appToggleIcon: { width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(26,26,26,0.06)', alignItems: 'center', justifyContent: 'center' },
    appToggleName: { fontSize: 12, color: TEXT_PRIMARY, fontWeight: '500' },
    startSection: { gap: 16, marginTop: 'auto', marginBottom: 16 },
    startPreview: { alignItems: 'center', gap: 4 },
    startDuration: { fontSize: 48, fontWeight: '800', color: ACCENT, fontVariant: ['tabular-nums'] },
    startMeta: { fontSize: 13, color: TEXT_SECONDARY },
    startButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16, borderRadius: 28, overflow: 'hidden' },
    startButtonText: { fontSize: 16, fontWeight: '700', color: '#fff' },
    activeHeader: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 24 },
    roundBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: SURFACE2 },
    roundText: { fontSize: 12, fontWeight: '600', color: TEXT_SECONDARY },
    stateBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: SURFACE2 },
    breakBadge: { backgroundColor: 'rgba(39,174,96,0.1)' },
    stateDot: { width: 8, height: 8, borderRadius: 4 },
    stateText: { fontSize: 12, fontWeight: '600' },
    timerContainer: { alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
    pulseRing: { position: 'absolute', width: TIMER_SIZE + 40, height: TIMER_SIZE + 40, borderRadius: TIMER_SIZE / 2 + 20, backgroundColor: ACCENT_GLOW },
    timerWrapper: { width: TIMER_SIZE, height: TIMER_SIZE, alignItems: 'center', justifyContent: 'center' },
    timeOverlay: { position: 'absolute', alignItems: 'center', justifyContent: 'center', gap: 4 },
    timerText: { fontSize: 42, fontWeight: '800', color: TEXT_PRIMARY, letterSpacing: -1, fontVariant: ['tabular-nums'] },
    distractionText: { fontSize: 12, color: ERROR, fontWeight: '500' },
    controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 32 },
    controlBtn: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 2 },
    pauseBtn: { backgroundColor: ACCENT },
    resumeBtn: { backgroundColor: ACCENT },
    stopBtn: { backgroundColor: 'rgba(26,26,26,0.06)' },
    distractionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16, backgroundColor: 'rgba(231,76,60,0.08)' },
    distractionBtnText: { fontSize: 12, color: ERROR, fontWeight: '500' },
    sessionInfo: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 20 },
    infoItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    infoDivider: { width: 1, height: 16, backgroundColor: BORDER },
    infoText: { fontSize: 12, color: TEXT_SECONDARY },
})
