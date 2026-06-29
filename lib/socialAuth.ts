import * as AppleAuthentication from 'expo-apple-authentication';
import { Alert, Platform } from 'react-native';

export type AppleAuthCredential = {
  identityToken: string;
  email?: string | null;
  firstName?: string;
  lastName?: string;
};

export async function isAppleSignInAvailable(): Promise<boolean> {
  if (Platform.OS !== 'ios') return false;
  return AppleAuthentication.isAvailableAsync();
}

export async function getAppleCredential(): Promise<AppleAuthCredential | 'cancelled'> {
  if (Platform.OS !== 'ios') {
    throw new Error('Apple Sign In is only available on iOS.');
  }

  const available = await AppleAuthentication.isAvailableAsync();
  if (!available) {
    throw new Error('Apple Sign In is not available on this device.');
  }

  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    if (!credential.identityToken) {
      throw new Error('Apple Sign In did not return a valid token.');
    }

    return {
      identityToken: credential.identityToken,
      email: credential.email,
      firstName: credential.fullName?.givenName?.trim() || undefined,
      lastName: credential.fullName?.familyName?.trim() || undefined,
    };
  } catch (error) {
    if (
      error instanceof Error &&
      'code' in error &&
      (error as { code?: string }).code === 'ERR_REQUEST_CANCELED'
    ) {
      return 'cancelled';
    }
    throw error;
  }
}

export function signInWithGooglePlaceholder() {
  Alert.alert(
    'Coming soon',
    'Google Sign In will be connected when OAuth credentials are configured.',
  );
}
