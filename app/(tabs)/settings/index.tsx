import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../src/hooks/useAuth';
import { Card } from '../../../src/components/ui';
import { colors, spacing, typography, degreeTypes } from '../../../src/lib/theme';
import { useState } from 'react';

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
            <TouchableOpacity style={styles.settingsRow}>
              <Text style={styles.settingsIcon}>👤</Text>
              <Text style={styles.settingsLabel}>Edit Profile</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.settingsRow}>
              <Text style={styles.settingsIcon}>🔔</Text>
              <Text style={styles.settingsLabel}>Notifications</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.settingsRow}>
              <Text style={styles.settingsIcon}>🔗</Text>
              <Text style={styles.settingsLabel}>Connected Accounts</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          <Card padding="none">
            <TouchableOpacity style={styles.settingsRow}>
              <Text style={styles.settingsIcon}>📥</Text>
              <Text style={styles.settingsLabel}>Export Data</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.settingsRow}>
              <Text style={styles.settingsIcon}>📊</Text>
              <Text style={styles.settingsLabel}>Reports</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <Card padding="none">
            <TouchableOpacity style={styles.settingsRow}>
              <Text style={styles.settingsIcon}>❓</Text>
              <Text style={styles.settingsLabel}>Help Center</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.settingsRow}>
              <Text style={styles.settingsIcon}>📧</Text>
              <Text style={styles.settingsLabel}>Contact Support</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
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
            <Text style={styles.signOutText}>Sign Out</Text>
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
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
    textTransform: 'uppercase',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  settingsIcon: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  settingsLabel: {
    flex: 1,
    fontSize: typography.body.fontSize,
    color: colors.text,
  },
  chevron: {
    fontSize: 20,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginLeft: 52,
  },
  signOutButton: {
    backgroundColor: colors.riskLight + '20',
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
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
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
