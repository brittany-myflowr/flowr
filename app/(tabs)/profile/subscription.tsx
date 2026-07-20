import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { PlanOptionCard } from '@/components/profile/ProfileInfoRows';
import {
  ProfileScreenShell,
  profileBodyStyles as styles,
} from '@/components/profile/ProfileScreenShell';
import { SubscriptionLegalNotice } from '@/components/subscription/SubscriptionLegalNotice';
import { FullWidthButton } from '@/components/ui/Button';
import { PREMIUM_PLANS, type PremiumPlanId } from '@/constants/appInfo';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { fs, s, vs } from '@/lib/scale';
import { openNativeSubscriptionManagement } from '@/lib/subscriptionLinks';
import { useSubscription } from '@/providers/SubscriptionProvider';

export default function SubscriptionScreen() {
  const {
    accessStatus,
    statusLabel,
    statusDateLabel,
    hasPremiumEntitlement,
    isPurchasing,
    isRestoring,
    purchasePlan,
    restorePurchases,
  } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<PremiumPlanId>('yearly');

  const showPlanPicker = !hasPremiumEntitlement;
  const busy = isPurchasing || isRestoring;

  return (
    <ProfileScreenShell title="Manage Subscription" subtitle="Account">
      <View style={styles.card}>
        <Text style={styles.label}>Current Plan</Text>
        <Text style={styles.value}>{statusLabel}</Text>
        {statusDateLabel ? <Text style={styles.meta}>{statusDateLabel}</Text> : null}
      </View>

      {showPlanPicker ? (
        <>
          <Text style={styles.sectionTitle}>Choose a plan</Text>
          {PREMIUM_PLANS.map((plan) => (
            <PlanOptionCard
              key={plan.id}
              label={plan.label}
              price={plan.price}
              interval={plan.interval}
              badge={plan.badge}
              selected={selectedPlan === plan.id}
              onPress={() => setSelectedPlan(plan.id)}
            />
          ))}

          <FullWidthButton
            label={isPurchasing ? 'Processing…' : 'Subscribe to flowr Premium'}
            onPress={() => {
              void purchasePlan(selectedPlan);
            }}
            disabled={busy}
          />
        </>
      ) : (
        <View style={styles.card}>
          <Text style={[styles.paragraph, styles.paragraphLast]}>
            {accessStatus === 'annual'
              ? 'You have full access with your annual flowr Premium plan.'
              : 'You have full access with your monthly flowr Premium plan.'}
          </Text>
        </View>
      )}

      <Pressable
        onPress={() => {
          void restorePurchases();
        }}
        disabled={busy}
        style={localStyles.restoreRow}
      >
        {isRestoring ? (
          <ActivityIndicator size="small" color={colors.blue} />
        ) : (
          <Text style={localStyles.restoreLabel}>Restore Purchase</Text>
        )}
      </Pressable>

      {hasPremiumEntitlement ? (
        <FullWidthButton
          label="Manage Subscription"
          variant="ghost"
          onPress={() => {
            void openNativeSubscriptionManagement();
          }}
        />
      ) : null}

      {showPlanPicker ? <SubscriptionLegalNotice /> : null}
    </ProfileScreenShell>
  );
}

const localStyles = StyleSheet.create({
  restoreRow: {
    alignItems: 'center',
    paddingVertical: vs(14),
    marginBottom: s(8),
  },
  restoreLabel: {
    fontFamily: fonts.dmSans,
    fontSize: fs(11),
    color: colors.blue,
    textDecorationLine: 'underline',
  },
});
