import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AuthHeader } from '@/components/auth/AuthHeader';
import { FullWidthButton } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { TextLink } from '@/components/ui/TextLink';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <AuthHeader compact />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    marginTop: 14,
    marginBottom: 6,
    fontFamily: fonts.lora,
    fontSize: 20,
    color: colors.navy,
  },
  description: {
    marginBottom: 16,
    fontFamily: fonts.dmSans,
    fontSize: 11,
    color: colors.gray,
    lineHeight: 18,
  },
});
