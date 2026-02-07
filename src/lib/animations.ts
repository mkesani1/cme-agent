// CME Agent - Animation Utilities
// Micro-animations for premium feel

import { Animated, Easing } from 'react-native';
import { useRef, useEffect } from 'react';

// Animation timing constants
export const timing = {
  fast: 200,
  normal: 300,
  slow: 500,
  stagger: 100,
} as const;

// Easing curves for smooth animations
export const easings = {
  smooth: Easing.bezier(0.4, 0, 0.2, 1),
  bounce: Easing.bezier(0.68, -0.55, 0.265, 1.55),
  decelerate: Easing.out(Easing.cubic),
  accelerate: Easing.in(Easing.cubic),
} as const;

// Hook for fade-in-up animation on mount
export function useFadeInUp(delay: number = 0) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: timing.normal,
          easing: easings.smooth,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: timing.normal,
          easing: easings.smooth,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);

    return () => clearTimeout(timeout);
  }, []);

  return {
    opacity,
    transform: [{ translateY }],
  };
}

// Hook for slide-in-right animation
export function useSlideInRight(delay: number = 0) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: timing.normal,
          easing: easings.smooth,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: 0,
          duration: timing.normal,
          easing: easings.smooth,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);

    return () => clearTimeout(timeout);
  }, []);

  return {
    opacity,
    transform: [{ translateX }],
  };
}

// Hook for scale animation (press feedback)
export function useScalePress() {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      friction: 8,
      tension: 100,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
      tension: 100,
    }).start();
  };

  return {
    scale,
    onPressIn,
    onPressOut,
  };
}

// Hook for pulsing glow effect
export function usePulseGlow() {
  const glowOpacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(glowOpacity, {
          toValue: 0.6,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 0.3,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  return glowOpacity;
}

// Hook for progress bar animation
export function useProgressAnimation(targetValue: number, duration: number = 1000) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: targetValue,
      duration,
      easing: easings.decelerate,
      useNativeDriver: false, // width animation can't use native driver
    }).start();
  }, [targetValue]);

  return progress;
}

// Hook for staggered list animation
export function useStaggeredList(itemCount: number, baseDelay: number = 0) {
  const animations = useRef(
    Array.from({ length: itemCount }, () => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(15),
    }))
  ).current;

  useEffect(() => {
    const animationSequence = animations.map((anim, index) => {
      return Animated.parallel([
        Animated.timing(anim.opacity, {
          toValue: 1,
          duration: timing.normal,
          easing: easings.smooth,
          useNativeDriver: true,
          delay: baseDelay + index * timing.stagger,
        }),
        Animated.timing(anim.translateY, {
          toValue: 0,
          duration: timing.normal,
          easing: easings.smooth,
          useNativeDriver: true,
          delay: baseDelay + index * timing.stagger,
        }),
      ]);
    });

    Animated.stagger(timing.stagger, animationSequence).start();
  }, []);

  return animations.map((anim) => ({
    opacity: anim.opacity,
    transform: [{ translateY: anim.translateY }],
  }));
}

// Animated card wrapper component style generator
export function createAnimatedStyle(
  opacity: Animated.Value,
  transform: { translateY?: Animated.Value; translateX?: Animated.Value; scale?: Animated.Value }[]
) {
  return {
    opacity,
    transform,
  };
}
