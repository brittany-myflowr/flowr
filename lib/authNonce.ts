import * as Crypto from 'expo-crypto';

export type AuthNoncePair = {
  /** Raw nonce passed to Supabase `signInWithIdToken`. */
  rawNonce: string;
  /** SHA-256 hex digest passed to the identity provider (Apple / Google). */
  hashedNonce: string;
};

/**
 * Create a cryptographically random nonce pair for OIDC id-token sign-in.
 * Providers embed the hash in the ID token; Supabase hashes `rawNonce` and compares.
 * @see https://supabase.com/docs/guides/auth/social-login/auth-apple
 */
export async function createAuthNonce(byteLength = 32): Promise<AuthNoncePair> {
  const randomBytes = await Crypto.getRandomBytesAsync(byteLength);
  const rawNonce = Array.from(randomBytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, rawNonce);
  return { rawNonce, hashedNonce };
}
