import { Pressable, StyleSheet, View } from 'react-native';

import { colors } from '@/constants/colors';
import { plannerCardBorder, plannerCornerRadius } from '@/constants/plannerCardStyles';
import { s, vs } from '@/lib/scale';

type ToggleProps = {
  value: boolean;
  onValueChange?: (value: boolean) => void;
};

export function Toggle({ value, onValueChange }: ToggleProps) {
  return (
    <Pressable
      onPress={() => onValueChange?.(!value)}
      style={[styles.track, value ? styles.trackOn : styles.trackOff]}
    >
      <View style={[styles.thumb, value ? styles.thumbOn : styles.thumbOff]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: s(30),
    height: vs(17),
    borderRadius: plannerCornerRadius,
    justifyContent: 'center',
  },
  trackOn: {
    backgroundColor: colors.blue,
  },
  trackOff: {
    backgroundColor: plannerCardBorder,
  },
  thumb: {
    position: 'absolute',
    width: s(13),
    height: vs(13),
    borderRadius: plannerCornerRadius,
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  thumbOn: {
    right: s(2),
  },
  thumbOff: {
    left: s(2),
  },
});
