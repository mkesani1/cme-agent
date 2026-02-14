import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  TextInput,
} from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../../src/lib/theme';

interface FAQItemProps {
  question: string;
  answer: string;
  isExpanded: boolean;
  onToggle: () => void;
}

function FAQItem({ question, answer, isExpanded, onToggle }: FAQItemProps) {
  return (
    <TouchableOpacity
      style={styles.faqItem}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{question}</Text>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.textMuted}
        />
      </View>
      {isExpanded && <Text style={styles.faqAnswer}>{answer}</Text>}
    </TouchableOpacity>
  );
}

const FAQ_DATA = [
  {
    question: 'How do I add a new medical license?',
    answer:
      'Navigate to the Licenses tab and tap the "+" button or "Add License" card. Select your state, enter your license details, and specify your CME requirements.',
  },
  {
    question: 'How does the AI course recommendation work?',
    answer:
      'Our AI analyzes your license requirements, gaps in your CME credits, and expiration dates to recommend courses that efficiently fulfill multiple requirements at once.',
  },
  {
    question: 'Can I upload certificates from other platforms?',
    answer:
      'Yes! Go to the Certificates tab, tap "Upload Certificate", and either take a photo or select from your gallery. Our system will extract the relevant information automatically.',
  },
  {
    question: 'How do I track credits across multiple states?',
    answer:
      'CME Agent automatically tracks credits for all your added licenses. The dashboard shows an overview, and each license detail page shows specific progress.',
  },
  {
    question: 'What happens when a license is about to expire?',
    answer:
      'You\'ll receive notifications at 90, 60, 30, and 7 days before expiration. The license card will also show visual urgency indicators.',
  },
  {
    question: 'Is my data secure?',
    answer:
      'Yes, we use industry-standard encryption and secure cloud storage. Your medical credentials and personal information are protected with enterprise-grade security.',
  },
];

export default function HelpScreen() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFAQs = FAQ_DATA.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@cmeagent.com?subject=CME%20Agent%20Support');
  };

  const handleVisitWebsite = () => {
    Linking.openURL('https://cmeagent.com/help');
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Help Center',
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          {/* Search */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search help topics..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Quick Links */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>QUICK LINKS</Text>
            <View style={styles.quickLinksGrid}>
              <TouchableOpacity
                style={styles.quickLinkCard}
                onPress={() => Linking.openURL('https://cmeagent.com/getting-started')}
              >
                <View style={[styles.quickLinkIcon, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                  <Ionicons name="rocket" size={24} color="#3B82F6" />
                </View>
                <Text style={styles.quickLinkTitle}>Getting Started</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickLinkCard}
                onPress={() => Linking.openURL('https://cmeagent.com/video-tutorials')}
              >
                <View style={[styles.quickLinkIcon, { backgroundColor: 'rgba(168, 85, 247, 0.1)' }]}>
                  <Ionicons name="play-circle" size={24} color="#A855F7" />
                </View>
                <Text style={styles.quickLinkTitle}>Video Tutorials</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickLinkCard}
                onPress={() => Linking.openURL('https://cmeagent.com/state-requirements')}
              >
                <View style={[styles.quickLinkIcon, { backgroundColor: 'rgba(34, 197, 94, 0.1)' }]}>
                  <Ionicons name="map" size={24} color="#22C55E" />
                </View>
                <Text style={styles.quickLinkTitle}>State Requirements</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickLinkCard}
                onPress={handleContactSupport}
              >
                <View style={[styles.quickLinkIcon, { backgroundColor: 'rgba(196, 165, 116, 0.1)' }]}>
                  <Ionicons name="chatbubbles" size={24} color={colors.accent} />
                </View>
                <Text style={styles.quickLinkTitle}>Contact Us</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* FAQ */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>FREQUENTLY ASKED QUESTIONS</Text>
            <View style={styles.faqCard}>
              {filteredFAQs.length > 0 ? (
                filteredFAQs.map((faq, index) => (
                  <View key={index}>
                    {index > 0 && <View style={styles.divider} />}
                    <FAQItem
                      question={faq.question}
                      answer={faq.answer}
                      isExpanded={expandedIndex === index}
                      onToggle={() =>
                        setExpandedIndex(expandedIndex === index ? null : index)
                      }
                    />
                  </View>
                ))
              ) : (
                <View style={styles.noResults}>
                  <Ionicons name="search" size={40} color={colors.textMuted} />
                  <Text style={styles.noResultsText}>No matching topics found</Text>
                </View>
              )}
            </View>
          </View>

          {/* Contact Card */}
          <View style={styles.contactCard}>
            <View style={styles.contactIcon}>
              <Ionicons name="headset" size={32} color={colors.accent} />
            </View>
            <Text style={styles.contactTitle}>Need more help?</Text>
            <Text style={styles.contactDescription}>
              Our support team is available Monday-Friday, 9am-6pm EST
            </Text>
            <View style={styles.contactButtons}>
              <TouchableOpacity
                style={styles.contactButton}
                onPress={handleContactSupport}
              >
                <Ionicons name="mail-outline" size={18} color="#FFFFFF" />
                <Text style={styles.contactButtonText}>Email Support</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.contactButton, styles.contactButtonSecondary]}
                onPress={handleVisitWebsite}
              >
                <Ionicons name="globe-outline" size={18} color={colors.accent} />
                <Text style={[styles.contactButtonText, styles.contactButtonTextSecondary]}>
                  Visit Website
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xl,
  },
  searchInput: {
    flex: 1,
    padding: spacing.md,
    ...typography.body,
    color: colors.text,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.md,
    marginLeft: spacing.xs,
    letterSpacing: 1,
  },
  quickLinksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  quickLinkCard: {
    width: '47%',
    backgroundColor: colors.backgroundCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
  },
  quickLinkIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  quickLinkTitle: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  faqCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  faqItem: {
    padding: spacing.md,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqQuestion: {
    flex: 1,
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginRight: spacing.md,
  },
  faqAnswer: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  noResults: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  noResultsText: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
  contactCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
  },
  contactIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(196, 165, 116, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  contactTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  contactDescription: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  contactButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accent,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 10,
  },
  contactButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.accent,
  },
  contactButtonText: {
    ...typography.caption,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  contactButtonTextSecondary: {
    color: colors.accent,
  },
});
