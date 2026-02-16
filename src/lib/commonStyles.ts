// ─── Shared Style Objects ───
// Extracted from auth screens and other files where the same patterns repeat.

import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from './theme';

export const commonStyles = StyleSheet.create({
  /** Red-tinted container for error messages. */
  errorContainer: {
    backgroundColor: colors.riskLight + '20',
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  /** Red text for error messages. */
  errorText: {
    color: colors.risk,
    fontSize: typography.bodySmall.fontSize,
    textAlign: 'center',
  },

  /** Green-tinted container for success messages. */
  successContainer: {
    backgroundColor: colors.success + '20',
    padding: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
  },
  /** Green bold title for success states. */
  successTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: '600',
    color: colors.success,
    marginBottom: spacing.sm,
  },
  /** Body text inside success containers. */
  successText: {
    color: colors.text,
    fontSize: typography.body.fontSize,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  /** Italic subtext inside success containers. */
  successSubtext: {
    color: colors.textSecondary,
    fontSize: typography.bodySmall.fontSize,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
