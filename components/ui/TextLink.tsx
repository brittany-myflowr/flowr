import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';

type TextLinkProps = {
  children: string;
  onPress?: () => void;
  color?: string;
  align?: 'left' | 'center' | 'right';
};

export function TextLink({
  children,
  onPress,
  color = colors.blue,
  align = 'left',
}: TextLinkProps) {
  return (
    <Pressable onPress={onPress} disabled={!onPress}>
      <Text style={[styles.link, { color, textAlign: align }]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: {
    fontFamily: fonts.dmSans,
    fontSize: 10,
    textDecorationLine: 'underline',
  },
});
