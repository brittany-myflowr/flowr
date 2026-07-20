import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Daisy } from '@/components/brand';
import { PlanOptionCard } from '@/components/profile/ProfileInfoRows';
import { SubscriptionLegalNotice } from '@/components/subscription/SubscriptionLegalNotice';
import { FullWidthButton } from '@/components/ui/Button';
import { PREMIUM_PLANS, type PremiumPlanId } from '@/constants/appInfo';
import { colors } from '@/constants/colors';
import { plannerCardBorder, plannerCornerRadius } from '@/constants/plannerCardStyles';
import { fonts } from '@/constants/typography';
import { s, vs, fs } from '@/lib/scale';

type SubscriptionPaywallModalProps = {
  visible: boolean;
  message?: string;
  isPurchasing?: boolean;
  isRestoring?: boolean;
  onPurchase: (planId: PremiumPlanId) => void;
  onRestore: () => void;
  onClose: () => void;
};

export function SubscriptionPaywallModal({
  visible,
  message = 'Your free trial has ended. Subscribe to continue building your flowr routines.',
  isPurchasing = false,
  isRestoring = false,
  onPurchase,
  onRestore,
  onClose,
}: SubscriptionPaywallModalProps) {
  const insets = useSafeAreaInsets();
  const [selectedPlan, setSelectedPlan] = useState<PremiumPlanId>('yearly');
  const busy = isPurchasing || isRestoring;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} disabled={busy} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, s(24)) }]}>
          <View style={styles.handle} />
          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sheetContent}
          >
            <View style={styles.iconWrap}>
              <Daisy color={colors.blue} size={s(36)} strokeWidth={1.75} />
            </View>
            <Text style={styles.heading}>flowr Premium</Text>
            <Text style={styles.message}>{message}</Text>

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
              label={isPurchasing ? 'Processing…' : 'Subscribe'}
              onPress={() => onPurchase(selectedPlan)}
              disabled={busy}
            />

            <Pressable
              onPress={onRestore}
              disabled={busy}
              style={styles.restoreButton}
            >
              {isRestoring ? (
                <ActivityIndicator size="small" color={colors.blue} />
              ) : (
                <Text style={styles.restoreLabel}>Restore Purchase</Text>
              )}
            </Pressable>

            <SubscriptionLegalNotice />

            <Pressable onPress={onClose} disabled={busy} style={styles.dismissButton}>
              <Text style={styles.dismissLabel}>Not now</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: plannerCornerRadius,
    borderTopRightRadius: plannerCornerRadius,
    maxHeight: '92%',
    paddingHorizontal: s(18),
    paddingTop: s(0),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 12,
  },
  sheetContent: {
    paddingBottom: s(8),
  },
  handle: {
    width: s(36),
    height: vs(4),
    borderRadius: plannerCornerRadius,
    backgroundColor: plannerCardBorder,
    alignSelf: 'center',
    marginTop: s(12),
    marginBottom: s(18),
  },
  iconWrap: {
    alignItems: 'center',
    marginBottom: s(8),
  },
  heading: {
    fontFamily: fonts.dmSansSemiBold,
    fontSize: fs(18),
    color: colors.navy,
    textAlign: 'center',
    marginBottom: s(8),
  },
  message: {
    fontFamily: fonts.dmSans,
    fontSize: fs(13),
    color: colors.gray,
    lineHeight: fs(20),
    textAlign: 'center',
    marginBottom: s(16),
    paddingHorizontal: s(8),
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: vs(14),
    marginTop: s(4),
  },
  restoreLabel: {
    fontFamily: fonts.dmSans,
    fontSize: fs(11),
    color: colors.blue,
    textDecorationLine: 'underline',
  },
  dismissButton: {
    alignItems: 'center',
    paddingVertical: vs(10),
    marginTop: s(4),
  },
  dismissLabel: {
    fontFamily: fonts.dmSans,
    fontSize: fs(9),
    letterSpacing: s(1.5),
    textTransform: 'uppercase',
    color: colors.muted,
  },
});
