import { useEffect } from 'react'
import { View, Pressable, StyleSheet, Dimensions } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    withDelay,
    withRepeat,
    withSequence,
    Easing,
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { ACCENT, ACCENT_DIM, BG, BORDER, SURFACE, TEXT_PRIMARY, TEXT_SECONDARY, TEXT_TERTIARY } from '@/lib/theme'
import { APP_NAME, APP_TAGLINE, APP_DESCRIPTION } from '@/lib/constants'
import { adjustBrightness } from '@/lib/utils'

const { width: SW, height: SH } = Dimensions.get('window')

const FEATURES = [
    { icon: 'timer-outline', title: 'Focus Timer', desc: 'Pomodoro-style sessions with app blocking' },
    { icon: 'phone-portrait-outline', title: 'Screen Time Tracking', desc: 'Monitor and limit your app usage' },
    { icon: 'trophy-outline', title: 'Earn Rewards', desc: 'Points and achievements for staying focused' },
]

export default function LandingScreen() {
    const insets = useSafeAreaInsets()

    const headerY = useSharedValue(-20)
    const headerOpacity = useSharedValue(0)
    const heroScale = useSharedValue(0.88)
    const heroOpacity = useSharedValue(0)
    const featuresY = useSharedValue(30)
    const featuresOpacity = useSharedValue(0)
    const footerOpacity = useSharedValue(0)
    const orbOneY = useSharedValue(0)
    const orbTwoY = useSharedValue(0)

    useEffect(() => {
        headerY.value = withSpring(0, { damping: 16, stiffness: 120 })
        headerOpacity.value = withTiming(1, { duration: 500 })
        heroScale.value = withDelay(180, withSpring(1, { damping: 14, stiffness: 100 }))
        heroOpacity.value = withDelay(180, withTiming(1, { duration: 550 }))
        featuresY.value = withDelay(380, withSpring(0, { damping: 16, stiffness: 110 }))
        featuresOpacity.value = withDelay(380, withTiming(1, { duration: 480 }))
        footerOpacity.value = withDelay(550, withTiming(1, { duration: 500 }))
        orbOneY.value = withRepeat(
            withSequence(
                withTiming(-16, { duration: 3400, easing: Easing.inOut(Easing.sin) }),
                withTiming(0, { duration: 3400, easing: Easing.inOut(Easing.sin) })
            ), -1, true
        )
        orbTwoY.value = withRepeat(
            withSequence(
                withTiming(14, { duration: 2800, easing: Easing.inOut(Easing.sin) }),
                withTiming(0, { duration: 2800, easing: Easing.inOut(Easing.sin) })
            ), -1, true
        )
    }, [])

    const headerStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: headerY.value }],
        opacity: headerOpacity.value,
    }))
    const heroStyle = useAnimatedStyle(() => ({
        transform: [{ scale: heroScale.value }],
        opacity: heroOpacity.value,
    }))
    const featuresStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: featuresY.value }],
        opacity: featuresOpacity.value,
    }))
    const footerStyle = useAnimatedStyle(() => ({ opacity: footerOpacity.value }))
    const orbOneStyle = useAnimatedStyle(() => ({ transform: [{ translateY: orbOneY.value }] }))
    const orbTwoStyle = useAnimatedStyle(() => ({ transform: [{ translateY: orbTwoY.value }] }))

    return (
        <View style={s.root}>
            <LinearGradient
                pointerEvents="none"
                colors={[BG, '#ebe5db', '#f5f0e8', BG]}
                locations={[0, 0.3, 0.6, 1]}
                style={StyleSheet.absoluteFillObject}
            />

            <Animated.View pointerEvents="none" style={[s.orbOne, orbOneStyle]} />
            <Animated.View pointerEvents="none" style={[s.orbTwo, orbTwoStyle]} />

            <Animated.View style={[s.headerOuter, { marginTop: insets.top + 10 }, headerStyle]}>
                <View style={s.headerBar}>
                    <View style={s.headerLeft}>
                        <LinearGradient
                            colors={[adjustBrightness(ACCENT, 20), ACCENT]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={s.headerLogo}
                        >
                            <Ionicons name="timer" size={18} color="#fff" />
                        </LinearGradient>
                        <Text style={s.headerAppName}>{APP_NAME}</Text>
                    </View>

                    <Pressable
                        onPress={() => router.push('/(auth)/login')}
                        style={({ pressed }) => [s.headerCta, pressed && { opacity: 0.82, transform: [{ scale: 0.97 }] }]}
                    >
                        <LinearGradient
                            colors={[ACCENT, adjustBrightness(ACCENT, -18)]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={s.headerCtaGrad}
                        >
                            <Text style={s.headerCtaText}>Get Started</Text>
                        </LinearGradient>
                    </Pressable>
                </View>
            </Animated.View>

            <Animated.View style={[s.heroWrap, heroStyle]}>
                <View style={s.heroIconOuter}>
                    <LinearGradient
                        colors={[adjustBrightness(ACCENT, 20), ACCENT]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={s.iconGradient}
                    >
                        <Ionicons name="timer" size={32} color="#fff" />
                    </LinearGradient>
                </View>
                <Text style={s.heroTitle}>{APP_NAME}</Text>
                <Text style={s.heroTagline}>{APP_TAGLINE}</Text>
                <Text style={s.heroDesc}>{APP_DESCRIPTION}</Text>
            </Animated.View>

            <Animated.View style={[s.featuresWrap, featuresStyle]}>
                {FEATURES.map((feat, i) => (
                    <View key={i} style={s.featureRow}>
                        <View style={s.featureIconWrap}>
                            <Ionicons name={feat.icon as any} size={18} color={ACCENT} />
                        </View>
                        <View style={s.featureTextWrap}>
                            <Text style={s.featureTitle}>{feat.title}</Text>
                            <Text style={s.featureDesc}>{feat.desc}</Text>
                        </View>
                    </View>
                ))}
            </Animated.View>

            <Animated.View style={[s.footer, footerStyle, { paddingBottom: insets.bottom + 20 }]}>
                <Pressable
                    onPress={() => router.push('/(auth)/login')}
                    hitSlop={8}
                    style={({ pressed }) => [pressed && { opacity: 0.7 }]}
                >
                    <Text style={s.signInText}>Already have an account? <Text style={s.signInLink}>Sign in</Text></Text>
                </Pressable>

                <Text style={s.legal}>
                    By continuing you agree to our{' '}
                    <Text onPress={() => router.push('/terms')} style={s.legalLink}>Terms</Text>
                    {' '}and{' '}
                    <Text onPress={() => router.push('/privacy')} style={s.legalLink}>Privacy Policy</Text>
                </Text>
            </Animated.View>
        </View>
    )
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: BG },
    orbOne: {
        position: 'absolute',
        right: -SW * 0.25,
        top: SH * 0.06,
        width: SW * 0.72,
        height: SW * 0.72,
        borderRadius: 999,
        backgroundColor: `${ACCENT}10`,
    },
    orbTwo: {
        position: 'absolute',
        left: -SW * 0.32,
        bottom: SH * 0.18,
        width: SW * 0.66,
        height: SW * 0.66,
        borderRadius: 999,
        backgroundColor: `${ACCENT}08`,
    },
    headerOuter: { alignItems: 'center', paddingHorizontal: 20 },
    headerBar: {
        width: '95%',
        height: 58,
        borderRadius: 999,
        backgroundColor: SURFACE,
        borderWidth: 1,
        borderColor: BORDER,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: 6,
        paddingRight: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    headerLogo: {
        width: 36,
        height: 36,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerAppName: { color: TEXT_PRIMARY, fontSize: 15, fontWeight: '700', letterSpacing: 0.1 },
    headerCta: { borderRadius: 999, overflow: 'hidden' },
    headerCtaGrad: { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 999 },
    headerCtaText: { color: '#fff', fontSize: 13, fontWeight: '700', letterSpacing: 0.2 },
    heroWrap: { paddingHorizontal: 24, paddingTop: 36, gap: 10, alignItems: 'center' },
    heroIconOuter: {
        width: 72,
        height: 72,
        borderRadius: 22,
        overflow: 'hidden',
        marginBottom: 8,
        shadowColor: ACCENT,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 14,
        elevation: 8,
    },
    iconGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    heroTitle: { color: TEXT_PRIMARY, fontSize: 36, fontWeight: '800', letterSpacing: -0.8, lineHeight: 42 },
    heroTagline: { color: ACCENT, fontSize: 15, fontWeight: '600', letterSpacing: 0.1 },
    heroDesc: { color: TEXT_SECONDARY, fontSize: 14, lineHeight: 21, maxWidth: 320, textAlign: 'center', marginTop: 2 },
    featuresWrap: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, gap: 14 },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        backgroundColor: SURFACE,
        borderWidth: 1,
        borderColor: BORDER,
        borderRadius: 20,
        paddingVertical: 14,
        paddingHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 1,
    },
    featureIconWrap: {
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: ACCENT_DIM,
        alignItems: 'center',
        justifyContent: 'center',
    },
    featureTextWrap: { flex: 1, gap: 2 },
    featureTitle: { color: TEXT_PRIMARY, fontSize: 14, fontWeight: '700' },
    featureDesc: { color: TEXT_SECONDARY, fontSize: 12.5 },
    footer: { paddingHorizontal: 20, gap: 10, alignItems: 'center' },
    signInText: { color: TEXT_TERTIARY, fontSize: 13 },
    signInLink: { color: ACCENT, fontWeight: '600' },
    legal: { color: TEXT_TERTIARY, textAlign: 'center', fontSize: 11, lineHeight: 17, paddingHorizontal: 8 },
    legalLink: { color: TEXT_SECONDARY, textDecorationLine: 'underline' },
})
