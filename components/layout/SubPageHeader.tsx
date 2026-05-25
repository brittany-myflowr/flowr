import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';

type SubPageHeaderProps = {
  title: string;
  subtitle?: string;
  backLabel?: string;
  onBack?: () => void;
};

export function SubPageHeader({
  title,
  subtitle,
  backLabel = '← Back',
  onBack,
}: SubPageHeaderProps) {
  return (
    <View style={styles.container}>
      <Pressable onPress={onBack} disabled={!onBack}>
        <Text style={[styles.back, !onBack && styles.backDisabled]}>{backLabel}</Text>
      </Pressable>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 18,
    paddingHorizontal: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.bg,
  },
  back: {
    fontFamily: fonts.dmSans,
    fontSize: 10,
    color: colors.blue,
    marginBottom: 6,
  },
  backDisabled: {
    opacity: 0.5,
  },
  subtitle: {
    fontFamily: fonts.dmSans,
    fontSize: 8,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.muted,
    marginBottom: 2,
  },
  title: {
    fontFamily: fonts.lora,
    fontSize: 18,
    color: colors.navy,
    lineHeight: 22,
  },
});
