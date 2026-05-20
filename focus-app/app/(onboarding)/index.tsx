import { useState } from 'react'
import {
  View, Pressable, TextInput, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native'
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { supabase } from '@/lib/supabase'
import { track } from '@/lib/analytics'
import { ACCENT, ACCENT_DIM, ACCENT_BORDER, BG, SURFACE, BORDER, TEXT_SECONDARY } from '@/lib/theme'
import { LinearGradient } from 'expo-linear-gradient'
import { adjustBrightness } from '@/lib/utils'
import { Fonts } from '@/lib/typography'

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets()

  const [displayName, setDisplayName] = useState('')
  const [dailyGoal, setDailyGoal] = useState('180')
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState<string | null>(null)

  track('onboarding_started')

  async function complete(name?: string) {
    setLoading(true)
    setError(null)

    const { error: err } = await supabase.auth.updateUser({
      data: {
        onboarding_completed: true,
        full_name: name?.trim() || undefined,
        daily_screen_time_goal: parseInt(dailyGoal, 10) || 180,
      },
    })

    if (err) {
      setLoading(false)
      setError('Could not save. Please try again.')
      return
    }

    if (name?.trim()) {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase
            .from('profiles')
            .upsert({ id: user.id, display_name: name.trim() })
        }
      } catch { /* non-fatal */ }
    }

    track('onboarding_completed', { skipped: !name?.trim() })
    setLoading(false)
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: BG }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[s.root, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 32 }]}>
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={s.content}>
          <View style={s.header}>
            <View style={[s.iconBadge, { backgroundColor: ACCENT_DIM, borderColor: ACCENT_BORDER }]}>
              <Ionicons name="timer" size={36} color={ACCENT} />
            </View>
            <Text style={s.title}>Welcome to FocusFlow</Text>
            <Text style={s.subtitle}>
              Let's set up your focus profile. You can always change these later.
            </Text>
          </View>

          <View style={s.fieldGroup}>
            <Text style={s.label}>YOUR NAME</Text>
            <TextInput
              value={displayName}
              onChangeText={(v) => { setDisplayName(v); setError(null) }}
              placeholder="Enter your name"
              placeholderTextColor="rgba(255,255,255,0.18)"
              style={s.input}
              autoCapitalize="words"
              returnKeyType="next"
            />
          </View>

          <View style={s.fieldGroup}>
            <Text style={s.label}>DAILY SCREEN TIME GOAL (minutes)</Text>
            <View style={s.goalRow}>
              {['120', '180', '240', '300'].map((val) => (
                <Pressable
                  key={val}
                  onPress={() => setDailyGoal(val)}
                  style={[s.goalBtn, dailyGoal === val && s.goalBtnActive]}
                >
                  <Text style={[s.goalBtnText, dailyGoal === val && s.goalBtnTextActive]}>
                    {val}m
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {error ? (
            <Animated.View entering={FadeIn.duration(180)} style={s.errorBox}>
              <Text style={{ color: '#f87171', fontSize: 13 }}>{error}</Text>
            </Animated.View>
          ) : null}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={s.buttons}>
          <Pressable
            onPress={() => complete(displayName)}
            disabled={loading}
            style={({ pressed }) => ({
              opacity: loading ? 0.5 : pressed ? 0.85 : 1,
              borderRadius: 16, overflow: 'hidden',
            })}
          >
            <LinearGradient
              colors={[ACCENT, adjustBrightness(ACCENT, -25)]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={s.primaryBtn}
            >
              {loading
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={{ fontSize: 16, fontWeight: '800', color: '#fff' }}>
                    Start Focusing  →
                  </Text>
              }
            </LinearGradient>
          </Pressable>

          <Pressable onPress={() => complete()} disabled={loading} style={{ alignItems: 'center', paddingVertical: 6 }}>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)' }}>Skip for now</Text>
          </Pressable>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 24 },
  content: { flex: 1, gap: 24, justifyContent: 'center' },
  header: { gap: 12, alignItems: 'center', paddingBottom: 8 },
  iconBadge: {
    width: 80, height: 80, borderRadius: 24,
    borderWidth: 1.5, alignItems: 'center', justifyContent: 'center',
  },
  title:    { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: -0.5, textAlign: 'center' },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.38)', textAlign: 'center', lineHeight: 21, maxWidth: 280 },

  fieldGroup: { gap: 8 },
  label: { fontSize: 11, fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' },
  input: {
    height: 52, backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1, borderColor: BORDER, borderRadius: 14,
    paddingHorizontal: 18, color: '#fff', fontSize: 16,
    fontFamily: Fonts.regular,
  },
  goalRow: { flexDirection: 'row', gap: 10 },
  goalBtn: { flex: 1, height: 48, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: BORDER, alignItems: 'center', justifyContent: 'center' },
  goalBtnActive: { borderColor: ACCENT, backgroundColor: ACCENT_DIM },
  goalBtnText: { fontSize: 15, fontWeight: '700', color: TEXT_SECONDARY },
  goalBtnTextActive: { color: ACCENT },
  errorBox: {
    backgroundColor: 'rgba(248,113,113,0.08)', borderRadius: 8,
    borderWidth: 1, borderColor: 'rgba(248,113,113,0.2)',
    paddingHorizontal: 14, paddingVertical: 10,
  },
  buttons:    { gap: 12 },
  primaryBtn: { height: 56, alignItems: 'center', justifyContent: 'center' },
})
