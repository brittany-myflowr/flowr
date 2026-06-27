import { useLinkingURL } from 'expo-linking';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AuthFormLayout } from '@/components/auth/AuthFormLayout';
import { FullWidthButton } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { TextLink } from '@/components/ui/TextLink';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { establishSessionFromRecoveryUrl, getCurrentSessionEmail } from '@/lib/supabase/auth';
import { useAuth } from '@/providers/AppStore';
import { s, fs } from '@/lib/scale';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const linkingUrl = useLinkingURL();
  const { updatePassword, signOut } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [isVerifyingLink, setIsVerifyingLink] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const verifyRecoveryLink = async (url: string | null, attempt = 0) => {
      setIsVerifyingLink(true);
      setLinkError(null);

      const message = await establishSessionFromRecoveryUrl(url);
      if (cancelled) return;

      if (message && attempt < 3) {
        // Global handler may still be exchanging the PKCE code on cold start.
        await new Promise((resolve) => setTimeout(resolve, 400));
        if (cancelled) return;
        return verifyRecoveryLink(url, attempt + 1);
      }

      setIsVerifyingLink(false);

      if (message) {
        setSessionReady(false);
        setLinkError(message);
        return;
      }

      setSessionReady(true);
    };

    void verifyRecoveryLink(linkingUrl);
    return () => {
      cancelled = true;
    };
  }, [linkingUrl]);

  const canSubmit =
    sessionReady &&
    password.length >= 8 &&
    confirmPassword.length > 0 &&
    !isSubmitting;

  const handleSubmit = async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const accountEmail = await getCurrentSessionEmail();
    const message = await updatePassword(password);
    if (message) {
      setIsSubmitting(false);
      setError(message);
      return;
    }

    await signOut();
    setIsSubmitting(false);

    router.replace({
      pathname: '/(auth)/log-in',
      params: {
        passwordUpdated: '1',
        ...(accountEmail ? { email: accountEmail } : {}),
      },
    });
  };

  if (isVerifyingLink) {
    return (
      <AuthFormLayout headerCompact>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.navy} />
          <Text style={styles.statusText}>Verifying your reset link…</Text>
        </View>
      </AuthFormLayout>
    );
  }

  if (linkError) {
    return (
      <AuthFormLayout headerCompact>
        <TextLink onPress={() => router.replace('/(auth)/log-in')}>← Back to log in</TextLink>

        <Text style={styles.title}>Link expired</Text>
        <Text style={styles.description}>{linkError}</Text>

        <FullWidthButton
          label="Request a new link"
          onPress={() => router.replace('/(auth)/forgot-password')}
        />
      </AuthFormLayout>
    );
  }

  return (
    <AuthFormLayout headerCompact>
      <TextLink onPress={() => router.replace('/(auth)/log-in')}>← Back to log in</TextLink>

      <Text style={styles.title}>Choose a new password</Text>
      <Text style={styles.description}>Enter and confirm your new password below.</Text>

      <FormField
        label="New password"
        placeholder="At least 8 characters"
        value={password}
        onChangeText={(value) => {
          setPassword(value);
          if (error) setError(null);
        }}
        secureTextEntry
        textContentType="newPassword"
        autoComplete="password-new"
        passwordRules="minlength: 8;"
        importantForAutofill="yes"
      />
      <FormField
        label="Confirm password"
        placeholder="Re-enter your password"
        value={confirmPassword}
        onChangeText={(value) => {
          setConfirmPassword(value);
          if (error) setError(null);
        }}
        secureTextEntry
        textContentType="newPassword"
        autoComplete="password-new"
        importantForAutofill="yes"
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FullWidthButton
        label={isSubmitting ? 'Updating…' : 'Update Password'}
        onPress={() => {
          void handleSubmit();
        }}
        disabled={!canSubmit}
      />
    </AuthFormLayout>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: s(40),
    gap: s(12),
  },
  statusText: {
    fontFamily: fonts.dmSans,
    fontSize: fs(11),
    color: colors.gray,
    textAlign: 'center',
  },
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
