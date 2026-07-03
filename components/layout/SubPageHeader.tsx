import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import { plannerCardBorder, plannerCornerRadius } from '@/constants/plannerCardStyles';
import { tabPageTypography } from '@/constants/tabPageTypography';
import { fonts } from '@/constants/typography';
import { s } from '@/lib/scale';

type SubPageHeaderProps = {
  title: string;
  subtitle?: string;
  backLabel?: string;
  onBack?: () => void;
  actionLabel?: string;
  onActionPress?: () => void;
};

export function SubPageHeader({
  title,
  subtitle,
  backLabel = '← Back',
  onBack,
  actionLabel,
  onActionPress,
}: SubPageHeaderProps) {
  return (
    <View style={styles.container}>
      <Pressable
        onPress={onBack}
        disabled={!onBack}
        accessibilityRole="button"
        accessibilityLabel={backLabel}
      >
        <Text style={[styles.back, !onBack && styles.backDisabled]}>{backLabel}</Text>
      </Pressable>
      <View style={styles.titleRow}>
        <View style={styles.titleBlock}>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          <Text style={styles.title}>{title}</Text>
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
  container: {
    paddingTop: s(18),
    paddingHorizontal: s(14),
    paddingBottom: s(10),
    borderBottomWidth: 1,
    borderBottomColor: plannerCardBorder,
    backgroundColor: colors.bg,
  },
  back: {
    fontFamily: fonts.dmSans,
    fontSize: tabPageTypography.subPageBack,
    color: colors.blue,
    marginBottom: s(6),
  },
  backDisabled: {
    opacity: 0.5,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: s(10),
  },
  titleBlock: {
    flex: 1,
  },
  subtitle: {
    fontFamily: fonts.dmSans,
    fontSize: tabPageTypography.subPageSubtitle,
    letterSpacing: s(2),
    textTransform: 'uppercase',
    color: colors.muted,
    marginBottom: s(4),
  },
  title: {
    fontFamily: fonts.lora,
    fontSize: tabPageTypography.subPageTitle,
    color: colors.navy,
    lineHeight: tabPageTypography.subPageTitle * 1.25,
  },
  actionButton: {
    marginTop: s(2),
    paddingHorizontal: s(10),
    paddingVertical: s(6),
    borderRadius: plannerCornerRadius,
    backgroundColor: colors.navy,
  },
  actionLabel: {
    fontFamily: fonts.dmSansSemiBold,
    fontSize: tabPageTypography.subPageBack,
    color: colors.white,
    fontWeight: '600',
  },
});
