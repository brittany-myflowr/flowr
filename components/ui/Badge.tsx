import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';

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
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  label: {
    fontFamily: fonts.dmSans,
    fontSize: 9,
  },
});
