import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { isAppleSignInAvailable } from '@/lib/socialAuth';
import { colors } from '@/constants/colors';
import { plannerCardBorder, plannerCornerRadius } from '@/constants/plannerCardStyles';
import { fonts } from '@/constants/typography';
import { s, vs, fs } from '@/lib/scale';

type AppleSignInButtonProps = {
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
};

export function AppleSignInButton({ onPress, disabled = false, loading = false }: AppleSignInButtonProps) {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    void isAppleSignInAvailable().then(setAvailable);
  }, []);

  if (Platform.OS !== 'ios' || !available) {
    return null;
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        (pressed || disabled || loading) && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.navy} size="small" />
      ) : (
        <Svg width={s(15)} height={s(15)} viewBox="0 0 24 24" fill={colors.navy}>
          <Path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
        </Svg>
      )}
      <Text style={styles.label}>{loading ? 'Signing in…' : 'Continue with Apple'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: vs(11),
    paddingHorizontal: s(14),
    borderRadius: plannerCornerRadius,
    borderWidth: 1,
    borderColor: plannerCardBorder,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s(8),
    marginBottom: s(12),
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    fontFamily: fonts.dmSans,
    fontSize: fs(11),
    color: colors.navy,
  },
});
