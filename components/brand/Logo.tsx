import { StyleSheet, Text, View } from 'react-native';

import { fonts } from '@/constants/typography';

type LogoProps = {
  size?: number;
  color?: string;
};

export function Logo({ size = 42, color = 'rgba(255,255,255,0.95)' }: LogoProps) {
  return (
    <View style={styles.skew}>
      <Text style={[styles.text, { fontSize: size, color }]}>flowr</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  skew: {
    transform: [{ skewX: '-8deg' }],
  },
  text: {
    fontFamily: fonts.lora,
    fontWeight: '700',
    lineHeight: undefined,
  },
});
