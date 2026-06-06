import { Platform } from 'react-native';

/** Replace with keys from the RevenueCat dashboard before shipping. */
export const REVENUECAT_API_KEYS = {
  ios: 'appl_VArotJUjXrKZglkWWFPWMubvEke',
  android: 'goog_PLACEHOLDER_REPLACE_WITH_ANDROID_KEY',
} as const;

export const REVENUECAT_ENTITLEMENT_PREMIUM = 'premium';

export const REVENUECAT_PRODUCT_IDS = {
  monthly: 'flowr_monthly',
  annual: 'flowr_annual',
} as const;

export function getRevenueCatApiKey(): string | null {
  if (Platform.OS === 'ios') return REVENUECAT_API_KEYS.ios;
  if (Platform.OS === 'android') return REVENUECAT_API_KEYS.android;
  return null;
}

export function isRevenueCatConfigured(): boolean {
  const key = getRevenueCatApiKey();
  return Boolean(key && !key.includes('PLACEHOLDER'));
}
