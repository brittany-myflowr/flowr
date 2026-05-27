import { Stack } from 'expo-router';

export default function RoutinesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="guided" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="schedule" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="add-step" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="step/[id]" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="tag-product" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="cycle-settings" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="[id]" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}
