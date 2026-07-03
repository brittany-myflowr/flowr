import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppleSignInButton } from '@/components/auth/AppleSignInButton';
import { AuthFormLayout } from '@/components/auth/AuthFormLayout';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { FullWidthButton } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { FormField } from '@/components/ui/FormField';
import { TextLink } from '@/components/ui/TextLink';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { useAuth } from '@/providers/AppStore';
import { isValidEmail } from '@/lib/validation';
import { s, vs, fs } from '@/lib/scale';

export default function LogInScreen() {
  const router = useRouter();
  const { passwordUpdated, email: emailParam } = useLocalSearchParams<{
    passwordUpdated?: string;
    email?: string;
  }>();
  const { signIn, signInWithApple, signInWithGoogle, isLoggedIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [awaitingEntry, setAwaitingEntry] = useState(false);
  const [isAppleSigningIn, setIsAppleSigningIn] = useState(false);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);
  const showPasswordUpdatedBanner = passwordUpdated === '1';

  useEffect(() => {
    if (typeof emailParam === 'string' && emailParam.length > 0) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  useEffect(() => {
    if (!awaitingEntry || !isLoggedIn) return;
    router.replace('/(tabs)');
  }, [awaitingEntry, isLoggedIn, router]);

  const handleSubmit = async () => {
    if (!isValidEmail(email)) {
      setError('Enter a valid email address.');
      return;
    }

    const message = await signIn({ email, password });
    if (message) {
      setError(message);
      return;
    }

    setAwaitingEntry(true);
  };

  const handleAppleSignIn = async () => {
    setIsAppleSigningIn(true);
    setError(null);

    const message = await signInWithApple();
    setIsAppleSigningIn(false);

    if (message === undefined) return;
    if (message) {
      setError(message);
      return;
    }

    setAwaitingEntry(true);
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleSigningIn(true);
    setError(null);

    const message = await signInWithGoogle();
    setIsGoogleSigningIn(false);

    if (message === undefined) return;
    if (message) {
      setError(message);
      return;
    }

    setAwaitingEntry(true);
  };

  const canSubmit = isValidEmail(email) && password.length > 0;

  return (
    <AuthFormLayout headerSubtitle="Welcome back">
      <View style={styles.backLink}>
        <TextLink onPress={() => router.replace('/(auth)/splash')}>← Back</TextLink>
      </View>

      {showPasswordUpdatedBanner ? (
        <View style={styles.successBanner}>
          <Text style={styles.successBannerText}>
            Password updated. Sign in with your new password so iPhone can save it.
          </Text>
        </View>
      ) : null}

      <FormField
        label="Email"
        placeholder="you@email.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        textContentType="username"
        autoComplete="username"
        importantForAutofill="yes"
      />
      <FormField
        label="Password"
        placeholder="Your password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        textContentType="password"
        autoComplete="password"
        importantForAutofill="yes"
      />

      <TextLink
        align="right"
        onPress={() => router.push('/(auth)/forgot-password')}
      >
        Forgot password?
      </TextLink>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.spacer} />
      <FullWidthButton label="Log In" onPress={handleSubmit} disabled={!canSubmit} />

      <Divider label="or" />
      <AppleSignInButton
        onPress={() => {
          void handleAppleSignIn();
        }}
        loading={isAppleSigningIn}
        disabled={isAppleSigningIn || isGoogleSigningIn}
      />
      <GoogleSignInButton
        onPress={() => {
          void handleGoogleSignIn();
        }}
        loading={isGoogleSigningIn}
        disabled={isAppleSigningIn || isGoogleSigningIn}
      />

      <Pressable onPress={() => router.push('/(auth)/sign-up')} style={styles.footerLink}>
        <Text style={styles.footerText}>
          Don&apos;t have an account?{' '}
          <Text style={styles.footerAction}>Sign up</Text>
        </Text>
      </Pressable>
    </AuthFormLayout>
  );
}

const styles = StyleSheet.create({
  backLink: {
    marginBottom: s(12),
  },
  successBanner: {
    marginBottom: s(14),
    paddingVertical: s(10),
    paddingHorizontal: s(12),
    borderRadius: s(8),
    backgroundColor: `${colors.blue}14`,
    borderWidth: 1,
    borderColor: `${colors.blue}33`,
  },
  successBannerText: {
    fontFamily: fonts.dmSans,
    fontSize: fs(11),
    lineHeight: fs(17),
    color: colors.navy,
  },
  spacer: {
    height: vs(14),
    marginTop: s(-6),
  },
  error: {
    marginTop: s(10),
    fontFamily: fonts.dmSans,
    fontSize: fs(11),
    color: colors.danger,
  },
  footerLink: {
    alignItems: 'center',
  },
  footerText: {
    fontFamily: fonts.dmSans,
    fontSize: fs(10),
    color: colors.muted,
  },
  footerAction: {
    color: colors.blue,
    fontFamily: fonts.dmSansSemiBold,
    fontWeight: '600',
  },
});
