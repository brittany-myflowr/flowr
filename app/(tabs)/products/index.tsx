import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { InlineEmptyCard } from '@/components/feedback/InlineEmptyCard';
import { TabPageHeader } from '@/components/layout/TabPageHeader';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductSearchBar } from '@/components/products/ProductSearchBar';
import { FullWidthButton } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { tabPageStyles } from '@/constants/tabPageTypography';
import {
  filterProducts,
  getProductCategoryFilters,
  isProductCategoryFilter,
  type ProductCategoryFilter,
} from '@/lib/filterProducts';
import { getProductTagLinks } from '@/lib/productLinks';
import { useAppStore, useProducts } from '@/providers/AppStore';
import { s } from '@/lib/scale';

const categoryFilters = getProductCategoryFilters();
const scrollableCategoryFilters = categoryFilters.filter((category) => category !== 'All');

export default function ProductsScreen() {
  const router = useRouter();
  const { products } = useProducts();
  const { routines } = useAppStore();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<ProductCategoryFilter>('All');

  const filteredProducts = useMemo(
    () => filterProducts(products, query, filter),
    [products, query, filter],
  );

  const subtitle = useMemo(() => {
    if (products.length === 0) return '0 products saved';

    const hasActiveFilters = query.trim().length > 0 || filter !== 'All';
    if (hasActiveFilters) {
      return `${filteredProducts.length} of ${products.length} product${products.length === 1 ? '' : 's'}`;
    }

    return `${products.length} product${products.length === 1 ? '' : 's'}`;
  }, [filteredProducts.length, filter, products.length, query]);

  const handleFilterPress = (category: ProductCategoryFilter) => {
    if (!isProductCategoryFilter(category)) return;
    setFilter(category);
  };

  return (
    <View style={tabPageStyles.screen}>
      <TabPageHeader title="My Products" subtitle={subtitle} />

      {products.length > 0 ? (
        <>
          <ProductSearchBar value={query} onChangeText={setQuery} />
          <View style={styles.filtersRow}>
            <Chip
              label="All"
              selected={filter === 'All'}
              form
              onPress={() => handleFilterPress('All')}
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
                  selected={filter === category}
                  form
                  onPress={() => handleFilterPress(category)}
                />
              ))}
            </ScrollView>
          </View>
        </>
      ) : null}

      <ScrollView
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
              <FullWidthButton
                label="+ Add a Product"
                onPress={() => router.push('/(tabs)/products/add')}
              />
            </View>
          </InlineEmptyCard>
        ) : filteredProducts.length === 0 ? (
          <InlineEmptyCard
            title="No matches found"
            body="Try a different search term or category filter."
          />
        ) : (
          <>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                tagLinks={getProductTagLinks(routines, product.id)}
                onPress={() => router.push(`/(tabs)/products/${product.id}`)}
              />
            ))}
            <View style={styles.addButton}>
              <FullWidthButton
                label="+ Add a Product"
                onPress={() => router.push('/(tabs)/products/add')}
              />
            </View>
          </>
        )}
      </ScrollView>
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
