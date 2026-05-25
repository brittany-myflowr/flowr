import { AppStoreProvider } from '@/providers/AppStore';
import { ToastProvider } from '@/providers/ToastProvider';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaProvider>
      <AppStoreProvider>
        <ToastProvider>{children}</ToastProvider>
      </AppStoreProvider>
    </SafeAreaProvider>
  );
}
