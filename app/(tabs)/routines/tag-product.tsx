import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { InlineEmptyCard } from '@/components/feedback/InlineEmptyCard';
import { FocusScrollView } from '@/components/layout/FocusScrollView';
import { SubPageHeader } from '@/components/layout/SubPageHeader';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductSearchBar } from '@/components/products/ProductSearchBar';
import { FullWidthButton } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Divider } from '@/components/ui/Divider';
import { colors } from '@/constants/colors';
import { plannerCardBorder } from '@/constants/plannerCardStyles';
import { tabPageStyles, tabPageTypography } from '@/constants/tabPageTypography';
import { fonts } from '@/constants/typography';
import {
  filterProducts,
  getProductCategoryFilters,
  groupProductsByCategory,
  hasActiveProductFilters,
  isProductCategoryFilter,
  type ProductCategoryFilter,
} from '@/lib/filterProducts';
import { getProductTagLinks } from '@/lib/productLinks';
import { suggestProductsForStep } from '@/lib/suggestProductsForStep';
import { useAppStore, useProducts, useRoutine, useRoutines } from '@/providers/AppStore';
import { useToast } from '@/providers/ToastProvider';
import type { Product } from '@/types';
import { s, fs } from '@/lib/scale';

const categoryFilters = getProductCategoryFilters();
const scrollableCategoryFilters = categoryFilters.filter((category) => category !== 'All');

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
  const { routines } = useAppStore();
  const {
    tagStepProduct,
    setPendingGuidedStepProductResult,
    setPendingAddStepProduct,
    consumePendingTagProductSelection,
  } = useRoutines();
  const { showToast } = useToast();

  const step = routine?.steps.find((item) => item.id === stepId);
  const resolvedStepName = isGuided || isDraft ? stepName : step?.name;

  const [selectedId, setSelectedId] = useState<string | null>(
    selectedProductId ?? step?.productId ?? null,
  );
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ProductCategoryFilter>('All');

  useEffect(() => {
    if (selectedProductId) {
      setSelectedId(selectedProductId);
    }
  }, [selectedProductId]);

  useFocusEffect(
    useCallback(() => {
      const pendingSelection = consumePendingTagProductSelection();
      if (pendingSelection !== undefined) {
        setSelectedId(pendingSelection);
      }
    }, [consumePendingTagProductSelection]),
  );

  const filteredProducts = useMemo(
    () => filterProducts(products, query, categoryFilter),
    [products, query, categoryFilter],
  );

  const hasActiveFilters = hasActiveProductFilters({ query, categoryFilter });

  const { suggested, rest } = useMemo(() => {
    if (!resolvedStepName || hasActiveFilters) {
      return { suggested: [] as Product[], rest: filteredProducts };
    }

    return suggestProductsForStep(resolvedStepName, filteredProducts);
  }, [filteredProducts, hasActiveFilters, resolvedStepName]);

  const groupedRest = useMemo(() => {
    if (hasActiveFilters || suggested.length > 0) return null;
    return groupProductsByCategory(rest);
  }, [hasActiveFilters, rest, suggested.length]);

  const headerSubtitle = useMemo(() => {
    const parts: string[] = [];
    if (resolvedStepName) parts.push(resolvedStepName);
    if (products.length > 0) {
      parts.push(
        hasActiveFilters
          ? `${filteredProducts.length} of ${products.length} products`
          : `${products.length} product${products.length === 1 ? '' : 's'}`,
      );
    }
    return parts.join(' · ');
  }, [filteredProducts.length, hasActiveFilters, products.length, resolvedStepName]);

  const handleBack = () => {
    router.back();
  };

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
    router.push('/(tabs)/routines/add-product');
  };

  const toggleProduct = (productId: string) => {
    setSelectedId((current) => (current === productId ? null : productId));
  };

  const clearFilters = () => {
    setQuery('');
    setCategoryFilter('All');
  };

  const renderProductCard = (product: Product) => (
    <ProductCard
      key={product.id}
      product={product}
      tagLinks={getProductTagLinks(routines, product.id)}
      selected={selectedId === product.id}
      onPress={() => toggleProduct(product.id)}
    />
  );

  const renderProductList = () => {
    if (filteredProducts.length === 0) {
      return (
        <InlineEmptyCard
          title="No matches found"
          body="Try a different search term or filter."
        >
          {hasActiveFilters ? (
            <View style={styles.emptyButton}>
              <FullWidthButton label="Clear filters" onPress={clearFilters} />
            </View>
          ) : null}
        </InlineEmptyCard>
      );
    }

    if (suggested.length > 0) {
      return (
        <>
          <Text style={styles.sectionLabel}>Suggested</Text>
          {suggested.map(renderProductCard)}
          {rest.length > 0 ? (
            <>
              <Divider label="All Products" large outlined />
              {rest.map(renderProductCard)}
            </>
          ) : null}
        </>
      );
    }

    if (groupedRest) {
      return groupedRest.map((group) => (
        <View key={group.category}>
          <Divider label={group.category} large outlined />
          {group.products.map(renderProductCard)}
        </View>
      ));
    }

    return filteredProducts.map(renderProductCard);
  };

  if (!isGuided && !isDraft && (!routine || !step)) {
    return (
      <View style={[styles.screen, styles.centered, { paddingTop: insets.top }]}>
        <SubPageHeader title="Tag a Product" onBack={handleBack} />
        <InlineEmptyCard
          title="Step not found"
          body="Go back and open product tagging from an existing step."
        />
        <FullWidthButton label="← Back" onPress={handleBack} />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <SubPageHeader
        title="Tag a Product"
        subtitle={headerSubtitle || undefined}
        onBack={handleBack}
        actionLabel="+ Add"
        onActionPress={openAddProduct}
      />

      {products.length > 0 ? (
        <>
          <ProductSearchBar value={query} onChangeText={setQuery} />
          <View style={styles.filtersRow}>
            <Chip
              label="All"
              selected={categoryFilter === 'All'}
              form
              onPress={() => setCategoryFilter('All')}
            />
            <ScrollView
              horizontal
              nestedScrollEnabled
              showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              style={styles.categoryScroll}
              contentContainerStyle={styles.categoryScrollContent}
            >
              {scrollableCategoryFilters.map((category) => (
                <Chip
                  key={category}
                  label={category}
                  selected={categoryFilter === category}
                  form
                  onPress={() => {
                    if (isProductCategoryFilter(category)) setCategoryFilter(category);
                  }}
                />
              ))}
            </ScrollView>
          </View>
        </>
      ) : null}

      <FocusScrollView
        style={tabPageStyles.scroll}
        contentContainerStyle={[
          tabPageStyles.content,
          { paddingBottom: s(12) + insets.bottom + s(72) },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {products.length === 0 ? (
          <InlineEmptyCard
            title="No products saved yet"
            body="Add a product to your shelf first, then tag it to this step."
          >
            <View style={styles.emptyButton}>
              <FullWidthButton label="+ Add a Product" onPress={openAddProduct} />
            </View>
          </InlineEmptyCard>
        ) : (
          renderProductList()
        )}
      </FocusScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, s(12)) }]}>
        <FullWidthButton
          label={selectedId ? 'Confirm Tag' : 'Save without product'}
          onPress={handleConfirm}
        />
      </View>
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
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: s(10),
    paddingBottom: s(6),
    gap: s(6),
  },
  categoryScroll: {
    flex: 1,
  },
  categoryScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(6),
    paddingRight: s(10),
  },
  sectionLabel: {
    fontFamily: fonts.dmSans,
    fontSize: tabPageTypography.sectionLabel,
    letterSpacing: s(2),
    textTransform: 'uppercase',
    color: colors.muted,
    marginBottom: s(8),
  },
  emptyButton: {
    marginTop: s(14),
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: s(12),
    paddingTop: s(10),
    borderTopWidth: 1,
    borderTopColor: plannerCardBorder,
    backgroundColor: colors.bg,
  },
});
