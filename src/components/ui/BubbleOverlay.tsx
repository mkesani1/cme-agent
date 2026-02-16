import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const BUBBLES = [
  { cx: '15%', cy: '20%', r: 40, opacity: 0.08 },
  { cx: '85%', cy: '15%', r: 60, opacity: 0.06 },
  { cx: '75%', cy: '70%', r: 35, opacity: 0.07 },
  { cx: '25%', cy: '80%', r: 50, opacity: 0.05 },
  { cx: '50%', cy: '40%', r: 25, opacity: 0.04 },
  { cx: '90%', cy: '50%', r: 45, opacity: 0.06 },
  { cx: '10%', cy: '60%', r: 30, opacity: 0.05 },
  { cx: '60%', cy: '85%', r: 55, opacity: 0.04 },
  { cx: '40%', cy: '10%', r: 35, opacity: 0.06 },
  { cx: '70%', cy: '30%', r: 20, opacity: 0.05 },
];

const FILL_COLORS = {
  gold: 'rgba(255, 255, 255, 1)',
  navy: 'rgba(166, 139, 91, 1)',
} as const;

interface BubbleOverlayProps {
  variant?: 'gold' | 'navy';
}

export function BubbleOverlay({ variant = 'gold' }: BubbleOverlayProps) {
  const fillColor = FILL_COLORS[variant];

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        {BUBBLES.map((bubble, index) => (
          <Circle
            key={index}
            cx={bubble.cx}
            cy={bubble.cy}
            r={bubble.r}
            fill={fillColor}
            opacity={bubble.opacity}
          />
        ))}
      </Svg>
    </View>
  );
}
