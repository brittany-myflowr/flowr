import type { PremiumPlanId } from '@/constants/appInfo';
import { REVENUECAT_PRODUCT_IDS } from '@/constants/revenueCat';

export const TRIAL_LENGTH_DAYS = 14;

export type SubscriptionPlan = 'monthly' | 'annual' | null;

export type SubscriptionAccessStatus = 'trial' | 'monthly' | 'annual' | 'expired';

export type TrialInfo = {
  startedAt: string;
  endsAt: Date;
  daysRemaining: number;
  isActive: boolean;
  isLastDay: boolean;
  isProminentReminder: boolean;
};

export function startTrialIso(now = new Date()): string {
  return now.toISOString();
}

export function getTrialInfo(trialStartedAt: string | null, now = new Date()): TrialInfo | null {
  if (!trialStartedAt) return null;

  const startedAtDate = new Date(trialStartedAt);
  if (Number.isNaN(startedAtDate.getTime())) return null;

  const endsAt = new Date(startedAtDate);
  endsAt.setDate(endsAt.getDate() + TRIAL_LENGTH_DAYS);

  const msRemaining = endsAt.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));

  return {
    startedAt: trialStartedAt,
    endsAt,
    daysRemaining,
    isActive: msRemaining > 0,
    isLastDay: daysRemaining === 1,
    isProminentReminder: daysRemaining <= 2 && msRemaining > 0,
  };
}

export function hasActiveTrial(trialStartedAt: string | null, now = new Date()): boolean {
  return getTrialInfo(trialStartedAt, now)?.isActive ?? false;
}

export function resolveSubscriptionPlan(productIdentifier: string | null | undefined): SubscriptionPlan {
  if (!productIdentifier) return null;
  if (productIdentifier === REVENUECAT_PRODUCT_IDS.annual) return 'annual';
  if (productIdentifier === REVENUECAT_PRODUCT_IDS.monthly) return 'monthly';
  return null;
}

export function resolveAccessStatus(input: {
  trialStartedAt: string | null;
  hasPremiumEntitlement: boolean;
  activePlan: SubscriptionPlan;
  now?: Date;
}): SubscriptionAccessStatus {
  if (input.hasPremiumEntitlement) {
    return input.activePlan === 'annual' ? 'annual' : 'monthly';
  }

  if (hasActiveTrial(input.trialStartedAt, input.now)) {
    return 'trial';
  }

  return 'expired';
}

export function hasPremiumAccess(input: {
  trialStartedAt: string | null;
  hasPremiumEntitlement: boolean;
  now?: Date;
}): boolean {
  return input.hasPremiumEntitlement || hasActiveTrial(input.trialStartedAt, input.now);
}

export function formatSubscriptionStatusLabel(status: SubscriptionAccessStatus): string {
  switch (status) {
    case 'trial':
      return 'Free trial';
    case 'monthly':
      return 'flowr Premium · Monthly';
    case 'annual':
      return 'flowr Premium · Annual';
    case 'expired':
      return 'Trial ended';
  }
}

export function formatStatusDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function premiumPlanIdToProductId(planId: PremiumPlanId): string {
  return planId === 'yearly'
    ? REVENUECAT_PRODUCT_IDS.annual
    : REVENUECAT_PRODUCT_IDS.monthly;
}
