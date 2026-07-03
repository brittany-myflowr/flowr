import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { InlineEmptyCard } from '@/components/feedback/InlineEmptyCard';
import { FocusScrollView } from '@/components/layout/FocusScrollView';
import { TabPageHeader } from '@/components/layout/TabPageHeader';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductSearchBar } from '@/components/products/ProductSearchBar';
import { FullWidthButton } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Divider } from '@/components/ui/Divider';
import { tabPageStyles } from '@/constants/tabPageTypography';
import {
  filterProducts,
  getProductCategoryFilters,
  groupProductsByCategory,
  hasActiveProductFilters,
  isProductCategoryFilter,
  type ProductCategoryFilter,
} from '@/lib/filterProducts';
import { getProductTagLinks, getTaggedProductIds, type ProductTagLink } from '@/lib/productLinks';
import { useAppStore, useProducts } from '@/providers/AppStore';
import type { Product } from '@/types';
import { s } from '@/lib/scale';

const categoryFilters = getProductCategoryFilters();
const scrollableCategoryFilters = categoryFilters.filter((category) => category !== 'All');

export default function ProductsScreen() {
  const router = useRouter();
  const { products } = useProducts();
  const { routines } = useAppStore();
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ProductCategoryFilter>('All');

  const taggedProductIds = useMemo(() => getTaggedProductIds(routines), [routines]);

  const filteredProducts = useMemo(
    () => filterProducts(products, query, categoryFilter),
    [products, query, categoryFilter],
  );

  const hasActiveFilters = hasActiveProductFilters({
    query,
    categoryFilter,
  });

  const shouldGroupByCategory = !hasActiveFilters;

  const groupedProducts = useMemo(() => {
    if (!shouldGroupByCategory) return null;
    return groupProductsByCategory(filteredProducts);
  }, [filteredProducts, shouldGroupByCategory]);

  const subtitle = useMemo(() => {
    if (products.length === 0) return '0 products saved';

    const lovedCount = products.filter((product) => product.verdict === 'Love It').length;
    const inUseCount = products.filter((product) => taggedProductIds.has(product.id)).length;

    if (hasActiveFilters) {
      return `${filteredProducts.length} of ${products.length} product${products.length === 1 ? '' : 's'}`;
    }

    const parts = [`${products.length} product${products.length === 1 ? '' : 's'}`];
    if (lovedCount > 0) parts.push(`${lovedCount} loved`);
    if (inUseCount > 0) parts.push(`${inUseCount} in routines`);

    return parts.join(' · ');
  }, [filteredProducts.length, hasActiveFilters, products, taggedProductIds]);

  const openAddProduct = () => router.push('/(tabs)/products/add');

  const clearFilters = () => {
    setQuery('');
    setCategoryFilter('All');
  };

  const openProduct = (productId: string) => {
    router.push(`/(tabs)/products/${productId}`);
  };

  const openTagLink = (link: ProductTagLink) => {
    router.push({
      pathname: '/(tabs)/routines/step/[id]',
      params: { id: link.stepId, routineId: link.routineId },
    });
  };

  const renderProductCard = (product: Product) => (
    <ProductCard
      key={product.id}
      product={product}
      tagLinks={getProductTagLinks(routines, product.id)}
      onPress={() => openProduct(product.id)}
      onTagPress={openTagLink}
    />
  );

  const renderProductList = () => {
    if (shouldGroupByCategory && groupedProducts) {
      return groupedProducts.map((group) => (
        <View key={group.category}>
          <Divider label={group.category} large outlined />
          {group.products.map((product) => renderProductCard(product))}
        </View>
      ));
    }

    return filteredProducts.map((product) => renderProductCard(product));
  };

  return (
    <View style={tabPageStyles.screen}>
      <TabPageHeader
        title="My Products"
        subtitle={subtitle}
        actionLabel="+ Add"
        onActionPress={products.length > 0 ? openAddProduct : undefined}
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
        contentContainerStyle={tabPageStyles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {products.length === 0 ? (
          <InlineEmptyCard
            title="No products yet"
            body="Save products you love, like, or want to skip. Tag them to routine steps to keep track of what you use."
          >
            <View style={styles.emptyButton}>
              <FullWidthButton label="+ Add a Product" onPress={openAddProduct} />
            </View>
          </InlineEmptyCard>
        ) : filteredProducts.length === 0 ? (
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
        ) : (
          <>
            {renderProductList()}
            <View style={styles.addButton}>
              <FullWidthButton label="+ Add a Product" onPress={openAddProduct} />
            </View>
          </>
        )}
      </FocusScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
  emptyButton: {
    marginTop: s(14),
  },
  addButton: {
    marginTop: s(4),
  },
});
