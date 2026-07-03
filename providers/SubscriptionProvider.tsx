import Purchases, {
  type CustomerInfo,
  LOG_LEVEL,
  type PurchasesStoreProduct,
} from 'react-native-purchases';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Alert, AppState, Platform } from 'react-native';

import { SubscriptionPaywallModal } from '@/components/subscription/SubscriptionPaywallModal';
import type { PremiumPlanId } from '@/constants/appInfo';
import {
  getRevenueCatApiKey,
  isRevenueCatConfigured,
  isUsingRevenueCatTestStore,
  REVENUECAT_ENTITLEMENT_PREMIUM,
  REVENUECAT_PRODUCT_IDS,
} from '@/constants/revenueCat';
import {
  consumePendingPremiumMutation,
  registerPremiumGate,
  resetPremiumGate,
} from '@/lib/premiumGate';
import {
  formatStatusDate,
  formatSubscriptionStatusLabel,
  getTrialInfo,
  hasPremiumAccess,
  premiumPlanIdToProductId,
  resolveAccessStatus,
  resolveSubscriptionPlan,
  type SubscriptionAccessStatus,
  type SubscriptionPlan,
  type TrialInfo,
} from '@/lib/subscription';
import { useAppStore } from '@/providers/AppStore';

type SubscriptionContextValue = {
  isReady: boolean;
  hasPremiumEntitlement: boolean;
  hasPremiumAccess: boolean;
  accessStatus: SubscriptionAccessStatus;
  activePlan: SubscriptionPlan;
  trialInfo: TrialInfo | null;
  statusLabel: string;
  statusDate: Date | null;
  statusDateLabel: string | null;
  isPurchasing: boolean;
  isRestoring: boolean;
  purchasePlan: (planId: PremiumPlanId) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  showPaywall: () => void;
  hidePaywall: () => void;
};

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

