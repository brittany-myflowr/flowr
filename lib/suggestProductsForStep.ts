import type { Product } from '@/types';

const STOP_WORDS = new Set(['a', 'an', 'the', 'and', 'or', 'for', 'with', 'to', 'of', 'my']);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s+]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length >= 2 && !STOP_WORDS.has(word));
}

function getMatchTerms(stepName: string): string[] {
  const normalized = stepName.trim().toLowerCase();
  const terms = new Set<string>([normalized]);

  for (const token of tokenize(stepName)) {
    terms.add(token);
  }

  const words = normalized.split(/\s+/).filter(Boolean);
  for (let index = 0; index < words.length - 1; index += 1) {
    terms.add(`${words[index]} ${words[index + 1]}`);
  }

  return [...terms].sort((a, b) => b.length - a.length);
}

function scoreProductMatch(stepName: string, product: Product): number {
  const terms = getMatchTerms(stepName);
  if (terms.length === 0) return 0;

  const haystack = [product.name, product.brand, product.notes ?? ''].join(' ').toLowerCase();
  let score = 0;

  for (const term of terms) {
    if (haystack.includes(term)) {
      score += term.includes(' ') ? 3 : 1;
    }
  }

  return score;
}

export function suggestProductsForStep(
  stepName: string,
  products: Product[],
): { suggested: Product[]; rest: Product[] } {
  const scored = products
    .map((product) => ({ product, score: scoreProductMatch(stepName, product) }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score);

  const suggested = scored.map(({ product }) => product);
  const suggestedIds = new Set(suggested.map((product) => product.id));
  const rest = products.filter((product) => !suggestedIds.has(product.id));

  return { suggested, rest };
}
