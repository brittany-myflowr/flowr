import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { s, vs, fs } from '@/lib/scale';

type BadgeProps = {
  label: string;
  color?: string;
  backgroundColor?: string;
};

export function Badge({
  label,
  color = colors.blue,
  backgroundColor = colors.light,
}: BadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: s(5),
    paddingHorizontal: s(6),
    paddingVertical: vs(1),
  },
  label: {
    fontFamily: fonts.dmSans,
    fontSize: fs(9),
  },
});
