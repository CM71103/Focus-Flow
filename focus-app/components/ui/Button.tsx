import { Pressable, StyleSheet, ActivityIndicator, type PressableProps, type ViewStyle } from 'react-native'
import { Text } from './Text'
import { ACCENT, ACCENT_DIM, ACCENT_BORDER, BG, SURFACE, BORDER, TEXT_PRIMARY, TEXT_SECONDARY } from '@/lib/theme'
import { LinearGradient } from 'expo-linear-gradient'
import { adjustBrightness } from '@/lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
type ButtonSize    = 'sm' | 'md' | 'lg'

interface ButtonProps extends Omit<PressableProps, 'style'> {
  label:    string
  variant?: ButtonVariant
  size?:    ButtonSize
  loading?: boolean
  style?:   ViewStyle
  fullWidth?: boolean
}

const SIZE_STYLES: Record<ButtonSize, { height: number; borderRadius: number; paddingHorizontal: number; fontSize: number }> = {
  sm:  { height: 36, borderRadius: 18, paddingHorizontal: 16, fontSize: 13 },
  md:  { height: 48, borderRadius: 24, paddingHorizontal: 20, fontSize: 15 },
  lg:  { height: 56, borderRadius: 28, paddingHorizontal: 24, fontSize: 16 },
}

export function Button({
  label,
  variant   = 'primary',
  size      = 'md',
  loading   = false,
  style,
  fullWidth = false,
  disabled,
  ...rest
}: ButtonProps) {
  const sz      = SIZE_STYLES[size]
  const isDisabled = disabled || loading

  const containerStyle: ViewStyle = {
    height:          sz.height,
    borderRadius:    sz.borderRadius,
    paddingHorizontal: sz.paddingHorizontal,
    alignItems:      'center',
    justifyContent:  'center',
    alignSelf:       fullWidth ? 'stretch' : 'flex-start',
    opacity:         isDisabled ? 0.4 : 1,
    overflow:        'hidden',
    ...(variant === 'secondary' && {
      backgroundColor: ACCENT_DIM,
      borderWidth: 1,
      borderColor: ACCENT_BORDER,
    }),
    ...(variant === 'outline' && {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: BORDER,
    }),
    ...(variant === 'ghost' && {
      backgroundColor: 'transparent',
    }),
    ...(variant === 'destructive' && {
      backgroundColor: 'rgba(231,76,60,0.1)',
      borderWidth: 1,
      borderColor: 'rgba(231,76,60,0.2)',
    }),
  }

  const textColor =
    variant === 'primary'     ? '#fff' :
    variant === 'secondary'   ? ACCENT :
    variant === 'outline'     ? TEXT_PRIMARY :
    variant === 'ghost'       ? TEXT_SECONDARY :
    variant === 'destructive' ? '#e74c3c' :
    TEXT_PRIMARY

  return (
    <Pressable
      style={({ pressed }) => [
        containerStyle,
        pressed && !isDisabled && { opacity: 0.85 },
        style,
      ]}
      disabled={isDisabled}
      {...rest}
    >
      {variant === 'primary' && (
        <LinearGradient
          colors={[ACCENT, adjustBrightness(ACCENT, -15)]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFillObject}
        />
      )}
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#fff' : ACCENT}
        />
      ) : (
        <Text style={{ color: textColor, fontSize: sz.fontSize, fontWeight: '600' }}>
          {label}
        </Text>
      )}
    </Pressable>
  )
}
