import { useState } from 'react';
import { Alert, Text, View } from 'react-native';

import { PlanOptionCard } from '@/components/profile/ProfileInfoRows';
import {
  ProfileScreenShell,
  profileBodyStyles as styles,
} from '@/components/profile/ProfileScreenShell';
import { FullWidthButton } from '@/components/ui/Button';
import { PREMIUM_PLANS, type PremiumPlanId } from '@/constants/appInfo';

export default function SubscriptionScreen() {
  const [selectedPlan, setSelectedPlan] = useState<PremiumPlanId>('yearly');

  const handleUpgrade = () => {
    const plan = PREMIUM_PLANS.find((item) => item.id === selectedPlan);
    Alert.alert(
      'Coming soon',
      `flowr Premium (${plan?.price} ${plan?.interval}) will be available when RevenueCat is connected.`,
    );
  };

  return (
    <ProfileScreenShell title="Manage Subscription" subtitle="Account">
      <View style={styles.card}>
        <Text style={styles.label}>Current Plan</Text>
        <Text style={styles.value}>Free</Text>
        <Text style={styles.meta}>All core features on this device</Text>
      </View>

      <Text style={styles.sectionTitle}>Upgrade to flowr Premium</Text>
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

      <View style={styles.card}>
        <Text style={[styles.paragraph, styles.paragraphLast]}>
          Subscriptions will be managed through RevenueCat when billing launches. Plan selection
          here is UI-only for now.
        </Text>
      </View>

      <FullWidthButton label="Upgrade to flowr Premium" onPress={handleUpgrade} />
    </ProfileScreenShell>
  );
}
