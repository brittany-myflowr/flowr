import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';

import { AuthFormLayout } from '@/components/auth/AuthFormLayout';
import { FullWidthButton } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { TextLink } from '@/components/ui/TextLink';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { isValidEmail } from '@/lib/validation';
import { useAuth } from '@/providers/AppStore';
import { s, fs } from '@/lib/scale';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = email.trim().length > 0 && !isSubmitting;

  const handleSubmit = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Email is required.');
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setError('Enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const message = await requestPasswordReset(trimmedEmail);
    setIsSubmitting(false);

    if (message) {
      setError(message);
      return;
    }

    Alert.alert(
      'Check your email',
      'If an account exists for that address, we sent a password reset link.',
      [{ text: 'OK', onPress: () => router.back() }],
    );
  };

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
        onChangeText={(value) => {
          setEmail(value);
          if (error) setError(null);
        }}
        keyboardType="email-address"
        autoCapitalize="none"
        textContentType="username"
        autoComplete="username"
        importantForAutofill="yes"
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FullWidthButton
        label={isSubmitting ? 'Sending…' : 'Send Reset Link'}
        onPress={() => {
          void handleSubmit();
        }}
        disabled={!canSubmit}
      />
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
  error: {
    marginBottom: s(10),
    fontFamily: fonts.dmSans,
    fontSize: fs(11),
    color: colors.danger,
  },
});
