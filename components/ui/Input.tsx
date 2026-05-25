import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { s, vs, fs } from '@/lib/scale';

type InputProps = TextInputProps & {
  secureTextEntry?: boolean;
};

function EyeIcon() {
  return (
    <Svg width={s(14)} height={s(14)} viewBox="0 0 24 24" fill="none">
      <Path
        d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
        stroke={colors.muted}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={12} cy={12} r={3} stroke={colors.muted} strokeWidth={1.5} />
    </Svg>
  );
}

export function Input({
  value,
  placeholder,
  secureTextEntry = false,
  style,
  ...rest
}: InputProps) {
  const [hidden, setHidden] = useState(secureTextEntry);

  return (
    <View style={styles.container}>
      <TextInput
        value={value}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        secureTextEntry={hidden}
        autoCapitalize="none"
        autoCorrect={false}
        style={[styles.input, style]}
        {...rest}
      />
      {secureTextEntry ? (
        <Pressable onPress={() => setHidden((current) => !current)} hitSlop={8}>
          <EyeIcon />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: vs(10),
    paddingHorizontal: s(12),
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: s(10),
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: s(8),
  },
  input: {
    flex: 1,
    fontFamily: fonts.dmSans,
    fontSize: fs(12),
    color: colors.navy,
    padding: s(0),
  },
});
