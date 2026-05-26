import { categories, type Category } from '@/constants/categories';
import type { Product } from '@/types';

export type ProductCategoryFilter = Category | 'All';

type ProductLike = Product & { cat?: string };

export function resolveProductCategory(product: ProductLike): Category {
  const raw = product.category ?? product.cat;
  if (raw && categories.includes(raw as Category)) {
    return raw as Category;
  }
  return 'Other';
}

export function isProductCategoryFilter(value: string): value is ProductCategoryFilter {
  return value === 'All' || categories.includes(value as Category);
}

export function filterProducts(
  products: Product[],
  query: string,
  categoryFilter: ProductCategoryFilter,
): Product[] {
  const normalized = query.trim().toLowerCase();

  return products.filter((product) => {
    const category = resolveProductCategory(product);

    if (categoryFilter !== 'All' && category !== categoryFilter) {
      return false;
    }

    if (!normalized) return true;

    const haystack = [
      product.name,
      product.brand,
      category,
      product.verdict,
      product.notes ?? '',
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalized);
  });
}

export function getProductCategoryFilters(): ProductCategoryFilter[] {
  return ['All', ...categories];
}
