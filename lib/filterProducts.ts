import type { Category } from '@/constants/categories';
import type { Product } from '@/types';

export function filterProducts(
  products: Product[],
  query: string,
  categoryFilter: Category | 'All',
): Product[] {
  const normalized = query.trim().toLowerCase();

  return products.filter((product) => {
    if (categoryFilter !== 'All' && product.category !== categoryFilter) {
      return false;
    }

    if (!normalized) return true;

    const haystack = [
      product.name,
      product.brand,
      product.category,
      product.verdict,
      product.notes ?? '',
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalized);
  });
}

export function getProductCategoryFilters(products: Product[]): Array<Category | 'All'> {
  const used = new Set(products.map((product) => product.category));
  const ordered: Array<Category | 'All'> = ['All'];

  for (const category of ['Skincare', 'Body Care', 'Hair Care', 'Nail Care', 'Supplements'] as Category[]) {
    if (used.has(category)) {
      ordered.push(category);
    }
  }

  for (const product of products) {
    if (!ordered.includes(product.category)) {
      ordered.push(product.category);
    }
  }

  return ordered;
}
