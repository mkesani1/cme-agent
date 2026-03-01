import React, { useState, useEffect, useCallback } from 'react';
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
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../src/hooks/useAuth';
import { supabase } from '../../src/lib/supabase';
import { colors, spacing, typography, degreeTypes } from '../../src/lib/theme';
import { useFadeInUp, useCountUp } from '../../src/lib/animations';
import { TEAL_GRADIENT } from '../../src/lib/license-utils';
import { BubbleOverlay } from '../../src/components/ui';

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
  const { user, profile, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [stats, setStats] = useState({ licenses: 0, courses: 0, certs: 0 });
  const headerAnim = useFadeInUp(0);
  const cardAnim = useFadeInUp(100);
  const sectionsAnim = useFadeInUp(200);

  // Animated count-up for profile stats
  const animatedLicenses = useCountUp(stats.licenses, 600, 300);
  const animatedCourses = useCountUp(stats.courses, 600, 400);
  const animatedCerts = useCountUp(stats.certs, 600, 500);

  // Reload stats every time profile tab gains focus (covers post-onboarding)
  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      async function loadStats() {
        const [licRes, certRes] = await Promise.all([
          supabase.from('licenses').select('id', { count: 'exact', head: true }).eq('user_id', user!.id),
          supabase.from('certificates').select('id', { count: 'exact', head: true }).eq('user_id', user!.id),
        ]);
        setStats({
          licenses: licRes.count ?? 0,
          courses: certRes.count ?? 0,  // completed courses = certificates
          certs: certRes.count ?? 0,
        });
      }
      loadStats();
    }, [user])
  );

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
            colors={[...TEAL_GRADIENT]}
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
                <Text style={styles.statValue}>{animatedLicenses}</Text>
                <Text style={styles.statLabel}>Licenses</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{animatedCourses}</Text>
                <Text style={styles.statLabel}>Courses</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{animatedCerts}</Text>
                <Text style={styles.statLabel}>Certs</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Settings Sections */}
        <Animated.View style={sectionsAnim}>
          <Text style={styles.sectionTitle}>ACCOUNT</Text>
          <View style={styles.settingsCard}>
            <SettingRow
              icon="person-outline"
              label="Edit Profile"
              onPress={() => router.push('/(tabs)/settings/edit-profile')}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="notifications-outline"
              label="Notifications"
              onPress={() => router.push('/(tabs)/settings/notifications')}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="link-outline"
              label="Connected Accounts"
              onPress={() => Alert.alert('Coming Soon', 'Connected accounts feature will be available in a future update.')}
            />
          </View>

          <Text style={styles.sectionTitle}>DATA</Text>
          <View style={styles.settingsCard}>
            <SettingRow
              icon="download-outline"
              label="Export Data"
              onPress={() => router.push('/(tabs)/settings/export-data')}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="document-text-outline"
              label="Reports"
              onPress={() => router.push('/(tabs)/settings/reports')}
            />
          </View>

          <Text style={styles.sectionTitle}>SUPPORT</Text>
          <View style={styles.settingsCard}>
            <SettingRow
              icon="help-circle-outline"
              label="Help Center"
              onPress={() => router.push('/(tabs)/settings/help')}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="mail-outline"
              label="Contact Support"
              onPress={() => {
                const { Linking } = require('react-native');
                Linking.openURL('mailto:support@cmeagent.com?subject=CME%20Agent%20Support');
              }}
            />
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
