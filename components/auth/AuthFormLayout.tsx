import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import { AuthHeader } from '@/components/auth/AuthHeader';
import { FocusScrollView } from '@/components/layout/FocusScrollView';
import { colors } from '@/constants/colors';
import { s } from '@/lib/scale';

type AuthFormLayoutProps = {
  headerSubtitle?: string;
  headerCompact?: boolean;
  children: React.ReactNode;
};

export function AuthFormLayout({
  headerSubtitle,
  headerCompact = false,
  children,
}: AuthFormLayoutProps) {
  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.frame}>
        <AuthHeader subtitle={headerSubtitle} compact={headerCompact} />
        <FocusScrollView
          style={styles.formScroll}
          contentContainerStyle={styles.formContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </FocusScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  frame: {
    flex: 1,
  },
  formScroll: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  formContent: {
    paddingHorizontal: s(14),
    paddingTop: s(16),
    paddingBottom: s(24),
    flexGrow: 1,
  },
});
