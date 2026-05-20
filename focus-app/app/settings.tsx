import { View, ScrollView, StyleSheet, Pressable, Switch } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Card } from '@/components/ui/Card'
import SettingsRow from '@/components/ui/SettingsRow'
import { BG, BORDER, TEXT_PRIMARY, TEXT_SECONDARY, TEXT_TERTIARY, ACCENT } from '@/lib/theme'
import { useProfileSettings } from '@/hooks/useProfileSettings'

export default function SettingsScreen() {
    const insets = useSafeAreaInsets()
    const { settings, updateSetting, loaded } = useProfileSettings()

    if (!loaded) return null

    return (
        <View style={{ flex: 1, backgroundColor: BG }}>
            <View style={[s.header, { paddingTop: insets.top + 8 }]}>
                <Pressable onPress={() => router.back()} hitSlop={12}>
                    <Ionicons name="chevron-back" size={24} color="rgba(255,255,255,0.6)" />
                </Pressable>
                <Text style={s.headerTitle}>Settings</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView
                contentContainerStyle={[s.body, { paddingBottom: insets.bottom + 28 }]}
                showsVerticalScrollIndicator={false}
            >
                <Text style={s.sectionTitle}>Preferences</Text>
                <Card compact style={s.groupCard}>
                    <SwitchRow
                        label="Push notifications"
                        subtitle="Alerts for system and team events"
                        value={settings.pushEnabled}
                        onValueChange={(v) => updateSetting('pushEnabled', v)}
                    />
                    <SwitchRow
                        label="Weekly digest"
                        subtitle="Receive a Monday summary email"
                        value={settings.weeklyDigest}
                        onValueChange={(v) => updateSetting('weeklyDigest', v)}
                    />
                    <SwitchRow
                        label="Compact mode"
                        subtitle="Denser list rows for productivity"
                        value={settings.compactMode}
                        onValueChange={(v) => updateSetting('compactMode', v)}
                        last
                    />
                </Card>

                <Text style={s.sectionTitle}>Legal</Text>
                <Card compact style={s.groupCard}>
                    <SettingsRow label="Privacy Policy" icon="document-text-outline" onPress={() => router.push('/privacy')} />
                    <SettingsRow label="Terms of Service" icon="shield-checkmark-outline" onPress={() => router.push('/terms')} last={true} />
                </Card>
            </ScrollView>
        </View>
    )
}

function SwitchRow({
    label,
    subtitle,
    value,
    onValueChange,
    last,
}: {
    label: string
    subtitle: string
    value: boolean
    onValueChange: (next: boolean) => void
    last?: boolean
}) {
    return (
        <View style={[s.row, !last && s.rowDivider]}>
            <View style={{ flex: 1 }}>
                <Text style={s.rowLabel}>{label}</Text>
                <Text style={s.rowSub}>{subtitle}</Text>
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: 'rgba(255,255,255,0.2)', true: `${ACCENT}66` }}
                thumbColor={value ? ACCENT : '#f4f4f5'}
            />
        </View>
    )
}

const s = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(255,255,255,0.08)',
    },
    headerTitle: { color: TEXT_PRIMARY, fontSize: 17, fontWeight: '700' },
    body: { padding: 20, gap: 10 },
    sectionTitle: {
        fontSize: 11,
        fontWeight: '700',
        color: TEXT_TERTIARY,
        letterSpacing: 0.8,
        textTransform: 'uppercase',
        marginTop: 6,
    },
    groupCard: { padding: 0, overflow: 'hidden' },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    rowDivider: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: BORDER,
    },
    rowLabel: { color: TEXT_PRIMARY, fontSize: 14.5, fontWeight: '600' },
    rowSub: { color: TEXT_SECONDARY, fontSize: 12, marginTop: 2 },
})
