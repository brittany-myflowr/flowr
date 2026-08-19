import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { getPasswordRequirements } from '@/lib/validation';
import { fs, s } from '@/lib/scale';

type PasswordRequirementsProps = {
  password: string;
  /** When false, hide the checklist until the user starts typing. Defaults to true once password is non-empty. */
  visible?: boolean;
};

export function PasswordRequirements({ password, visible }: PasswordRequirementsProps) {
  const show = visible ?? password.length > 0;
  if (!show) return null;

  const requirements = getPasswordRequirements(password);

  return (
    <View style={styles.container} accessibilityRole="summary">
      {requirements.map((requirement) => (
        <Text
          key={requirement.id}
          style={[styles.item, requirement.met ? styles.met : styles.unmet]}
        >
          {requirement.met ? '✓' : '○'} {requirement.label}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: s(-4),
    marginBottom: s(10),
    gap: s(4),
  },
  item: {
    fontFamily: fonts.dmSans,
    fontSize: fs(10),
    lineHeight: fs(14),
  },
  met: {
    color: colors.blue,
  },
  unmet: {
    color: colors.muted,
  },
});
