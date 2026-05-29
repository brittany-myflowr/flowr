import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { InlineEmptyCard } from '@/components/feedback/InlineEmptyCard';
import { SubPageHeader } from '@/components/layout/SubPageHeader';
import { ProductPickRow } from '@/components/products/ProductCard';
import { FullWidthButton } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { colors } from '@/constants/colors';
import { plannerCornerRadius } from '@/constants/plannerCardStyles';
import { tabPageStyles, tabPageTypography } from '@/constants/tabPageTypography';
import { fonts } from '@/constants/typography';
import { useProducts, useRoutine, useRoutines } from '@/providers/AppStore';
import { useToast } from '@/providers/ToastProvider';
import { suggestProductsForStep } from '@/lib/suggestProductsForStep';
import { s, vs, fs } from '@/lib/scale';

export default function TagProductScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    routineId,
    stepId,
    selectedProductId,
    guided,
    draft,
    stepIndex,
    stepName,
  } = useLocalSearchParams<{
    routineId?: string;
    stepId?: string;
    selectedProductId?: string;
    guided?: string;
    draft?: string;
    stepIndex?: string;
    stepName?: string;
  }>();
  const isGuided = guided === '1';
  const isDraft = draft === '1';
  const routine = routineId ? useRoutine(routineId) : undefined;
  const { products } = useProducts();
  const { tagStepProduct, setPendingGuidedStepProductResult, setPendingAddStepProduct } =
    useRoutines();
  const { showToast } = useToast();

  const step = routine?.steps.find((item) => item.id === stepId);
  const resolvedStepName = isGuided || isDraft ? stepName : step?.name;

  const [selectedId, setSelectedId] = useState<string | null>(
    selectedProductId ?? step?.productId ?? null,
  );

  useEffect(() => {
    if (selectedProductId) {
      setSelectedId(selectedProductId);
    }
  }, [selectedProductId]);

  const { suggested, rest } = useMemo(() => {
    if (!resolvedStepName) {
      return { suggested: [], rest: products };
    }

    return suggestProductsForStep(resolvedStepName, products);
  }, [products, resolvedStepName]);

  const handleConfirm = () => {
    if (isGuided) {
      setPendingGuidedStepProductResult({
        stepIndex: Number(stepIndex ?? 0),
        productId: selectedId,
      });
      router.back();
      return;
    }

    if (isDraft) {
      setPendingAddStepProduct(selectedId);
      router.back();
      return;
    }

    if (!routine || !step) return;
    tagStepProduct(routine.id, step.id, selectedId);
    showToast('Product tagged');
    router.back();
  };

  const openAddProduct = () => {
    if (isGuided) {
      router.push({
        pathname: '/(tabs)/products/add',
        params: {
          returnTo: 'tag-product',
          guided: '1',
          stepIndex,
          stepName: resolvedStepName ?? '',
          selectedProductId: selectedId ?? '',
        },
      });
      return;
    }

    if (isDraft) {
      router.push({
        pathname: '/(tabs)/products/add',
        params: {
          returnTo: 'tag-product',
          draft: '1',
          routineId,
          stepName: resolvedStepName ?? '',
          selectedProductId: selectedId ?? '',
        },
      });
      return;
    }

    router.push({
      pathname: '/(tabs)/products/add',
      params: {
        returnTo: 'tag-product',
        routineId,
        stepId,
      },
    });
  };

  if (!isGuided && !isDraft && (!routine || !step)) {
    return (
      <View style={[styles.screen, styles.centered, { paddingTop: insets.top }]}>
        <SubPageHeader title="Tag a Product" onBack={() => router.back()} />
        <InlineEmptyCard
          title="Step not found"
          body="Go back and open product tagging from an existing step."
        />
        <FullWidthButton label="← Back" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <SubPageHeader title="Tag a Product" onBack={() => router.back()} />
      <ScrollView
        style={tabPageStyles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {resolvedStepName ? (
          <Text style={styles.stepLabel}>
            For step: <Text style={styles.stepName}>{resolvedStepName}</Text>
          </Text>
        ) : null}

        {products.length === 0 ? (
          <InlineEmptyCard
            compact
            title="No products saved yet"
            body="Add a product to your shelf first, then tag it to this step."
          />
        ) : (
          <>
            {suggested.length > 0 ? (
              <>
                <Text style={styles.sectionLabel}>Suggested</Text>
                {suggested.map((product) => (
                  <ProductPickRow
                    key={product.id}
                    product={product}
                    selected={selectedId === product.id}
                    onPress={() =>
                      setSelectedId((current) =>
                        current === product.id ? null : product.id,
                      )
                    }
                  />
                ))}
              </>
            ) : null}

            {rest.length > 0 ? (
              <>
                <Divider label="All Products" large outlined />
                {rest.map((product) => (
                  <ProductPickRow
                    key={product.id}
                    product={product}
                    selected={selectedId === product.id}
                    onPress={() =>
                      setSelectedId((current) =>
                        current === product.id ? null : product.id,
                      )
                    }
                  />
                ))}
              </>
            ) : null}
          </>
        )}

        <Pressable onPress={openAddProduct} style={styles.addLink}>
          <Text style={styles.addLinkText}>+ Add a new product</Text>
        </Pressable>

        <FullWidthButton
          label={selectedId ? 'Confirm Tag' : 'Save without product'}
          onPress={handleConfirm}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  centered: {
    paddingHorizontal: s(14),
  },
  content: {
    paddingHorizontal: s(12),
    paddingTop: s(10),
    paddingBottom: s(24),
  },
  stepLabel: {
    fontFamily: fonts.dmSans,
    fontSize: fs(10),
    color: colors.blue,
    marginBottom: s(10),
  },
  stepName: {
    color: colors.navy,
    fontFamily: fonts.dmSansSemiBold,
    fontWeight: '600',
  },
  sectionLabel: {
    fontFamily: fonts.dmSans,
    fontSize: tabPageTypography.sectionLabel,
    letterSpacing: s(2),
    textTransform: 'uppercase',
    color: colors.muted,
    marginBottom: s(8),
  },
  addLink: {
    marginTop: s(4),
    marginBottom: s(10),
    paddingVertical: vs(9),
    borderRadius: plannerCornerRadius,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#c8d9e6',
    alignItems: 'center',
  },
  addLinkText: {
    fontFamily: fonts.dmSans,
    fontSize: fs(10),
    color: colors.blue,
  },
});
