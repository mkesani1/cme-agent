import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../src/hooks/useAuth';
import { colors } from '../src/lib/theme';

export default function Index() {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  // Not logged in -> Auth flow
  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  // Logged in but no degree type set -> Onboarding
  if (!profile?.degree_type) {
    return <Redirect href="/(onboarding)/welcome" />;
  }

  // Fully set up -> Dashboard
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
