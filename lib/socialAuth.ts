import {
  GoogleSignin,
  isErrorWithCode,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';

import { GOOGLE_IOS_CLIENT_ID } from '@/constants/googleAuth';
import { createAuthNonce } from '@/lib/authNonce';

export type AppleAuthCredential = {
  identityToken: string;
  /** Raw nonce for Supabase `signInWithIdToken` (provider receives the SHA-256 hash). */
  nonce: string;
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

  const { rawNonce, hashedNonce } = await createAuthNonce();

  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce: hashedNonce,
    });

    if (!credential.identityToken) {
      throw new Error('Apple Sign In did not return a valid token.');
    }

    return {
      identityToken: credential.identityToken,
      nonce: rawNonce,
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
  /**
   * Raw nonce for Supabase when the Google ID token was issued with a matching
   * SHA-256 nonce claim. Classic Google Sign-In cannot set a custom nonce; keep
   * "Skip nonce check" enabled for Google until Universal Sign-In is adopted.
   */
  nonce?: string;
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

  // Generate a nonce pair so the flow matches Supabase guidance. Classic
  // `@react-native-google-signin` cannot embed a custom nonce in the ID token
  // (that requires Universal Sign-In / One Tap). We still prepare the pair and
  // forward it when the native layer starts accepting it.
  const { rawNonce, hashedNonce } = await createAuthNonce();

  if (Platform.OS === 'android') {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  }

  try {
    const response = await GoogleSignin.signIn({
      // Forward-compatible: ignored by classic Google Sign-In native code today.
      ...( { nonce: hashedNonce } as Record<string, string>),
    });
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

    // Only send a nonce to Supabase when the ID token embeds our hashed nonce.
    // Classic Google Sign-In usually omits nonce; Universal Sign-In can accept it.
    const nonceMatches = idTokenNonceMatches(identityToken, hashedNonce);

    return {
      identityToken,
      ...(nonceMatches ? { nonce: rawNonce } : {}),
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

function idTokenNonceMatches(identityToken: string, hashedNonce: string): boolean {
  try {
    const payload = identityToken.split('.')[1];
    if (!payload) return false;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
    if (typeof globalThis.atob !== 'function') return false;
    const claims = JSON.parse(globalThis.atob(padded)) as { nonce?: unknown };
    return typeof claims.nonce === 'string' && claims.nonce === hashedNonce;
  } catch {
    return false;
  }
}
