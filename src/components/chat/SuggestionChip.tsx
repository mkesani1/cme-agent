import React, { useRef } from 'react';
import { View, Text, Animated, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { triggerHaptic } from '../../lib/haptics';
import { colors, spacing, typography } from '../../lib/theme';

interface SuggestionChipProps {
  icon: string;
  text: string;
  color: string;
  onPress: () => void;
}

/** Pressable chip with icon, text, and scale animation. */
export function SuggestionChip({ icon, text, color, onPress }: SuggestionChipProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    triggerHaptic('light');
    Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={styles.suggestionChip}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        <View style={[styles.suggestionIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon as any} size={16} color={color} />
        </View>
        <Text style={styles.suggestionText}>{text}</Text>
        <Ionicons name="arrow-forward" size={14} color={colors.textMuted} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  suggestionIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  suggestionText: {
    flex: 1,
    fontSize: typography.body.fontSize,
    color: colors.text,
  },
});
