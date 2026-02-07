import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { useAuth } from '../../src/hooks/useAuth';
import { colors, spacing, typography, degreeTypes } from '../../src/lib/theme';
import { useFadeInUp } from '../../src/lib/animations';

// Subtle bubble/bokeh overlay for luxury feel
function BubbleOverlay({ variant = 'gold' }: { variant?: 'gold' | 'navy' }) {
  const bubbles = [
    { cx: '15%', cy: '20%', r: 40, opacity: 0.08 },
    { cx: '85%', cy: '15%', r: 60, opacity: 0.06 },
    { cx: '75%', cy: '70%', r: 35, opacity: 0.07 },
    { cx: '25%', cy: '80%', r: 50, opacity: 0.05 },
    { cx: '50%', cy: '40%', r: 25, opacity: 0.04 },
    { cx: '90%', cy: '50%', r: 45, opacity: 0.06 },
    { cx: '10%', cy: '60%', r: 30, opacity: 0.05 },
    { cx: '60%', cy: '85%', r: 55, opacity: 0.04 },
    { cx: '40%', cy: '10%', r: 35, opacity: 0.06 },
    { cx: '70%', cy: '30%', r: 20, opacity: 0.05 },
  ];

  const fillColor = variant === 'gold' ? 'rgba(255, 255, 255, 1)' : 'rgba(166, 139, 91, 1)';

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        {bubbles.map((bubble, index) => (
          <Circle
            key={index}
            cx={bubble.cx}
            cy={bubble.cy}
            r={bubble.r}
            fill={fillColor}
            opacity={bubble.opacity}
          />
        ))}
      </Svg>
    </View>
  );
}

type IconName = keyof typeof Ionicons.glyphMap;

interface SettingRowProps {
  icon: IconName;
  label: string;
  onPress?: () => void;
  showChevron?: boolean;
}

function SettingRow({ icon, label, onPress, showChevron = true }: SettingRowProps) {
  return (
    <TouchableOpacity style={styles.settingsRow} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.settingsIconContainer}>
        <Ionicons name={icon} size={20} color={colors.accent} />
      </View>
      <Text style={styles.settingsLabel}>{label}</Text>
      {showChevron && (
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      )}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { profile, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const headerAnim = useFadeInUp(0);
  const cardAnim = useFadeInUp(100);
  const sectionsAnim = useFadeInUp(200);

  async function handleSignOut() {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsSigningOut(true);
              await signOut();
              router.replace('/(auth)/login');
            } catch (err) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
              setIsSigningOut(false);
            }
          },
        },
      ]
    );
  }

  const initials = profile?.full_name
    ?.split(' ')
    .map((n) => n.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header */}
        <Animated.View style={[styles.header, headerAnim]}>
          <Text style={styles.title}>Profile</Text>
        </Animated.View>

        {/* Profile Card with Gradient */}
        <Animated.View style={cardAnim}>
          <LinearGradient
            colors={['#D4AF37', '#C9A227', '#A68B5B', '#8B7349']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileCard}
          >
            <BubbleOverlay variant="gold" />
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            </View>
            <Text style={styles.profileName}>{profile?.full_name || 'Doctor'}</Text>
            <Text style={styles.profileDegree}>
              {profile?.degree_type
                ? degreeTypes[profile.degree_type as keyof typeof degreeTypes]
                : 'Medical Professional'}
            </Text>
            <View style={styles.profileStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>3</Text>
                <Text style={styles.statLabel}>Licenses</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>12</Text>
                <Text style={styles.statLabel}>Courses</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>8</Text>
                <Text style={styles.statLabel}>Certs</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Settings Sections */}
        <Animated.View style={sectionsAnim}>
          <Text style={styles.sectionTitle}>ACCOUNT</Text>
          <View style={styles.settingsCard}>
            <SettingRow icon="person-outline" label="Edit Profile" />
            <View style={styles.divider} />
            <SettingRow icon="notifications-outline" label="Notifications" />
            <View style={styles.divider} />
            <SettingRow icon="link-outline" label="Connected Accounts" />
          </View>

          <Text style={styles.sectionTitle}>DATA</Text>
          <View style={styles.settingsCard}>
            <SettingRow icon="download-outline" label="Export Data" />
            <View style={styles.divider} />
            <SettingRow icon="document-text-outline" label="Reports" />
          </View>

          <Text style={styles.sectionTitle}>SUPPORT</Text>
          <View style={styles.settingsCard}>
            <SettingRow icon="help-circle-outline" label="Help Center" />
            <View style={styles.divider} />
            <SettingRow icon="mail-outline" label="Contact Support" />
          </View>

          {/* Sign Out */}
          <TouchableOpacity
            style={[styles.signOutButton, isSigningOut && styles.signOutButtonDisabled]}
            onPress={handleSignOut}
            disabled={isSigningOut}
            activeOpacity={0.7}
          >
            {isSigningOut ? (
              <>
                <ActivityIndicator size="small" color={colors.risk} style={styles.spinner} />
                <Text style={styles.signOutText}>Signing out...</Text>
              </>
            ) : (
              <>
                <Ionicons name="log-out-outline" size={20} color={colors.risk} />
                <Text style={styles.signOutText}>Sign Out</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Version */}
          <Text style={styles.version}>CME Agent v1.0.0</Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.text,
  },
  profileCard: {
    borderRadius: 20,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
    overflow: 'hidden',
  },
  avatarContainer: {
    marginBottom: spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileName: {
    ...typography.h2,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  profileDegree: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: spacing.lg,
  },
  profileStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statLabel: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
    letterSpacing: 1,
  },
  settingsCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    paddingVertical: 14,
  },
  settingsIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.backgroundElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  settingsLabel: {
    flex: 1,
    ...typography.body,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 60,
  },
  signOutButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  signOutButtonDisabled: {
    opacity: 0.6,
  },
  spinner: {
    marginRight: spacing.sm,
  },
  signOutText: {
    ...typography.label,
    color: colors.risk,
  },
  version: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
