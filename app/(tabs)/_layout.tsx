import { Tabs } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePathname, router } from 'expo-router';
import { colors } from '../../src/lib/theme';

type IconName = keyof typeof Ionicons.glyphMap;

// Define exactly 5 tabs we want to show
const TAB_CONFIG = [
  { name: 'index', title: 'Home', icon: 'home', route: '/(tabs)' },
  { name: 'licenses', title: 'Licenses', icon: 'document-text', route: '/(tabs)/licenses' },
  { name: 'certificates', title: 'Certs', icon: 'ribbon', route: '/(tabs)/certificates' },
  { name: 'courses', title: 'Courses', icon: 'book', route: '/(tabs)/courses' },
  { name: 'profile', title: 'Profile', icon: 'person', route: '/(tabs)/profile' },
] as const;

function CustomTabBar() {
  const pathname = usePathname();

  const isActive = (tabName: string) => {
    if (tabName === 'index') {
      return pathname === '/' || pathname === '/(tabs)' || pathname === '';
    }
    return pathname.includes(`/${tabName}`);
  };

  return (
    <View style={styles.tabBar}>
      {TAB_CONFIG.map((tab) => {
        const active = isActive(tab.name);
        const iconName = (active ? tab.icon : `${tab.icon}-outline`) as IconName;
        const color = active ? colors.accent : colors.textMuted;

        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tabItem}
            onPress={() => router.push(tab.route as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, active && styles.iconContainerFocused]}>
              <Ionicons name={iconName} size={22} color={color} />
            </View>
            <Text style={[styles.tabLabel, { color }]}>{tab.title}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={() => <CustomTabBar />}
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Main visible tabs */}
      <Tabs.Screen name="index" />
      <Tabs.Screen name="licenses" />
      <Tabs.Screen name="certificates" />
      <Tabs.Screen name="courses" />
      <Tabs.Screen name="profile" />

      {/* Hidden routes - still accessible but not in tab bar */}
      <Tabs.Screen name="agent" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundElevated,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingTop: 8,
    paddingBottom: 24,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    padding: 6,
    borderRadius: 10,
    marginBottom: 2,
  },
  iconContainerFocused: {
    backgroundColor: 'rgba(166, 139, 91, 0.15)',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
});
