import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextInputProps,
  Animated,
} from 'react-native';
import { colors, borderRadius, spacing, typography } from '../../lib/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  error,
  containerStyle,
  style,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const focusAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(focusAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false, // required for color interpolation
    }).start();
  }, [isFocused]);

  const animatedBorderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.accent],
  });

  const animatedBorderWidth = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1.5, 2],
  });

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Animated.View
        style={[
          styles.inputWrapper,
          {
            borderColor: error ? colors.risk : animatedBorderColor,
            borderWidth: error ? 1.5 : animatedBorderWidth,
          },
        ]}
      >
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.textSecondary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
      </Animated.View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: typography.label.fontSize,
    fontWeight: typography.label.fontWeight,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  inputWrapper: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  input: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    fontSize: typography.body.fontSize,
    color: colors.text,
  },
  error: {
    fontSize: typography.caption.fontSize,
    color: colors.risk,
    marginTop: spacing.xs,
  },
});
