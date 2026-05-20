import { useState, useEffect } from 'react'
import { View, StyleSheet, Modal, Pressable, Dimensions } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { ACCENT, ACCENT_DIM, BG, ERROR, SUCCESS } from '@/lib/theme'
import { AppBlocking } from '@/lib/appBlocking'

const { width: SW, height: SH } = Dimensions.get('window')

const MOTIVATIONAL_MESSAGES = [
    "Stay focused! You're doing great.",
    "Every minute counts. Keep going!",
    "Distraction is the enemy of progress.",
    "You've got this! Stay in the zone.",
    "Focus now, relax later.",
    "Your future self will thank you.",
    "One task at a time. You're on track.",
    "Deep work leads to deep results.",
]

interface BlockedAppOverlayProps {
    visible: boolean
    blockedAppName: string
    sessionTimeRemaining: number
    onReportDistraction: () => void
    onDismiss: () => void
}

export function BlockedAppOverlay({
    visible,
    blockedAppName,
    sessionTimeRemaining,
    onReportDistraction,
    onDismiss,
}: BlockedAppOverlayProps) {
    const [message] = useState(() =>
        MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)]
    )

    const minutes = Math.floor(sessionTimeRemaining / 60)
    const seconds = sessionTimeRemaining % 60
    const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

    useEffect(() => {
        if (visible) {
            AppBlocking.stopBlocking()
        }
    }, [visible])

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={s.overlay}>
                <LinearGradient colors={[ACCENT_DIM, BG]} style={s.card}>
                    <View style={s.iconContainer}>
                        <Ionicons name="lock-closed" size={48} color={ACCENT} />
                    </View>

                    <Text style={s.title}>App Blocked</Text>
                    <Text style={s.appName}>{blockedAppName}</Text>

                    <View style={s.messageBox}>
                        <Ionicons name="chatbubble-ellipses" size={20} color={ACCENT} />
                        <Text style={s.message}>{message}</Text>
                    </View>

                    <View style={s.timerBox}>
                        <Ionicons name="timer" size={18} color={SUCCESS} />
                        <Text style={s.timerText}>Session ends in {timeStr}</Text>
                    </View>

                    <View style={s.actions}>
                        <Button
                            label="Report Distraction"
                            variant="secondary"
                            size="md"
                            fullWidth
                            onPress={() => {
                                onReportDistraction()
                                onDismiss()
                            }}
                        />
                        <Button
                            label="Return to Focus"
                            variant="primary"
                            size="md"
                            fullWidth
                            onPress={onDismiss}
                        />
                    </View>
                </LinearGradient>
            </View>
        </Modal>
    )
}

const s = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    card: {
        width: SW - 48,
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        gap: 20,
        borderWidth: 1,
        borderColor: ACCENT,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: ACCENT_DIM,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#fff',
    },
    appName: {
        fontSize: 18,
        fontWeight: '600',
        color: ACCENT,
        marginBottom: 8,
    },
    messageBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 16,
        borderRadius: 12,
        width: '100%',
    },
    message: {
        fontSize: 14,
        color: '#fff',
        fontStyle: 'italic',
        flex: 1,
    },
    timerBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(74,222,128,0.1)',
        padding: 12,
        borderRadius: 10,
        width: '100%',
        justifyContent: 'center',
    },
    timerText: {
        fontSize: 16,
        fontWeight: '600',
        color: SUCCESS,
    },
    actions: {
        width: '100%',
        gap: 12,
        marginTop: 8,
    },
})
