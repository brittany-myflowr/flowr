import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/constants/colors';
import { tabPageTypography } from '@/constants/tabPageTypography';
import { fonts } from '@/constants/typography';
import { s, fs } from '@/lib/scale';

type TabPageHeaderProps = {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

export function TabPageHeader({
  title,
  subtitle,
  actionLabel,
  onActionPress,
}: TabPageHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.header, { paddingTop: tabPageTypography.headerTopOffset + insets.top }]}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {actionLabel && onActionPress ? (
          <Pressable
            onPress={onActionPress}
            style={styles.actionButton}
            accessibilityRole="button"
            accessibilityLabel={actionLabel}
          >
            <Text style={styles.actionLabel}>{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: tabPageTypography.headerPaddingHorizontal,
    paddingBottom: tabPageTypography.headerPaddingBottom,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: s(10),
  },
  titleBlock: {
    flex: 1,
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
  actionButton: {
    marginTop: s(2),
    paddingHorizontal: s(10),
    paddingVertical: s(6),
    borderRadius: s(14),
    backgroundColor: colors.navy,
  },
  actionLabel: {
    fontFamily: fonts.dmSansSemiBold,
    fontSize: fs(10),
    color: colors.white,
    fontWeight: '600',
  },
});
