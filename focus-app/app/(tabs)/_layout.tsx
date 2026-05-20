import { Tabs } from 'expo-router'
import { LayoutGrid, Timer, BarChart3, Trophy, Settings } from 'lucide-react-native'
import TabBar, { TAB_BAR_HEIGHT } from '@/components/TabBar'
import { BG } from '@/lib/theme'

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: BG },
        tabBarStyle: { height: TAB_BAR_HEIGHT },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <LayoutGrid size={size} color={color} strokeWidth={1.6} />
          ),
        }}
      />

      <Tabs.Screen
        name="focus"
        options={{
          tabBarLabel: 'Focus',
          tabBarIcon: ({ color, size }) => (
            <Timer size={size} color={color} strokeWidth={1.6} />
          ),
        }}
      />

      <Tabs.Screen
        name="stats"
        options={{
          tabBarLabel: 'Stats',
          tabBarIcon: ({ color, size }) => (
            <BarChart3 size={size} color={color} strokeWidth={1.6} />
          ),
        }}
      />

      <Tabs.Screen
        name="rewards"
        options={{
          tabBarLabel: 'Rewards',
          tabBarIcon: ({ color, size }) => (
            <Trophy size={size} color={color} strokeWidth={1.6} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Settings size={size} color={color} strokeWidth={1.6} />
          ),
        }}
      />
    </Tabs>
  )
}
