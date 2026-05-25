import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { s, vs, fs } from '@/lib/scale';

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'danger' | 'ghost' | 'ghostLight' | 'surface';
  disabled?: boolean;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
}: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || !onPress}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'danger' && styles.danger,
        variant === 'ghost' && styles.ghost,
        variant === 'ghostLight' && styles.ghostLight,
        variant === 'surface' && styles.surface,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text
        style={[
          styles.label,
          variant === 'primary' && styles.primaryLabel,
          variant === 'danger' && styles.dangerLabel,
          variant === 'ghost' && styles.ghostLabel,
          variant === 'ghostLight' && styles.ghostLightLabel,
          variant === 'surface' && styles.surfaceLabel,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/** Full-width primary/danger button matching design doc Sbtn */
export function FullWidthButton(props: ButtonProps) {
  return (
    <View style={styles.fullWidth}>
      <Button {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  fullWidth: {
    width: '100%',
  },
  base: {
    width: '100%',
    paddingVertical: vs(11),
    paddingHorizontal: s(14),
    borderRadius: s(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.navy,
  },
  danger: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.dangerLight,
  },
  ghost: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghostLight: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    paddingVertical: vs(14),
  },
  surface: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingVertical: vs(14),
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontFamily: fonts.dmSans,
    fontSize: fs(9),
    letterSpacing: s(2),
    textTransform: 'uppercase',
  },
  primaryLabel: {
    color: colors.white,
  },
  dangerLabel: {
    color: colors.dangerLight,
  },
  ghostLabel: {
    color: colors.gray,
    fontSize: fs(11),
    letterSpacing: s(0),
    textTransform: 'none',
  },
  ghostLightLabel: {
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: s(2.5),
  },
  surfaceLabel: {
    color: colors.navy,
    fontFamily: fonts.dmSansSemiBold,
    fontWeight: '600',
    letterSpacing: s(2.5),
  },
});
