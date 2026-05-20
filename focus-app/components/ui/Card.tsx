import { View, StyleSheet, type ViewProps } from 'react-native'
import { SURFACE, BORDER } from '@/lib/theme'

interface CardProps extends ViewProps {
  compact?: boolean
}

export function Card({ compact, style, children, ...rest }: CardProps) {
  return (
    <View
      style={[
        styles.card,
        compact ? styles.compact : styles.normal,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor:  SURFACE,
    borderRadius:     24,
    // Soft shadow for cream aesthetic
    shadowColor:      '#000',
    shadowOffset:     { width: 0, height: 2 },
    shadowOpacity:    0.06,
    shadowRadius:     12,
    elevation:        2,
  },
  normal:  { padding: 20 },
  compact: { padding: 14 },
})
