import { Linking, Platform } from 'react-native';

const IOS_SUBSCRIPTION_URL = 'https://apps.apple.com/account/subscriptions';
const ANDROID_SUBSCRIPTION_URL = 'https://play.google.com/store/account/subscriptions';

export async function openNativeSubscriptionManagement(): Promise<void> {
  const url = Platform.OS === 'ios' ? IOS_SUBSCRIPTION_URL : ANDROID_SUBSCRIPTION_URL;
  const canOpen = await Linking.canOpenURL(url);
  if (!canOpen) return;
  await Linking.openURL(url);
}
