import type { Product } from '@/types';

/** Display label for a product tagged to a routine step — brand first, then product name. */
export function formatTaggedProductLabel(product: Pick<Product, 'brand' | 'name'>): string {
  const brand = product.brand.trim();
  const name = product.name.trim();

  if (brand && name) return `${brand} · ${name}`;
  return brand || name;
}
