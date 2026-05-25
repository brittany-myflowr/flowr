import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SubPageHeader } from '@/components/layout/SubPageHeader';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';

type ProfileScreenShellProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export function ProfileScreenShell({ title, subtitle, children }: ProfileScreenShellProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <SubPageHeader
        title={title}
        subtitle={subtitle}
        backLabel="← Profile"
        onBack={() => router.back()}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </View>
  );
}

export const profileBodyStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 10,
  },
  paragraph: {
    fontFamily: fonts.dmSans,
    fontSize: 12,
    color: colors.gray,
    lineHeight: 19,
    marginBottom: 10,
  },
  paragraphLast: {
    marginBottom: 0,
  },
  label: {
    fontFamily: fonts.dmSans,
    fontSize: 8,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.muted,
    marginBottom: 6,
  },
  value: {
    fontFamily: fonts.lora,
    fontSize: 16,
    color: colors.navy,
  },
  meta: {
    fontFamily: fonts.dmSans,
    fontSize: 10,
    color: colors.muted,
    marginTop: 4,
  },
  valueInline: {
    fontFamily: fonts.dmSansSemiBold,
    fontSize: 12,
    color: colors.navy,
    fontWeight: '600',
  },
  sectionTitle: {
    fontFamily: fonts.lora,
    fontSize: 14,
    color: colors.navy,
    marginTop: 6,
    marginBottom: 6,
  },
  footerSpacer: {
    height: 8,
  },
  loader: {
    marginBottom: 12,
  },
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 24,
  },
});
