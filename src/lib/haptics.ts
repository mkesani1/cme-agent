// ─── Centralized Haptic Feedback ───
// Wraps expo-haptics to avoid repeating the verbose enum paths everywhere.

import * as Haptics from 'expo-haptics';

type ImpactLevel = 'light' | 'medium' | 'heavy';
type NotificationType = 'success' | 'error' | 'warning';

const impactMap: Record<ImpactLevel, Haptics.ImpactFeedbackStyle> = {
  light: Haptics.ImpactFeedbackStyle.Light,
  medium: Haptics.ImpactFeedbackStyle.Medium,
  heavy: Haptics.ImpactFeedbackStyle.Heavy,
};

const notificationMap: Record<NotificationType, Haptics.NotificationFeedbackType> = {
  success: Haptics.NotificationFeedbackType.Success,
  error: Haptics.NotificationFeedbackType.Error,
  warning: Haptics.NotificationFeedbackType.Warning,
};

/** Trigger a haptic impact (tap-like feel). */
export function triggerHaptic(level: ImpactLevel = 'light') {
  Haptics.impactAsync(impactMap[level]);
}

/** Trigger a notification haptic (success/error/warning). */
export function triggerNotification(type: NotificationType) {
  Haptics.notificationAsync(notificationMap[type]);
}
