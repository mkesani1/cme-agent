import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../src/hooks/useAuth';
import { Card } from '../../../src/components/ui';
import { colors, spacing, typography, degreeTypes } from '../../../src/lib/theme';
import { useState } from 'react';

type IconName = keyof typeof Ionicons.glyphMap;

interface SettingRowProps {
  icon: IconName;
  label: string;
  onPress?: () => void;
}

function SettingRow({ icon, label, onPress }: SettingRowProps) {
  return (
    <TouchableOpacity style={styles.settingsRow} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.settingsIconContainer}>
        <Ionicons name={icon} size={18} color={colors.accent} />
      </View>
      <Text style={styles.settingsLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { profile, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Settings</Text>

        {/* Profile Section */}
        <Card style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile?.full_name?.charAt(0) || '?'}
            </Text>
          </View>
          <Text style={styles.profileName}>{profile?.full_name}</Text>
          <Text style={styles.profileDegree}>
            {profile?.degree_type ? degreeTypes[profile.degree_type as keyof typeof degreeTypes] : 'No degree set'}
          </Text>
        </Card>

        {/* Settings Sections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <Card padding="none">
            <SettingRow icon="person-outline" label="Edit Profile" />
            <View style={styles.divider} />
            <SettingRow icon="notifications-outline" label="Notifications" />
            <View style={styles.divider} />
            <SettingRow icon="link-outline" label="Connected Accounts" />
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          <Card padding="none">
            <SettingRow icon="download-outline" label="Export Data" />
            <View style={styles.divider} />
            <SettingRow icon="bar-chart-outline" label="Reports" />
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <Card padding="none">
            <SettingRow icon="help-circle-outline" label="Help Center" />
            <View style={styles.divider} />
            <SettingRow icon="mail-outline" label="Contact Support" />
          </Card>
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          style={[styles.signOutButton, isSigningOut && styles.signOutButtonDisabled]}
          onPress={handleSignOut}
          disabled={isSigningOut}
        >
          {isSigningOut ? (
            <>
              <ActivityIndicator size="small" color={colors.risk} style={styles.spinner} />
              <Text style={styles.signOutText}>Signing out...</Text>
            </>
          ) : (
            <>
              <Ionicons name="log-out-outline" size={18} color={colors.risk} style={styles.spinner} />
              <Text style={styles.signOutText}>Sign Out</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Version */}
        <Text style={styles.version}>CME Agent v1.0.0</Text>
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
  title: {
    fontSize: typography.h1.fontSize,
    fontWeight: typography.h1.fontWeight,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  profileCard: {
    alignItems: 'center',
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileName: {
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  profileDegree: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.label.fontSize,
    fontWeight: typography.label.fontWeight,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    paddingVertical: 14,
  },
  settingsIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.backgroundElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  settingsLabel: {
    flex: 1,
    fontSize: typography.body.fontSize,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginLeft: 56,
  },
  signOutButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
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
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.risk,
  },
  version: {
    fontSize: typography.caption.fontSize,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
