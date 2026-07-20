import Constants from 'expo-constants';

export const APP_NAME = 'flowr';
export const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';
export const FEEDBACK_EMAIL = 'hello@myflowr.co';
export const FEEDBACK_SUBJECT = 'flowr feedback';

export const TERMS_URL = 'https://myflowr.co/terms';
export const PRIVACY_POLICY_URL = 'https://myflowr.co/privacy';

export const APP_DESCRIPTION =
  'flowr is your personal self-care planner. Build routines around the things that make you feel your best — skincare, wellness, supplements, and more. Log your favorite products, sync your routines to your cycle, and keep everything beautifully organized. Because taking care of yourself should feel effortless.';

export type PremiumPlan = {
  id: PremiumPlanId;
  label: string;
  price: string;
  interval: string;
  badge?: string;
};

export const PREMIUM_PLANS: PremiumPlan[] = [
  {
    id: 'monthly',
    label: 'Monthly',
    price: '$4.99',
    interval: 'per month',
  },
  {
    id: 'yearly',
    label: 'Yearly',
    price: '$34.99',
    interval: 'per year',
    badge: 'Save 42%',
  },
];

/** Paste into App Store Connect → App Description (Guideline 3.1.2 metadata). */
export const APP_STORE_SUBSCRIPTION_DISCLOSURE = `flowr Premium is an auto-renewable subscription that unlocks the full self-care planner experience.

Subscription lengths and prices:
• Monthly: $4.99 per month
• Yearly: $34.99 per year

Payment will be charged to your Apple ID account at confirmation of purchase. Subscription automatically renews unless auto-renew is turned off at least 24 hours before the end of the current period. Your account will be charged for renewal within 24 hours prior to the end of the current period. Subscriptions may be managed by the user and auto-renewal may be turned off by going to the user's Account Settings after purchase.

Privacy Policy: https://myflowr.co/privacy
Terms of Use: https://myflowr.co/terms`;

export type PremiumPlanId = 'monthly' | 'yearly';

export const APP_CREDITS = [
  'Built for everyday self-care routines.',
  'Typography: Lora & DM Sans',
] as const;
