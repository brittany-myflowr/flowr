import { Platform } from 'react-native';

/** Production App Store / Play Store keys — used in release builds. */
export const REVENUECAT_API_KEYS = {
  ios: 'appl_VArotJUjXrKZglkWWFPWMubvEke',
  android: 'goog_PLACEHOLDER_REPLACE_WITH_ANDROID_KEY',
} as const;

export const REVENUECAT_ENTITLEMENT_PREMIUM = 'premium';

export const REVENUECAT_PRODUCT_IDS = {
  monthly: 'flowr_monthly',
  annual: 'flowr_annual',
} as const;

/**
 * Test Store is used in development when EXPO_PUBLIC_REVENUECAT_TEST_STORE_API_KEY is set.
 * Get the key from RevenueCat → Apps & providers → Test Store.
 * Set EXPO_PUBLIC_REVENUECAT_USE_TEST_STORE=false to test real App Store sandbox instead.
 */
export function shouldUseRevenueCatTestStore(): boolean {
  if (!__DEV__) return false;
  return process.env.EXPO_PUBLIC_REVENUECAT_USE_TEST_STORE !== 'false';
}

export function getRevenueCatTestStoreApiKey(): string | null {
  const key = process.env.EXPO_PUBLIC_REVENUECAT_TEST_STORE_API_KEY?.trim();
  return key || null;
}

export function isUsingRevenueCatTestStore(): boolean {
  return shouldUseRevenueCatTestStore() && Boolean(getRevenueCatTestStoreApiKey());
}

export function getRevenueCatApiKey(): string | null {
  const testStoreKey = getRevenueCatTestStoreApiKey();
  if (shouldUseRevenueCatTestStore() && testStoreKey) {
    return testStoreKey;
  }

  if (Platform.OS === 'ios') return REVENUECAT_API_KEYS.ios;
  if (Platform.OS === 'android') return REVENUECAT_API_KEYS.android;
  return null;
}

export function isRevenueCatConfigured(): boolean {
  const key = getRevenueCatApiKey();
  return Boolean(key && !key.includes('PLACEHOLDER'));
}
