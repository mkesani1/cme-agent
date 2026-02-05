import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius, spacing, cmeCategories, CMECategory } from '../../lib/theme';

interface CategoryTagProps {
  category: CMECategory;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export function CategoryTag({ category, size = 'md', style }: CategoryTagProps) {
  const categoryInfo = cmeCategories[category];

  return (
    <View
      style={[
        styles.tag,
        styles[`size_${size}`],
        { backgroundColor: categoryInfo.color + '20' }, // 20% opacity
        style
      ]}
    >
      <View style={[styles.dot, { backgroundColor: categoryInfo.color }]} />
      <Text style={[styles.label, styles[`label_${size}`], { color: categoryInfo.color }]}>
        {categoryInfo.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.full,
  },
  size_sm: {
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
  },
  size_md: {
    paddingVertical: 4,
    paddingHorizontal: spacing.md,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: spacing.xs,
  },
  label: {
    fontWeight: '600',
  },
  label_sm: {
    fontSize: 10,
  },
  label_md: {
    fontSize: 12,
  },
});
