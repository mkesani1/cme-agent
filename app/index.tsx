import { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../src/hooks/useAuth';
import { colors } from '../src/lib/theme';
import { DEMO_MODE } from '../src/lib/demoData';

export default function Index() {
  const { session, profile, loading } = useAuth();
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('onboarding_completed').then((val) => {
      setOnboardingCompleted(val === 'true');
      setOnboardingChecked(true);
    }).catch(() => {
      setOnboardingChecked(true);
    });
  }, []);

  if (loading || !onboardingChecked) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  // If DEMO_MODE is enabled, skip auth and go directly to the app
  if (DEMO_MODE) {
    return <Redirect href="/(tabs)" />;
  }

  // If no session, redirect to login
  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  // If user has completed onboarding (either via profile.degree_type or AsyncStorage flag)
  if (profile?.degree_type || onboardingCompleted) {
    return <Redirect href="/(tabs)" />;
  }

  // User is authenticated but hasn't completed onboarding
  return <Redirect href="/(onboarding)/welcome" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
