import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../src/hooks/useAuth';
import { colors } from '../src/lib/theme';
import { DEMO_MODE } from '../src/lib/demoData';

export default function Index() {
  const { session, profile, loading } = useAuth();

  if (loading) {
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

  // If user is authenticated but hasn't completed onboarding, redirect to onboarding
  if (!profile?.degree_type) {
    return <Redirect href="/(onboarding)/welcome" />;
  }

  // User is authenticated and has completed onboarding, go to main app
  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