function readEntitlementState(customerInfo: CustomerInfo) {
  const entitlement = customerInfo.entitlements.active[REVENUECAT_ENTITLEMENT_PREMIUM];
  const hasPremiumEntitlement = entitlement !== undefined;
  const activePlan = resolveSubscriptionPlan(entitlement?.productIdentifier);
  const expirationDate = entitlement?.expirationDate
    ? new Date(entitlement.expirationDate)
    : null;

  return { hasPremiumEntitlement, activePlan, expirationDate };
}

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { hydrated, isLoggedIn, user, trialStartedAt } = useAppStore();
  const [isReady, setIsReady] = useState(false);
  const [hasPremiumEntitlement, setHasPremiumEntitlement] = useState(false);
  const [activePlan, setActivePlan] = useState<SubscriptionPlan>(null);
  const [renewalDate, setRenewalDate] = useState<Date | null>(null);
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const configuredRef = useRef(false);

  const applyCustomerInfo = useCallback((customerInfo: CustomerInfo) => {
    const next = readEntitlementState(customerInfo);
    setHasPremiumEntitlement(next.hasPremiumEntitlement);
    setActivePlan(next.activePlan);
    setRenewalDate(next.expirationDate);
  }, []);

  const refreshCustomerInfo = useCallback(async () => {
    if (!configuredRef.current) return;

    try {
      const customerInfo = await Purchases.getCustomerInfo();
      applyCustomerInfo(customerInfo);
    } catch {
      // Preview mode or offline — keep last known state.
    }
  }, [applyCustomerInfo]);

  useEffect(() => {
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
      setIsReady(true);
      return;
    }

    const apiKey = getRevenueCatApiKey();
    if (!apiKey) {
      setIsReady(true);
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        if (__DEV__) {
          Purchases.setLogLevel(LOG_LEVEL.DEBUG);
        }
        if (__DEV__ && isUsingRevenueCatTestStore()) {
          console.log('[RevenueCat] Using Test Store API key for development purchases.');
        }
        Purchases.configure({ apiKey });
        configuredRef.current = true;

        if (!isRevenueCatConfigured()) {
          // Placeholder keys: SDK initializes but store purchases stay unavailable.
        }

        const customerInfo = await Purchases.getCustomerInfo();
        if (!cancelled) applyCustomerInfo(customerInfo);
      } catch {
        // Expo Go preview mode may still allow mocked flows.
      } finally {
        if (!cancelled) setIsReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [applyCustomerInfo]);

  useEffect(() => {
    if (!configuredRef.current || !isLoggedIn || !user?.email) return;

    let cancelled = false;

    void (async () => {
      try {
        const { customerInfo } = await Purchases.logIn(user.email);
        if (!cancelled) applyCustomerInfo(customerInfo);
      } catch {
        await refreshCustomerInfo();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [applyCustomerInfo, isLoggedIn, refreshCustomerInfo, user?.email]);

  useEffect(() => {
    if (!configuredRef.current) return;

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        void refreshCustomerInfo();
      }
    });

    return () => subscription.remove();
  }, [refreshCustomerInfo]);

  useEffect(() => {
    if (hydrated && isReady && configuredRef.current) {
      void refreshCustomerInfo();
    }
  }, [hydrated, isReady, refreshCustomerInfo]);

  const trialInfo = useMemo(
    () => (isLoggedIn ? getTrialInfo(trialStartedAt) : null),
    [isLoggedIn, trialStartedAt],
  );

  const premiumAccess = useMemo(
    () =>
      isLoggedIn &&
      hasPremiumAccess({
        trialStartedAt,
        hasPremiumEntitlement,
      }),
    [hasPremiumEntitlement, isLoggedIn, trialStartedAt],
  );

  const accessStatus = useMemo(
    () =>
      resolveAccessStatus({
        trialStartedAt: isLoggedIn ? trialStartedAt : null,
        hasPremiumEntitlement,
        activePlan,
      }),
    [activePlan, hasPremiumEntitlement, isLoggedIn, trialStartedAt],
  );

  const statusDate = useMemo(() => {
    if (accessStatus === 'trial') return trialInfo?.endsAt ?? null;
    if (accessStatus === 'monthly' || accessStatus === 'annual') return renewalDate;
    if (accessStatus === 'expired') return trialInfo?.endsAt ?? null;
    return null;
  }, [accessStatus, renewalDate, trialInfo?.endsAt]);

  const statusDateLabel = useMemo(() => {
    if (!statusDate) return null;
    if (accessStatus === 'trial') return `Trial ends ${formatStatusDate(statusDate)}`;
    if (accessStatus === 'monthly' || accessStatus === 'annual') {
      return `Renews ${formatStatusDate(statusDate)}`;
    }
    if (accessStatus === 'expired' && statusDate) {
      return `Trial ended ${formatStatusDate(statusDate)}`;
    }
    return null;
  }, [accessStatus, statusDate]);

  const finishPurchaseFlow = useCallback(() => {
    setPaywallVisible(false);
    const pending = consumePendingPremiumMutation();
    pending?.();
  }, []);

  const purchaseStoreProduct = useCallback(
    async (product: PurchasesStoreProduct) => {
      setIsPurchasing(true);
      try {
        const { customerInfo } = await Purchases.purchaseStoreProduct(product);
        applyCustomerInfo(customerInfo);
        finishPurchaseFlow();
        return true;
      } catch (error: unknown) {
        const userCancelled =
          typeof error === 'object' &&
          error !== null &&
          'userCancelled' in error &&
          (error as { userCancelled?: boolean }).userCancelled;

        if (!userCancelled) {
          Alert.alert(
            'Purchase unavailable',
            isRevenueCatConfigured()
              ? 'We could not complete your purchase. Please try again.'
              : 'Add your RevenueCat API keys and store products before purchasing.',
          );
        }
        return false;
      } finally {
        setIsPurchasing(false);
      }
    },
    [applyCustomerInfo, finishPurchaseFlow],
  );

  const loadStoreProduct = useCallback(async (planId: PremiumPlanId) => {
    const productId = premiumPlanIdToProductId(planId);
    const products = await Purchases.getProducts([productId]);
    return products.find((product) => product.identifier === productId) ?? null;
  }, []);

  const purchasePlan = useCallback(
    async (planId: PremiumPlanId) => {
      if (!configuredRef.current) {
        Alert.alert(
          'Purchases unavailable',
          'Subscriptions require a native build with RevenueCat configured.',
        );
        return false;
      }

      try {
        const product = await loadStoreProduct(planId);
        if (!product) {
          Alert.alert(
            'Plan unavailable',
            isRevenueCatConfigured()
              ? `Could not load ${planId === 'yearly' ? 'annual' : 'monthly'} plan from the store.`
              : 'Connect RevenueCat and App Store / Play Console products to enable purchases.',
          );
          return false;
        }

        return purchaseStoreProduct(product);
      } catch {
        Alert.alert(
          'Purchase unavailable',
          'We could not reach the store. Please try again later.',
        );
        return false;
      }
    },
    [loadStoreProduct, purchaseStoreProduct],
  );

  const restorePurchases = useCallback(async () => {
    if (!configuredRef.current) {
      Alert.alert(
        'Restore unavailable',
        'Restore requires a native build with RevenueCat configured.',
      );
      return false;
    }

    setIsRestoring(true);
    try {
      const customerInfo = await Purchases.restorePurchases();
      applyCustomerInfo(customerInfo);

      if (customerInfo.entitlements.active[REVENUECAT_ENTITLEMENT_PREMIUM]) {
        finishPurchaseFlow();
        Alert.alert('Restored', 'Your flowr Premium subscription is active.');
        return true;
      }

      Alert.alert('No subscription found', 'We could not find an active subscription to restore.');
      return false;
    } catch {
      Alert.alert('Restore failed', 'We could not restore purchases. Please try again.');
      return false;
    } finally {
      setIsRestoring(false);
    }
  }, [applyCustomerInfo, finishPurchaseFlow]);

  const showPaywall = useCallback(() => setPaywallVisible(true), []);
  const hidePaywall = useCallback(() => setPaywallVisible(false), []);

  useEffect(() => {
    registerPremiumGate({
      canMutate: () =>
        Boolean(
          isLoggedIn &&
            hasPremiumAccess({
              trialStartedAt,
              hasPremiumEntitlement,
            }),
        ),
      onBlocked: () => setPaywallVisible(true),
    });

    return () => resetPremiumGate();
  }, [hasPremiumEntitlement, isLoggedIn, trialStartedAt]);

  const value = useMemo<SubscriptionContextValue>(
    () => ({
      isReady,
      hasPremiumEntitlement,
      hasPremiumAccess: premiumAccess,
      accessStatus,
      activePlan,
      trialInfo,
      statusLabel: formatSubscriptionStatusLabel(accessStatus),
      statusDate,
      statusDateLabel,
      isPurchasing,
      isRestoring,
      purchasePlan,
      restorePurchases,
      showPaywall,
      hidePaywall,
    }),
    [
      accessStatus,
      activePlan,
      hidePaywall,
      hasPremiumEntitlement,
      isPurchasing,
      isReady,
      isRestoring,
      premiumAccess,
      purchasePlan,
      restorePurchases,
      showPaywall,
      statusDate,
      statusDateLabel,
      trialInfo,
    ],
  );

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
      <SubscriptionPaywallModal
        visible={paywallVisible}
        isPurchasing={isPurchasing}
        isRestoring={isRestoring}
        onPurchase={(planId) => {
          void purchasePlan(planId);
        }}
        onRestore={() => {
          void restorePurchases();
        }}
        onClose={hidePaywall}
      />
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
}

export { REVENUECAT_PRODUCT_IDS };
