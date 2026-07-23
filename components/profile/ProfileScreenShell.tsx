import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SubPageHeader } from '@/components/layout/SubPageHeader';
import { FocusScrollView } from '@/components/layout/FocusScrollView';
import { colors } from '@/constants/colors';
import { plannerCard } from '@/constants/plannerCardStyles';
import { fonts } from '@/constants/typography';
import { s, vs, fs } from '@/lib/scale';

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
      <FocusScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </FocusScrollView>
    </View>
  );
}

export const profileBodyStyles = StyleSheet.create({
  card: {
    ...plannerCard(),
    padding: s(14),
    marginBottom: s(10),
  },
  paragraph: {
    fontFamily: fonts.dmSans,
    fontSize: fs(12),
    color: colors.gray,
    lineHeight: fs(19),
    marginBottom: s(10),
  },
  paragraphLast: {
    marginBottom: s(0),
  },
  label: {
    fontFamily: fonts.dmSans,
    fontSize: fs(10),
    letterSpacing: s(2),
    textTransform: 'uppercase',
    color: colors.muted,
    marginBottom: s(6),
  },
  value: {
    fontFamily: fonts.cardTitle,
    fontSize: fs(16),
    color: colors.navy,
  },
  meta: {
    fontFamily: fonts.dmSans,
    fontSize: fs(12),
    color: colors.muted,
    marginTop: s(4),
  },
  valueInline: {
    fontFamily: fonts.dmSansSemiBold,
    fontSize: fs(12),
    color: colors.navy,
    fontWeight: '600',
  },
  cardTitle: {
    fontFamily: fonts.cardTitle,
    fontSize: fs(14),
    color: colors.navy,
    marginBottom: s(6),
  },
  sectionTitle: {
    fontFamily: fonts.lora,
    fontSize: fs(14),
    color: colors.navy,
    marginTop: s(6),
    marginBottom: s(6),
  },
  footerSpacer: {
    height: vs(8),
  },
  loader: {
    marginBottom: s(12),
  },
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingHorizontal: s(14),
    paddingTop: s(12),
    paddingBottom: s(24),
  },
});
