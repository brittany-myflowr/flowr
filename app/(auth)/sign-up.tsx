import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AppleSignInButton } from '@/components/auth/AppleSignInButton';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { FullWidthButton } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { TextLink } from '@/components/ui/TextLink';
import { PRIVACY_POLICY_URL, TERMS_URL } from '@/constants/appInfo';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { openExternalUrl } from '@/lib/appLinking';
import { signInWithApplePlaceholder, signInWithGooglePlaceholder } from '@/lib/socialAuth';
import { useAuth } from '@/providers/AppStore';

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const message = signUp({ firstName, lastName, email, password });
    if (message) {
      setError(message);
      return;
    }

    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <AuthHeader subtitle="Create your account" />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
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

        <FullWidthButton label="Create Account" onPress={handleSubmit} />

        <Divider label="or" />
        <AppleSignInButton onPress={signInWithApplePlaceholder} />
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
    paddingTop: 14,
    paddingBottom: 24,
  },
  backLink: {
    marginBottom: 12,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  nameField: {
    flex: 1,
  },
  fieldLabel: {
    fontFamily: fonts.dmSans,
    fontSize: 7,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.muted,
    marginBottom: 4,
  },
  error: {
    marginBottom: 10,
    fontFamily: fonts.dmSans,
    fontSize: 11,
    color: colors.danger,
  },
  footerLink: {
    marginTop: 10,
    alignItems: 'center',
  },
  footerText: {
    fontFamily: fonts.dmSans,
    fontSize: 10,
    color: colors.muted,
  },
  footerAction: {
    color: colors.blue,
    fontFamily: fonts.dmSansSemiBold,
    fontWeight: '600',
  },
  legal: {
    marginTop: 10,
    textAlign: 'center',
    fontFamily: fonts.dmSans,
    fontSize: 9,
    color: '#c8d9e6',
    lineHeight: 16,
  },
  legalLink: {
    textDecorationLine: 'underline',
  },
});
