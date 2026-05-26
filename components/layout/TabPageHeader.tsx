import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/constants/colors';
import { tabPageTypography } from '@/constants/tabPageTypography';
import { fonts } from '@/constants/typography';

type TabPageHeaderProps = {
  title: string;
  subtitle?: string;
};

export function TabPageHeader({ title, subtitle }: TabPageHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.header, { paddingTop: tabPageTypography.headerTopOffset + insets.top }]}
    >
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: tabPageTypography.headerPaddingHorizontal,
    paddingBottom: tabPageTypography.headerPaddingBottom,
  },
  title: {
    fontFamily: fonts.lora,
    fontSize: tabPageTypography.title,
    color: colors.navy,
  },
  subtitle: {
    marginTop: tabPageTypography.subtitleMarginTop,
    fontFamily: fonts.dmSans,
    fontSize: tabPageTypography.subtitle,
    color: colors.blue,
  },
});
