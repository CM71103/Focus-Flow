import { useState, useEffect } from 'react'
import { View, StyleSheet, Pressable, Modal } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { UsageStats } from '@/lib/usageStats'
import { ACCENT, ACCENT_DIM, BG, TEXT_SECONDARY, TEXT_TERTIARY, BORDER } from '@/lib/theme'

export default function UsagePermissionPrompt({ onGranted }: { onGranted?: () => void }) {
    const [visible, setVisible] = useState(false)
    const [hasPermission, setHasPermission] = useState(false)
    const [checking, setChecking] = useState(true)

    useEffect(() => {
        checkPermission()
    }, [])

    async function checkPermission() {
        if (!UsageStats.isAvailable) {
            setChecking(false)
            return
        }

        const granted = await UsageStats.checkUsagePermission()
        setHasPermission(granted)
        setChecking(false)

        if (granted && onGranted) {
            onGranted()
        } else if (!granted) {
            setVisible(true)
        }
    }

    async function handleGrantPermission() {
        await UsageStats.requestUsagePermission()
        setVisible(false)

        setTimeout(() => {
            checkPermission()
        }, 2000)
    }

    if (!UsageStats.isAvailable || checking || hasPermission) {
        return null
    }

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={s.overlay}>
                <Card style={s.card}>
                    <View style={s.iconWrap}>
                        <Ionicons name="phone-portrait-outline" size={32} color={ACCENT} />
                    </View>
                    <Text style={s.title}>Enable Usage Access</Text>
                    <Text style={s.description}>
                        FocusFlow needs usage access permission to track your screen time and help you build better digital habits.
                    </Text>
                    <Text style={s.note}>
                        This permission only allows reading app usage statistics. Your data stays on your device.
                    </Text>
                    <View style={s.buttons}>
                        <Button label="Grant Permission" variant="primary" size="md" fullWidth onPress={handleGrantPermission} />
                        <Pressable onPress={() => setVisible(false)} style={s.skipBtn}>
                            <Text style={s.skipText}>Skip for now</Text>
                        </Pressable>
                    </View>
                </Card>
            </View>
        </Modal>
    )
}

const s = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    card: {
        width: '100%',
        padding: 24,
        gap: 16,
        alignItems: 'center',
    },
    iconWrap: {
        width: 64,
        height: 64,
        borderRadius: 20,
        backgroundColor: ACCENT_DIM,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        color: '#fff',
        textAlign: 'center',
    },
    description: {
        fontSize: 14,
        color: TEXT_SECONDARY,
        textAlign: 'center',
        lineHeight: 21,
    },
    note: {
        fontSize: 12,
        color: TEXT_TERTIARY,
        textAlign: 'center',
        lineHeight: 18,
        backgroundColor: 'rgba(255,255,255,0.04)',
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: BORDER,
    },
    buttons: {
        width: '100%',
        gap: 12,
        marginTop: 8,
    },
    skipBtn: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    skipText: {
        fontSize: 14,
        color: TEXT_TERTIARY,
    },
})
