import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../../src/lib/theme';

interface NotificationSettingProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

function NotificationSetting({
  icon,
  title,
  description,
  value,
  onValueChange,
}: NotificationSettingProps) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={20} color={colors.accent} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.accent }}
        thumbColor="#FFFFFF"
        ios_backgroundColor={colors.border}
      />
    </View>
  );
}

export default function NotificationsScreen() {
  const [settings, setSettings] = useState({
    pushEnabled: true,
    emailEnabled: true,
    renewalReminders: true,
    courseRecommendations: true,
    deadlineAlerts: true,
    weeklyDigest: false,
    marketingUpdates: false,
  });

  const updateSetting = (key: keyof typeof settings, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    // In production, save to Supabase
  };

  const handleTestNotification = () => {
    Alert.alert(
      'Test Notification',
      'A test notification would be sent to your device.',
      [{ text: 'OK' }]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Notifications',
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          {/* Push Notifications */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>DELIVERY METHOD</Text>
            <View style={styles.card}>
              <NotificationSetting
                icon="notifications"
                title="Push Notifications"
                description="Receive notifications on your device"
                value={settings.pushEnabled}
                onValueChange={(v) => updateSetting('pushEnabled', v)}
              />
              <View style={styles.divider} />
              <NotificationSetting
                icon="mail"
                title="Email Notifications"
                description="Receive notifications via email"
                value={settings.emailEnabled}
                onValueChange={(v) => updateSetting('emailEnabled', v)}
              />
            </View>
          </View>

          {/* Notification Types */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>NOTIFICATION TYPES</Text>
            <View style={styles.card}>
              <NotificationSetting
                icon="calendar"
                title="Renewal Reminders"
                description="Get reminded before licenses expire"
                value={settings.renewalReminders}
                onValueChange={(v) => updateSetting('renewalReminders', v)}
              />
              <View style={styles.divider} />
              <NotificationSetting
                icon="school"
                title="Course Recommendations"
                description="Receive personalized course suggestions"
                value={settings.courseRecommendations}
                onValueChange={(v) => updateSetting('courseRecommendations', v)}
              />
              <View style={styles.divider} />
              <NotificationSetting
                icon="alert-circle"
                title="Deadline Alerts"
                description="Urgent alerts for approaching deadlines"
                value={settings.deadlineAlerts}
                onValueChange={(v) => updateSetting('deadlineAlerts', v)}
              />
              <View style={styles.divider} />
              <NotificationSetting
                icon="newspaper"
                title="Weekly Digest"
                description="Summary of your CME progress each week"
                value={settings.weeklyDigest}
                onValueChange={(v) => updateSetting('weeklyDigest', v)}
              />
            </View>
          </View>

          {/* Marketing */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>OTHER</Text>
            <View style={styles.card}>
              <NotificationSetting
                icon="megaphone"
                title="Marketing Updates"
                description="News about new features and promotions"
                value={settings.marketingUpdates}
                onValueChange={(v) => updateSetting('marketingUpdates', v)}
              />
            </View>
          </View>

          {/* Test Button */}
          <TouchableOpacity
            style={styles.testButton}
            onPress={handleTestNotification}
            activeOpacity={0.7}
          >
            <Ionicons name="paper-plane-outline" size={20} color={colors.accent} />
            <Text style={styles.testButtonText}>Send Test Notification</Text>
          </TouchableOpacity>

          {/* Info */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={20} color={colors.textMuted} />
            <Text style={styles.infoText}>
              You can also manage notification permissions in your device settings.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
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
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    paddingVertical: spacing.md,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.backgroundElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  settingContent: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  settingDescription: {
    ...typography.caption,
    color: colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 60,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: 'rgba(196, 165, 116, 0.1)',
    marginBottom: spacing.lg,
  },
  testButtonText: {
    ...typography.body,
    color: colors.accent,
    fontWeight: '600',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    backgroundColor: colors.backgroundElevated,
    borderRadius: 12,
    gap: spacing.sm,
  },
  infoText: {
    flex: 1,
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 18,
  },
});
