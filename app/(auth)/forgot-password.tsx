import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { AuthFormLayout } from '@/components/auth/AuthFormLayout';
import { FullWidthButton } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { TextLink } from '@/components/ui/TextLink';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { s, fs } from '@/lib/scale';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  return (
    <AuthFormLayout headerCompact>
      <TextLink onPress={() => router.back()}>← Back to log in</TextLink>

      <Text style={styles.title}>Reset your password</Text>
      <Text style={styles.description}>
        Enter your email and we&apos;ll send you a link to reset your password.
      </Text>

      <FormField
        label="Email"
        placeholder="you@email.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <FullWidthButton label="Send Reset Link" onPress={() => router.back()} />
    </AuthFormLayout>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: s(14),
    marginBottom: s(6),
    fontFamily: fonts.lora,
    fontSize: fs(20),
    color: colors.navy,
  },
  description: {
    marginBottom: s(16),
    fontFamily: fonts.dmSans,
    fontSize: fs(11),
    color: colors.gray,
    lineHeight: fs(18),
  },
});
