import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F0F7FA' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="degree-select" />
      <Stack.Screen name="add-licenses" />
      <Stack.Screen name="add-dea" />
      <Stack.Screen name="setup-complete" />
    </Stack>
  );
}
