import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import { plannerCardBorder, plannerCornerRadius } from '@/constants/plannerCardStyles';
import { tabPageTypography } from '@/constants/tabPageTypography';
import { fonts } from '@/constants/typography';
import { s } from '@/lib/scale';

type InlineEmptyCardProps = {
  title: string;
  body?: string;
  children?: React.ReactNode;
  compact?: boolean;
};

export function InlineEmptyCard({ title, body, children, compact = false }: InlineEmptyCardProps) {
  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <Text style={styles.title}>{title}</Text>
      {body ? <Text style={styles.body}>{body}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: plannerCornerRadius,
    borderWidth: 1,
    borderColor: plannerCardBorder,
    padding: s(16),
    marginHorizontal: s(4),
  },
  cardCompact: {
    borderRadius: plannerCornerRadius,
    padding: s(14),
    marginHorizontal: 0,
    marginBottom: s(10),
  },
  title: {
    fontFamily: fonts.cardTitle,
    fontSize: tabPageTypography.emptyTitle,
    color: colors.navy,
    marginBottom: s(6),
  },
  body: {
    fontFamily: fonts.dmSans,
    fontSize: tabPageTypography.emptyBody,
    color: colors.gray,
    lineHeight: tabPageTypography.emptyBodyLineHeight,
  },
});
