import React, { useRef, useEffect } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../lib/theme';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  animValue?: Animated.Value;
}

/** Chat bubble with spring slide-in animation. */
export function MessageBubble({ message }: { message: Message }) {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const isUser = message.role === 'user';

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.messageBubble,
        isUser ? styles.userBubble : styles.assistantBubble,
        {
          opacity: slideAnim,
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        },
      ]}
    >
      {!isUser && (
        <View style={styles.assistantHeader}>
          <View style={styles.messageAvatar}>
            <Ionicons name="sparkles" size={10} color="#FFF" />
          </View>
          <Text style={styles.assistantLabel}>CME Agent</Text>
        </View>
      )}
      <Text style={[styles.messageText, isUser && styles.userText]}>
        {message.content}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  messageBubble: {
    maxWidth: '85%',
    padding: spacing.md,
    borderRadius: 16,
    marginBottom: spacing.sm,
  },
  userBubble: {
    backgroundColor: colors.accent,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: colors.card,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  assistantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  messageAvatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  assistantLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  messageText: {
    fontSize: typography.body.fontSize,
    color: colors.text,
    lineHeight: 22,
  },
  userText: {
    color: '#FFFFFF',
  },
});
