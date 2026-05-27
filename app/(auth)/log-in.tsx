import { useRouter } from 'expo-router';
import { useState } from 'react';
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
import { signInWithApplePlaceholder, signInWithGooglePlaceholder } from '@/lib/socialAuth';
import { s, vs, fs } from '@/lib/scale';

export default function LogInScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    const message = signIn({ email, password });
    if (message) {
      setError(message);
      return;
    }

    router.replace('/(tabs)');
  };

  const canSubmit = email.trim().length > 0 && password.length > 0;

  return (
    <AuthFormLayout headerSubtitle="Welcome back">
      <View style={styles.backLink}>
        <TextLink onPress={() => router.replace('/(auth)/splash')}>← Back</TextLink>
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
        placeholder="Your password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
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
      <AppleSignInButton onPress={signInWithApplePlaceholder} />
      <GoogleSignInButton onPress={signInWithGooglePlaceholder} />

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
