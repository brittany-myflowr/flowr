import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProductCard } from '@/components/products/ProductCard';
import { ProductSearchBar } from '@/components/products/ProductSearchBar';
import { FullWidthButton } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import type { Category } from '@/constants/categories';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { filterProducts, getProductCategoryFilters } from '@/lib/filterProducts';
import { getLinkedStepNames } from '@/lib/productLinks';
import { useAppStore, useProducts } from '@/providers/AppStore';
import { s, fs } from '@/lib/scale';

export default function ProductsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { products } = useProducts();
  const { routines } = useAppStore();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Category | 'All'>('All');

  const categoryFilters = useMemo(() => getProductCategoryFilters(products), [products]);
  const activeFilter = categoryFilters.includes(filter) ? filter : 'All';

  const filteredProducts = useMemo(
    () => filterProducts(products, query, activeFilter),
    [products, query, activeFilter],
  );

  const subtitle = useMemo(() => {
    if (products.length === 0) return '0 products saved';

    const hasActiveFilters = query.trim().length > 0 || activeFilter !== 'All';
    if (hasActiveFilters) {
      return `${filteredProducts.length} of ${products.length} product${products.length === 1 ? '' : 's'}`;
    }

    return `${products.length} product${products.length === 1 ? '' : 's'}`;
  }, [filteredProducts.length, activeFilter, products.length, query]);

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: s(18) + insets.top }]}>
        <Text style={styles.title}>My Products</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      {products.length > 0 ? (
        <>
          <ProductSearchBar value={query} onChangeText={setQuery} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filters}
          >
            {categoryFilters.map((category) => (
              <Chip
                key={category}
                label={category}
                selected={activeFilter === category}
                small
                onPress={() => setFilter(category)}
              />
            ))}
          </ScrollView>
        </>
      ) : null}

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {products.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No products yet</Text>
            <Text style={styles.emptyBody}>
              Save products you love, like, or want to skip. Tag them to routine steps to
              keep track of what you use.
            </Text>
            <View style={styles.emptyButton}>
              <FullWidthButton
                label="+ Add a Product"
                onPress={() => router.push('/(tabs)/products/add')}
              />
            </View>
          </View>
        ) : filteredProducts.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No matches found</Text>
            <Text style={styles.emptyBody}>
              Try a different search term or category filter.
            </Text>
          </View>
        ) : (
          <>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                linkedStepNames={getLinkedStepNames(routines, product.id)}
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
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: s(14),
    paddingBottom: s(6),
  },
  title: {
    fontFamily: fonts.lora,
    fontSize: fs(20),
    color: colors.navy,
  },
  subtitle: {
    marginTop: s(1),
    fontFamily: fonts.dmSans,
    fontSize: fs(10),
    color: colors.blue,
  },
  filters: {
    paddingHorizontal: s(10),
    paddingBottom: s(6),
    gap: s(4),
  },
  content: {
    paddingHorizontal: s(10),
    paddingBottom: s(24),
  },
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: s(12),
    borderWidth: 1,
    borderColor: colors.border,
    padding: s(16),
    marginHorizontal: s(4),
  },
  emptyTitle: {
    fontFamily: fonts.lora,
    fontSize: fs(16),
    color: colors.navy,
    marginBottom: s(6),
  },
  emptyBody: {
    fontFamily: fonts.dmSans,
    fontSize: fs(11),
    color: colors.gray,
    lineHeight: fs(18),
  },
  emptyButton: {
    marginTop: s(14),
  },
  addButton: {
    marginTop: s(4),
  },
});
