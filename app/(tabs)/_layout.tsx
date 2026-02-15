import { Tabs } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePathname, router } from 'expo-router';
import { useRef, useEffect } from 'react';
import { colors } from '../../src/lib/theme';
import * as Haptics from 'expo-haptics';

type IconName = keyof typeof Ionicons.glyphMap;

// Define 5 tabs with AI Agent in prominent center position
const TAB_CONFIG = [
  { name: 'index', title: 'Home', icon: 'home', route: '/(tabs)', isCenter: false },
  { name: 'licenses', title: 'Licenses', icon: 'document-text', route: '/(tabs)/licenses', isCenter: false },
  { name: 'agent', title: 'AI Agent', icon: 'sparkles', route: '/(tabs)/agent', isCenter: true },
  { name: 'courses', title: 'Courses', icon: 'book', route: '/(tabs)/courses', isCenter: false },
  { name: 'profile', title: 'Profile', icon: 'person', route: '/(tabs)/profile', isCenter: false },
] as const;

function CustomTabBar() {
  const pathname = usePathname();
  const scaleAnims = useRef(TAB_CONFIG.map(() => new Animated.Value(1))).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Subtle pulse animation for AI Agent button
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const isActive = (tabName: string) => {
    if (tabName === 'index') {
      return pathname === '/' || pathname === '/(tabs)' || pathname === '';
    }
    return pathname.includes(`/${tabName}`);
  };

  const handlePress = (tab: typeof TAB_CONFIG[number], index: number) => {
    // Haptic feedback
    Haptics.impactAsync(
      tab.isCenter ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light
    );

    // Scale animation
    Animated.sequence([
      Animated.timing(scaleAnims[index], {
        toValue: 0.92,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnims[index], {
        toValue: 1,
        friction: 3,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();

    router.push(tab.route as any);
  };

  return (
    <View style={styles.tabBar}>
      {TAB_CONFIG.map((tab, index) => {
        const active = isActive(tab.name);

        // Center AI Agent tab has special styling
        if (tab.isCenter) {
          return (
            <Animated.View
              key={tab.name}
              style={[
                styles.tabItem,
                { transform: [{ scale: Animated.multiply(scaleAnims[index], active ? 1 : pulseAnim) }] }
              ]}
            >
              <TouchableOpacity
                style={styles.centerTabTouchable}
                onPress={() => handlePress(tab, index)}
                activeOpacity={0.8}
              >
                <View style={[styles.centerIconContainer, active && styles.centerIconContainerActive]}>
                  <Ionicons name="sparkles" size={26} color="#FFFFFF" />
                </View>
                <Text style={[styles.centerTabLabel, active && styles.centerTabLabelActive]}>
                  {tab.title}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          );
        }

        const iconName = (active ? tab.icon : `${tab.icon}-outline`) as IconName;
        const color = active ? colors.accent : colors.textMuted;

        return (
          <Animated.View
            key={tab.name}
            style={[styles.tabItem, { transform: [{ scale: scaleAnims[index] }] }]}
          >
            <TouchableOpacity
              style={styles.tabTouchable}
              onPress={() => handlePress(tab, index)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, active && styles.iconContainerFocused]}>
                <Ionicons name={iconName} size={22} color={color} />
              </View>
              <Text style={[styles.tabLabel, { color }]}>{tab.title}</Text>
            </TouchableOpacity>
          </Animated.View>
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
      {/* Main visible tabs - AI Agent in center position */}
      <Tabs.Screen name="index" />
      <Tabs.Screen name="licenses" />
      <Tabs.Screen name="agent" />
      <Tabs.Screen name="courses" />
      <Tabs.Screen name="profile" />

      {/* Hidden routes - still accessible but not in tab bar */}
      <Tabs.Screen name="certificates" options={{ href: null }} />
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
    paddingHorizontal: 4,
    alignItems: 'flex-end',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabTouchable: {
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
  // Center AI Agent tab - elevated & prominent
  centerTabTouchable: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20, // Elevate above other tabs
  },
  centerIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 4,
  },
  centerIconContainerActive: {
    backgroundColor: '#D4B896', // Lighter gold when active
    shadowOpacity: 0.6,
  },
  centerTabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.accent,
  },
  centerTabLabelActive: {
    color: '#D4B896',
  },
});
