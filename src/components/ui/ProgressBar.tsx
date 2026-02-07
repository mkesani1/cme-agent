import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius, spacing, typography } from '../../lib/theme';

interface ProgressBarProps {
  progress: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  style?: ViewStyle;
}

export function ProgressBar({
  progress,
  label,
  showPercentage = false,
  size = 'md',
  color = colors.success,
  style,
}: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  // Determine color based on progress
  const barColor = progress >= 100 ? colors.success :
                   progress >= 75 ? color :
                   progress >= 50 ? colors.warning :
                   colors.risk;

  return (
    <View style={[styles.container, style]}>
      {(label || showPercentage) && (
        <View style={styles.labelRow}>
          {label && <Text style={styles.label}>{label}</Text>}
          {showPercentage && (
            <Text style={styles.percentage}>{Math.round(clampedProgress)}%</Text>
          )}
        </View>
      )}
      <View style={[styles.track, styles[`track_${size}`]]}>
        <View
          style={[
            styles.bar,
            styles[`bar_${size}`],
            { width: `${clampedProgress}%`, backgroundColor: barColor },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.text,
  },
  percentage: {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  track: {
    backgroundColor: colors.navy[600],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  track_sm: {
    height: 4,
  },
  track_md: {
    height: 8,
  },
  track_lg: {
    height: 12,
  },
  bar: {
    borderRadius: borderRadius.full,
  },
  bar_sm: {
    height: 4,
  },
  bar_md: {
    height: 8,
  },
  bar_lg: {
    height: 12,
  },
});
