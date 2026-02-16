import React, { useRef } from 'react';
import { Animated, TouchableOpacity, ViewStyle } from 'react-native';
import { triggerHaptic } from '../../lib/haptics';

interface PressableCardProps {
  children: React.ReactNode;
  onPress: () => void;
  style?: ViewStyle | ViewStyle[];
  hapticStyle?: 'light' | 'medium' | 'heavy';
}

/** Card with scale-down + lift animation and haptic feedback on press. */
export function PressableCard({
  children,
  onPress,
  style,
  hapticStyle = 'light',
}: PressableCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    triggerHaptic(hapticStyle);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.97,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.spring(translateAnim, {
        toValue: -4,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.spring(translateAnim, {
        toValue: 0,
        friction: 3,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [
            { scale: scaleAnim },
            { translateY: translateAnim },
          ],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}
