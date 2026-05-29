import { Redirect, Tabs, useSegments } from 'expo-router';

import { TabBar } from '@/components/layout/TabBar';
import { colors } from '@/constants/colors';
import { shouldHideTabBar } from '@/lib/tabBarVisibility';
import { useAppStore } from '@/providers/AppStore';

export default function TabsLayout() {
  const { hydrated, isLoggedIn } = useAppStore();
  const segments = useSegments();

  if (hydrated && !isLoggedIn) {
    return <Redirect href="/(auth)/splash" />;
  }

  const hideTabBar = shouldHideTabBar(segments);

  return (
    <Tabs
      tabBar={(props) => (hideTabBar ? null : <TabBar {...props} />)}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Today' }} />
      <Tabs.Screen name="routines" options={{ title: 'Routines' }} />
      <Tabs.Screen name="products" options={{ title: 'Products' }} />
      <Tabs.Screen name="calendar" options={{ title: 'Calendar' }} />
      <Tabs.Screen name="profile" options={{ href: null, title: 'Profile' }} />
    </Tabs>
  );
}
