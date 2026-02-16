import { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { triggerHaptic, triggerNotification } from '../../src/lib/haptics';
import { useAuth } from '../../src/hooks/useAuth';
import { useDemo } from '../../src/hooks/useDemo';
import { supabase } from '../../src/lib/supabase';
import { colors, spacing, typography } from '../../src/lib/theme';
import { EDGE_FUNCTIONS } from '../../src/lib/config';
import { TypingIndicator, MessageBubble, SuggestionChip } from '../../src/components/chat';
import type { Message } from '../../src/components/chat';

interface License {
  state: string;
  total_credits_required: number | null;
  expiry_date: string | null;
  credits_earned?: number;
  requirements?: Array<{ category: string; required: number; earned: number }>;
}

const SUGGESTED_PROMPTS = [
  { icon: 'shield-checkmark', text: 'What do I need for my TX renewal?', color: colors.risk },
  { icon: 'search', text: 'Find courses for risk management', color: colors.accent },
  { icon: 'analytics', text: 'How many credits do I have left?', color: colors.success },
  { icon: 'help-circle', text: 'Explain opioid CME requirements', color: colors.warning },
];

// ─── Main Agent Screen ───
export default function AgentScreen() {
  const { user, profile } = useAuth();
  const { isDemo, displayProfile, demoLicenses, DEMO_MODE } = useDemo();
  const scrollRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [licenses, setLicenses] = useState<License[]>([]);
  const sendScaleAnim = useRef(new Animated.Value(1)).current;
  const headerGlowAnim = useRef(new Animated.Value(0)).current;

  // Subtle header glow animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(headerGlowAnim, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
        Animated.timing(headerGlowAnim, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
      ])
    ).start();
  }, []);

  // Load user licenses for context
  useEffect(() => {
    async function loadLicenses() {
      if (isDemo) {
        // Use demo license data
        setLicenses(demoLicenses.map(l => ({
          state: l.state,
          total_credits_required: l.total_credits_required,
          expiry_date: l.expiry_date,
          credits_earned: l.creditsEarned,
          requirements: l.requirements.map(r => ({
            category: r.category,
            required: r.required,
            earned: r.earned,
          })),
        })));
        return;
      }

      if (!user) return;

      const { data: licensesData } = await supabase
        .from('licenses')
        .select('id, state, total_credits_required, expiry_date')
        .eq('user_id', user.id);

      if (licensesData) {
        const { data: allocations } = await supabase
          .from('credit_allocations')
          .select('license_id, credits_applied')
          .in('license_id', licensesData.map((l: any) => l.id) || []);

        const creditMap = new Map<string, number>();
        allocations?.forEach((a: any) => {
          const current = creditMap.get(a.license_id) || 0;
          creditMap.set(a.license_id, current + a.credits_applied);
        });

        setLicenses(licensesData.map((l: any) => ({
          ...l,
          credits_earned: creditMap.get(l.id) || 0,
        })));
      }
    }
    loadLicenses();
  }, [user]);

  // Build user context for the AI
  const getUserContext = useCallback(() => {
    const currentProfile = displayProfile;
    return {
      name: currentProfile?.full_name?.split(' ').pop(),
      degreeType: currentProfile?.degree_type,
      licenses: licenses.map(l => ({
        state: l.state,
        creditsRequired: l.total_credits_required || 0,
        creditsEarned: l.credits_earned || 0,
        expiryDate: l.expiry_date,
        requirements: l.requirements,
      })),
    };
  }, [user, profile, licenses]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    // Haptic feedback on send
    triggerHaptic('medium');

    // Send button animation
    Animated.sequence([
      Animated.timing(sendScaleAnim, { toValue: 0.8, duration: 80, useNativeDriver: true }),
      Animated.spring(sendScaleAnim, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 8 }),
    ]).start();

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const userContext = getUserContext();

      // Get auth token if available
      let authToken: string | undefined;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        authToken = session?.access_token;
      } catch (_e) {
        // No auth, continue without
      }

      // Call the real AI edge function
      const response = await fetch(EDGE_FUNCTIONS.cmeChatUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({
            role: m.role,
            content: m.content,
          })),
          userContext,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();

      // Success haptic
      triggerNotification('success');

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message || 'I apologize, but I was unable to generate a response.',
      };

      setMessages(prev => [...prev, aiMessage]);

      // Persist messages to database if authenticated
      if (user) {
        await supabase.from('chat_messages').insert([
          { user_id: user.id, role: 'user', content: text },
          { user_id: user.id, role: 'assistant', content: aiMessage.content },
        ]).then(() => {}).catch(() => {});
      }

    } catch (err) {
      console.error('Chat error:', err);

      // Error haptic
      triggerNotification('error');

      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I'm having trouble connecting right now. Please try again in a moment.\n\n(${errorMessage})`,
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setLoading(false);
    }
  }

  const currentProfile = displayProfile;
  const displayName = currentProfile?.full_name?.split(' ').pop() || 'there';

  const headerGlowColor = headerGlowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(166, 139, 91, 0.0)', 'rgba(166, 139, 91, 0.15)'],
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={90}
      >
        {/* Header */}
        <Animated.View style={[styles.header, { backgroundColor: headerGlowColor }]}>
          <View style={styles.agentAvatar}>
            <Ionicons name="sparkles" size={22} color="#FFFFFF" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.agentName}>CME Agent</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.agentStatus}>AI-powered • Your data</Text>
            </View>
          </View>
        </Animated.View>

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          keyboardShouldPersistTaps="handled"
        >
          {messages.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyAvatarLarge}>
                <Ionicons name="sparkles" size={32} color={colors.accent} />
              </View>
              <Text style={styles.emptyTitle}>Hi Dr. {displayName}!</Text>
              <Text style={styles.emptyText}>
                I'm your AI compliance assistant. I know your licenses, credits, and deadlines — ask me anything about your CME requirements.
              </Text>

              <Text style={styles.suggestionsTitle}>Try asking:</Text>
              <View style={styles.suggestions}>
                {SUGGESTED_PROMPTS.map((prompt, index) => (
                  <SuggestionChip
                    key={index}
                    icon={prompt.icon}
                    text={prompt.text}
                    color={prompt.color}
                    onPress={() => sendMessage(prompt.text)}
                  />
                ))}
              </View>
            </View>
          ) : (
            messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))
          )}

          {loading && <TypingIndicator />}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask me anything about CME..."
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={500}
            returnKeyType="default"
          />
          <Animated.View style={{ transform: [{ scale: sendScaleAnim }] }}>
            <TouchableOpacity
              style={[styles.sendButton, (!input.trim() || loading) && styles.sendButtonDisabled]}
              onPress={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              activeOpacity={0.7}
            >
              <Ionicons name="send" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  agentAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  agentName: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    color: colors.text,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
    marginRight: 6,
  },
  agentStatus: {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
  },

  // Messages
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },

  // Empty state
  emptyState: {
    padding: spacing.md,
    paddingTop: spacing.xl,
  },
  emptyAvatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.accent + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  suggestionsTitle: {
    fontSize: typography.label.fontSize,
    fontWeight: typography.label.fontWeight,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  suggestions: {
    gap: spacing.sm,
  },
  // Input
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.backgroundElevated,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    fontSize: typography.body.fontSize,
    color: colors.text,
    maxHeight: 100,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
});
