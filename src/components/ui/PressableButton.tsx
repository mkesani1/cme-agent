import React, { useRef } from 'react';
import { Animated, TouchableOpacity, ViewStyle } from 'react-native';
import { triggerHaptic } from '../../lib/haptics';

interface PressableButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  style?: ViewStyle | ViewStyle[];
}

/** Button with scale animation and haptic feedback on press. */
export function PressableButton({
  children,
  onPress,
  style,
}: PressableButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    triggerHaptic('light');
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 80,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[style, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{ width: '100%' }}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}
