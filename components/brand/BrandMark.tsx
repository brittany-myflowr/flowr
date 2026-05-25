import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { s } from '@/lib/scale';

import { Daisy } from './Daisy';
import { Logo } from './Logo';

type BrandMarkProps = {
  flowerSize?: number;
  logoSize?: number;
  color?: string;
  logoColor?: string;
  direction?: 'column' | 'row';
  gap?: number;
  style?: StyleProp<ViewStyle>;
};

export function BrandMark({
  flowerSize = s(36),
  logoSize = s(32),
  color = 'rgba(255,255,255,0.95)',
  logoColor,
  direction = 'column',
  gap = s(2),
  style,
}: BrandMarkProps) {
  return (
    <View
      style={[
        styles.base,
        direction === 'row' ? styles.row : styles.column,
        { gap },
        style,
      ]}
    >
      <Daisy color={color} size={flowerSize} />
      <Logo size={logoSize} color={logoColor ?? color} />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
  },
  column: {
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'row',
  },
});
