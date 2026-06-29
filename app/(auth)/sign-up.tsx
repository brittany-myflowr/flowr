import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppleSignInButton } from '@/components/auth/AppleSignInButton';
import { AuthFormLayout } from '@/components/auth/AuthFormLayout';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { FullWidthButton } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { TextLink } from '@/components/ui/TextLink';
import { PRIVACY_POLICY_URL, TERMS_URL } from '@/constants/appInfo';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { openExternalUrl } from '@/lib/appLinking';
import { signInWithGooglePlaceholder } from '@/lib/socialAuth';
import { isValidEmail } from '@/lib/validation';
import { useAuth } from '@/providers/AppStore';
import { s, fs } from '@/lib/scale';

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp, signInWithApple, isLoggedIn } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [awaitingEntry, setAwaitingEntry] = useState(false);
  const [isAppleSigningIn, setIsAppleSigningIn] = useState(false);

  useEffect(() => {
    if (!awaitingEntry || !isLoggedIn) return;
    router.replace('/(tabs)');
  }, [awaitingEntry, isLoggedIn, router]);

  const handleSubmit = async () => {
    if (!isValidEmail(email)) {
      setError('Enter a valid email address.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const message = await signUp({ firstName, lastName, email, password });
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

  const canSubmit =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    isValidEmail(email) &&
    password.length >= 8 &&
    confirmPassword.length > 0;

  return (
    <AuthFormLayout headerSubtitle="Create your account">
      <View style={styles.backLink}>
        <TextLink onPress={() => router.replace('/(auth)/splash')}>← Back</TextLink>
      </View>

      <View style={styles.nameRow}>
        <View style={styles.nameField}>
          <Text style={styles.fieldLabel}>First Name</Text>
          <Input
            placeholder="First name"
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="words"
          />
        </View>
        <View style={styles.nameField}>
          <Text style={styles.fieldLabel}>Last Name</Text>
          <Input
            placeholder="Last name"
            value={lastName}
            onChangeText={setLastName}
            autoCapitalize="words"
          />
        </View>
      </View>

      <FormField
        label="Email"
        placeholder="you@email.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <FormField
        label="Password"
        placeholder="Min. 8 characters"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <FormField
        label="Confirm Password"
        placeholder="Repeat password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FullWidthButton label="Create Account" onPress={handleSubmit} disabled={!canSubmit} />

      <Divider label="or" />
      <AppleSignInButton
        onPress={() => {
          void handleAppleSignIn();
        }}
        loading={isAppleSigningIn}
        disabled={isAppleSigningIn}
      />
      <GoogleSignInButton onPress={signInWithGooglePlaceholder} />

      <Pressable onPress={() => router.push('/(auth)/log-in')} style={styles.footerLink}>
        <Text style={styles.footerText}>
          Already have an account?{' '}
          <Text style={styles.footerAction}>Log in</Text>
        </Text>
      </Pressable>

      <Text style={styles.legal}>
        By creating an account you agree to our{' '}
        <Text style={styles.legalLink} onPress={() => openExternalUrl(TERMS_URL)}>
          Terms
        </Text>{' '}
        and{' '}
        <Text style={styles.legalLink} onPress={() => openExternalUrl(PRIVACY_POLICY_URL)}>
          Privacy Policy
        </Text>
      </Text>
    </AuthFormLayout>
  );
}

const styles = StyleSheet.create({
  backLink: {
    marginBottom: s(12),
  },
  nameRow: {
    flexDirection: 'row',
    gap: s(8),
    marginBottom: s(10),
  },
  nameField: {
    flex: 1,
  },
  fieldLabel: {
    fontFamily: fonts.dmSans,
    fontSize: fs(7),
    letterSpacing: s(2),
    textTransform: 'uppercase',
    color: colors.muted,
    marginBottom: s(4),
  },
  error: {
    marginBottom: s(10),
    fontFamily: fonts.dmSans,
    fontSize: fs(11),
    color: colors.danger,
  },
  footerLink: {
    marginTop: s(10),
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
  legal: {
    marginTop: s(10),
    textAlign: 'center',
    fontFamily: fonts.dmSans,
    fontSize: fs(9),
    color: '#c8d9e6',
    lineHeight: fs(16),
  },
  legalLink: {
    textDecorationLine: 'underline',
  },
});
