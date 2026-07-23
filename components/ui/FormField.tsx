import { StyleSheet, Text, View, type TextInputProps } from 'react-native';

import { Chip } from './Chip';
import { Input } from './Input';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { s, fs } from '@/lib/scale';

type FormFieldProps = {
  label: string;
  value?: string;
  placeholder?: string;
  chips?: string[];
  selectedChipIndex?: number;
  onChipPress?: (index: number) => void;
  secureTextEntry?: boolean;
  multiline?: boolean;
  onChangeText?: TextInputProps['onChangeText'];
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoCorrect?: TextInputProps['autoCorrect'];
  textContentType?: TextInputProps['textContentType'];
  autoComplete?: TextInputProps['autoComplete'];
  passwordRules?: TextInputProps['passwordRules'];
  importantForAutofill?: TextInputProps['importantForAutofill'];
  style?: TextInputProps['style'];
};

export function FormField({
  label,
  value,
  placeholder,
  chips,
  selectedChipIndex = 0,
  onChipPress,
  secureTextEntry,
  multiline,
  onChangeText,
  keyboardType,
  autoCapitalize,
  autoCorrect,
  textContentType,
  autoComplete,
  passwordRules,
  importantForAutofill,
  style,
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
          multiline={multiline}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          textContentType={textContentType}
          autoComplete={autoComplete}
          passwordRules={passwordRules}
          importantForAutofill={importantForAutofill}
          style={style}
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
    fontSize: fs(10),
    letterSpacing: s(1.5),
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
