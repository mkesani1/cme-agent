import { Stack } from 'expo-router';
import { colors } from '../../../src/lib/theme';

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        headerBackTitle: 'Back',
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    />
  );
}
