import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/hooks/useAuth';
import { supabase } from '../../src/lib/supabase';
import { Card } from '../../src/components/ui';
import { colors, spacing, typography } from '../../src/lib/theme';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface License {
  state: string;
  total_credits_required: number | null;
  expiry_date: string | null;
  credits_earned?: number;
}

const SUGGESTED_PROMPTS = [
  'What do I need for my CA renewal?',
  'Find courses for controlled substances',
  'Explain opioid CME requirements',
  'How many credits do I have left?',
];

export default function AgentScreen() {
  const { user, profile } = useAuth();
  const scrollRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [licenses, setLicenses] = useState<License[]>([]);

  // Load user licenses for context
  useEffect(() => {
    async function loadLicenses() {
      if (!user) return;

      const { data: licensesData } = await supabase
        .from('licenses')
        .select('state, total_credits_required, expiry_date')
        .eq('user_id', user.id);

      if (licensesData) {
        // Get credit allocations
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

  async function sendMessage(text: string) {
    if (!text.trim()) return;

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
      // Build user context for the AI
      const userContext = {
        name: profile?.full_name?.split(' ').pop(),
        degreeType: profile?.degree_type,
        licenses: licenses.map(l => ({
          state: l.state,
          creditsRequired: l.total_credits_required || 0,
          creditsEarned: l.credits_earned || 0,
          expiryDate: l.expiry_date,
        })),
      };

      // Call the Edge Function
      const { data, error } = await supabase.functions.invoke('cme-chat', {
        body: {
          messages: updatedMessages.map(m => ({
            role: m.role,
            content: m.content,
          })),
          userContext,
        },
      });

      if (error) throw error;

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message || 'I apologize, but I was unable to generate a response.',
      };

      setMessages(prev => [...prev, aiMessage]);

      // Persist messages to database
      await supabase.from('chat_messages').insert([
        { user_id: user!.id, role: 'user', content: text },
        { user_id: user!.id, role: 'assistant', content: aiMessage.content },
      ]);

    } catch (err) {
      console.error('Chat error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';

      // Show error as assistant message for better UX
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I'm having trouble connecting right now. Please try again in a moment. (${errorMessage})`,
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={90}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.agentAvatar}>
            <Text style={styles.agentIcon}>🤖</Text>
          </View>
          <View>
            <Text style={styles.agentName}>CME Agent</Text>
            <Text style={styles.agentStatus}>Your AI compliance assistant</Text>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd()}
        >
          {messages.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>
                Hi Dr. {profile?.full_name?.split(' ').pop()}! 👋
              </Text>
              <Text style={styles.emptyText}>
                I'm your CME Agent. I can help you understand your requirements,
                find courses, and stay on track with your compliance.
              </Text>

              <Text style={styles.suggestionsTitle}>Try asking:</Text>
              <View style={styles.suggestions}>
                {SUGGESTED_PROMPTS.map((prompt, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionChip}
                    onPress={() => sendMessage(prompt)}
                  >
                    <Text style={styles.suggestionText}>{prompt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            messages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.messageBubble,
                  message.role === 'user' ? styles.userBubble : styles.assistantBubble,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    message.role === 'user' && styles.userText,
                  ]}
                >
                  {message.content}
                </Text>
              </View>
            ))
          )}

          {loading && (
            <View style={[styles.messageBubble, styles.assistantBubble]}>
              <View style={styles.thinkingContainer}>
                <Text style={styles.typingIndicator}>Thinking</Text>
                <View style={styles.dots}>
                  <Text style={styles.dot}>.</Text>
                  <Text style={styles.dot}>.</Text>
                  <Text style={styles.dot}>.</Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask me anything about CME..."
            placeholderTextColor={colors.textSecondary}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
            onPress={() => sendMessage(input)}
            disabled={!input.trim() || loading}
          >
            <Text style={styles.sendIcon}>→</Text>
          </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  agentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  agentIcon: {
    fontSize: 24,
  },
  agentName: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    color: colors.text,
  },
  agentStatus: {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  emptyState: {
    padding: spacing.lg,
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
    color: colors.text,
    marginBottom: spacing.md,
  },
  suggestions: {
    gap: spacing.sm,
  },
  suggestionChip: {
    backgroundColor: colors.card,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  suggestionText: {
    fontSize: typography.body.fontSize,
    color: colors.text,
  },
  messageBubble: {
    maxWidth: '80%',
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
  },
  messageText: {
    fontSize: typography.body.fontSize,
    color: colors.text,
    lineHeight: 22,
  },
  userText: {
    color: '#FFFFFF',
  },
  thinkingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingIndicator: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  dots: {
    flexDirection: 'row',
    marginLeft: spacing.xs,
  },
  dot: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
    marginHorizontal: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    fontSize: typography.body.fontSize,
    color: colors.text,
    maxHeight: 100,
    marginRight: spacing.sm,
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
    opacity: 0.5,
  },
  sendIcon: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
