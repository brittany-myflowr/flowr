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

export type PremiumPlanId = 'monthly' | 'yearly';

export const APP_CREDITS = [
  'Built for everyday self-care routines.',
  'Typography: Lora & DM Sans',
] as const;
