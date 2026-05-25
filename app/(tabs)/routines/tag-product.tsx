import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SubPageHeader } from '@/components/layout/SubPageHeader';
import { ProductPickRow } from '@/components/products/ProductCard';
import { FullWidthButton } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { useProducts, useRoutine, useRoutines } from '@/providers/AppStore';
import { useToast } from '@/providers/ToastProvider';
import { suggestProductsForStep } from '@/lib/suggestProductsForStep';

export default function TagProductScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { routineId, stepId, selectedProductId } = useLocalSearchParams<{
    routineId: string;
    stepId: string;
    selectedProductId?: string;
  }>();
  const routine = useRoutine(routineId);
  const { products } = useProducts();
  const { tagStepProduct } = useRoutines();
  const { showToast } = useToast();

  const step = routine?.steps.find((item) => item.id === stepId);

  const [selectedId, setSelectedId] = useState<string | null>(step?.productId ?? null);

  useEffect(() => {
    if (selectedProductId) {
      setSelectedId(selectedProductId);
    }
  }, [selectedProductId]);

  const { suggested, rest } = useMemo(() => {
    if (!step) {
      return { suggested: [], rest: products };
    }

    return suggestProductsForStep(step.name, products);
  }, [products, step]);

  const handleConfirm = () => {
    if (!routine || !step) return;
    tagStepProduct(routine.id, step.id, selectedId);
    showToast('Product tagged');
    router.back();
  };

  const openAddProduct = () => {
    router.push({
      pathname: '/(tabs)/products/add',
      params: {
        returnTo: 'tag-product',
        routineId,
        stepId,
      },
    });
  };

  if (!routine || !step) {
    return (
      <View style={[styles.screen, styles.centered, { paddingTop: insets.top }]}>
        <SubPageHeader title="Tag a Product" onBack={() => router.back()} />
        <FullWidthButton label="← Back" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <SubPageHeader title="Tag a Product" onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.stepLabel}>
          For step: <Text style={styles.stepName}>{step.name}</Text>
        </Text>

        {products.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No products saved yet</Text>
            <Text style={styles.emptyBody}>
              Add a product to your shelf first, then tag it to this step.
            </Text>
          </View>
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
                <Divider label="All Products" />
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

        {selectedId ? (
          <FullWidthButton label="Confirm Tag" onPress={handleConfirm} />
        ) : null}
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
    paddingHorizontal: 14,
  },
  content: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 24,
  },
  stepLabel: {
    fontFamily: fonts.dmSans,
    fontSize: 10,
    color: colors.blue,
    marginBottom: 10,
  },
  stepName: {
    color: colors.navy,
    fontFamily: fonts.dmSansSemiBold,
    fontWeight: '600',
  },
  sectionLabel: {
    fontFamily: fonts.dmSans,
    fontSize: 8,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.muted,
    marginBottom: 8,
  },
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 10,
  },
  emptyTitle: {
    fontFamily: fonts.lora,
    fontSize: 14,
    color: colors.navy,
    marginBottom: 4,
  },
  emptyBody: {
    fontFamily: fonts.dmSans,
    fontSize: 11,
    color: colors.gray,
    lineHeight: 17,
  },
  addLink: {
    marginTop: 4,
    marginBottom: 10,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#c8d9e6',
    alignItems: 'center',
  },
  addLinkText: {
    fontFamily: fonts.dmSans,
    fontSize: 10,
    color: colors.blue,
  },
});
