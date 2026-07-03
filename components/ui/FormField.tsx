import { StyleSheet, Text, View } from 'react-native';

import { Chip } from './Chip';
import { Input } from './Input';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import type { TextInputProps } from 'react-native';
import { s, fs } from '@/lib/scale';

type FormFieldProps = {
  label: string;
  value?: string;
  placeholder?: string;
  chips?: string[];
  selectedChipIndex?: number;
  onChipPress?: (index: number) => void;
  secureTextEntry?: boolean;
  onChangeText?: TextInputProps['onChangeText'];
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  textContentType?: TextInputProps['textContentType'];
  autoComplete?: TextInputProps['autoComplete'];
  passwordRules?: TextInputProps['passwordRules'];
  importantForAutofill?: TextInputProps['importantForAutofill'];
};

export function FormField({
  label,
  value,
  placeholder,
  chips,
  selectedChipIndex = 0,
  onChipPress,
  secureTextEntry,
  onChangeText,
  keyboardType,
  autoCapitalize,
  textContentType,
  autoComplete,
  passwordRules,
  importantForAutofill,
}: FormFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      {chips ? (
        <View style={styles.chips}>
          {chips.map((chip, index) => (
            <Chip
              key={chip}
              label={chip}
              selected={index === selectedChipIndex}
              form
              onPress={onChipPress ? () => onChipPress(index) : undefined}
            />
          ))}
        </View>
      ) : (
        <Input
          value={value}
          placeholder={placeholder}
          secureTextEntry={secureTextEntry}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          textContentType={textContentType}
          autoComplete={autoComplete}
          passwordRules={passwordRules}
          importantForAutofill={importantForAutofill}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: s(12),
  },
  label: {
    fontFamily: fonts.dmSans,
    fontSize: fs(8),
    letterSpacing: s(2),
    textTransform: 'uppercase',
    color: colors.muted,
    marginBottom: s(5),
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: s(6),
  },
});
