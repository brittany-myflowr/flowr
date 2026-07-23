import { AppStoreProvider } from '@/providers/AppStore';
import { SubscriptionProvider } from '@/providers/SubscriptionProvider';
import { ToastProvider } from '@/providers/ToastProvider';
import { RecoveryLinkHandler } from '@/components/auth/RecoveryLinkHandler';
import { SharedRoutineLinkHandler } from '@/components/routines/SharedRoutineLinkHandler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppStoreProvider>
          <RecoveryLinkHandler />
          <SubscriptionProvider>
            <ToastProvider>
              <SharedRoutineLinkHandler />
              {children}
            </ToastProvider>
          </SubscriptionProvider>
        </AppStoreProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
