import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/lib/theme';

type IconName = keyof typeof Ionicons.glyphMap;

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, { outline: IconName; filled: IconName }> = {
    index: { outline: 'home-outline', filled: 'home' },
    licenses: { outline: 'document-text-outline', filled: 'document-text' },
    certificates: { outline: 'ribbon-outline', filled: 'ribbon' },
    courses: { outline: 'book-outline', filled: 'book' },
    profile: { outline: 'person-outline', filled: 'person' },
  };

  const iconSet = icons[name] || { outline: 'ellipse-outline', filled: 'ellipse' };
  const iconName = focused ? iconSet.filled : iconSet.outline;
  const color = focused ? colors.accent : colors.textMuted;

  return (
    <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
      <Ionicons name={iconName} size={22} color={color} />
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon name="index" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="licenses"
        options={{
          title: 'Licenses',
          tabBarIcon: ({ focused }) => <TabIcon name="licenses" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="certificates"
        options={{
          title: 'Certs',
          tabBarIcon: ({ focused }) => <TabIcon name="certificates" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="courses"
        options={{
          title: 'Courses',
          tabBarIcon: ({ focused }) => <TabIcon name="courses" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon name="profile" focused={focused} />,
        }}
      />

      {/* Hidden tabs - keep routes but hide from tab bar */}
      <Tabs.Screen name="agent" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />

      {/* Hidden nested routes */}
      <Tabs.Screen name="licenses/add" options={{ href: null }} />
      <Tabs.Screen name="licenses/add-dea" options={{ href: null }} />
      <Tabs.Screen name="licenses/[id]" options={{ href: null }} />
      <Tabs.Screen name="certificates/upload" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.backgroundElevated,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingTop: 8,
    paddingBottom: 8,
    height: 70,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  iconContainer: {
    padding: 4,
  },
  iconContainerFocused: {
    backgroundColor: 'rgba(166, 139, 91, 0.1)',
    borderRadius: 8,
  },
});
