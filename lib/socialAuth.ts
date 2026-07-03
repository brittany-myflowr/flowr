import {
  GoogleSignin,
  isErrorWithCode,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';

import { GOOGLE_IOS_CLIENT_ID } from '@/constants/googleAuth';

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

export type GoogleAuthCredential = {
  identityToken: string;
  email?: string | null;
  firstName?: string;
  lastName?: string;
};

let googleSignInConfigured = false;

function ensureGoogleSignInConfigured() {
  if (googleSignInConfigured) return;

  GoogleSignin.configure({
    iosClientId: GOOGLE_IOS_CLIENT_ID,
  });
  googleSignInConfigured = true;
}

export async function getGoogleCredential(): Promise<GoogleAuthCredential | 'cancelled'> {
  ensureGoogleSignInConfigured();

  if (Platform.OS === 'android') {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  }

  try {
    const response = await GoogleSignin.signIn();
    if (response.type === 'cancelled') {
      return 'cancelled';
    }

    let identityToken = response.data.idToken;
    if (!identityToken) {
      const tokens = await GoogleSignin.getTokens();
      identityToken = tokens.idToken;
    }

    if (!identityToken) {
      throw new Error('Google Sign In did not return a valid token.');
    }

    return {
      identityToken,
      email: response.data.user.email,
      firstName: response.data.user.givenName?.trim() || undefined,
      lastName: response.data.user.familyName?.trim() || undefined,
    };
  } catch (error) {
    if (isErrorWithCode(error) && error.code === statusCodes.SIGN_IN_CANCELLED) {
      return 'cancelled';
    }
    throw error;
  }
}
