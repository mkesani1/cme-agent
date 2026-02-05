import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/hooks/useAuth';
import { Button, Card } from '../../src/components/ui';
import { colors, spacing, typography, degreeTypes, DegreeType } from '../../src/lib/theme';

const degreeOptions: { type: DegreeType; icon: string; description: string }[] = [
  { type: 'MD', icon: '🩺', description: 'Doctor of Medicine' },
  { type: 'DO', icon: '🦴', description: 'Doctor of Osteopathic Medicine' },
  { type: 'RN', icon: '💉', description: 'Registered Nurse' },
];

export default function DegreeSelectScreen() {
  const { updateProfile } = useAuth();
  const [selectedDegree, setSelectedDegree] = useState<DegreeType | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleContinue() {
    if (!selectedDegree) return;

    setLoading(true);
    const { error } = await updateProfile({ degree_type: selectedDegree });

    if (!error) {
      router.push('/(onboarding)/add-licenses');
    }
    setLoading(false);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Progress */}
        <View style={styles.progress}>
          <View style={[styles.progressDot, styles.progressActive]} />
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
        </View>

        {/* Header */}
        <Text style={styles.title}>What's your degree?</Text>
        <Text style={styles.subtitle}>
          This helps us customize your CME requirements
        </Text>

        {/* Degree Options */}
        <View style={styles.options}>
          {degreeOptions.map((option) => (
            <TouchableOpacity
              key={option.type}
              onPress={() => setSelectedDegree(option.type)}
              activeOpacity={0.7}
            >
              <Card
                style={[
                  styles.optionCard,
                  selectedDegree === option.type && styles.optionSelected,
                ]}
              >
                <Text style={styles.optionIcon}>{option.icon}</Text>
                <View style={styles.optionText}>
                  <Text style={styles.optionType}>{option.type}</Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </View>
                <View
                  style={[
                    styles.radio,
                    selectedDegree === option.type && styles.radioSelected,
                  ]}
                >
                  {selectedDegree === option.type && (
                    <View style={styles.radioInner} />
                  )}
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        {/* Note */}
        <Text style={styles.note}>
          More credential types coming soon: PA, NP, PharmD
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={handleContinue}
          disabled={!selectedDegree}
          loading={loading}
          size="lg"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  progress: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.sand[300],
  },
  progressActive: {
    backgroundColor: colors.accent,
    width: 24,
  },
  title: {
    fontSize: typography.h1.fontSize,
    fontWeight: typography.h1.fontWeight,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  options: {
    gap: spacing.md,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: {
    borderColor: colors.accent,
  },
  optionIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  optionText: {
    flex: 1,
  },
  optionType: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    color: colors.text,
  },
  optionDescription: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.sand[400],
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: colors.accent,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.accent,
  },
  note: {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
});
