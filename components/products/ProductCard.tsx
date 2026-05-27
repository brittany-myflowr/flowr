import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CheckIcon } from '@/components/icons/ActionIcons';
import {
  getVerdictHeartColor,
  VerdictHeartIcon,
} from '@/components/icons/VerdictHeartIcon';
import { categoryColors, type Category } from '@/constants/categories';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { resolveProductCategory } from '@/lib/filterProducts';
import type { ProductTagLink } from '@/lib/productLinks';
import type { Product, Verdict } from '@/types';
import { s, vs, fs } from '@/lib/scale';

export const verdictColors: Record<Verdict, string> = {
  'Love It': colors.blue,
  'Like It': colors.muted,
  'Not For Me': colors.dangerLight,
};

const verdictBackgrounds: Record<Verdict, string> = {
  'Love It': colors.light,
  'Like It': colors.inputBg,
  'Not For Me': colors.dangerBg,
};

type ProductCardProps = {
  product: Product;
  tagLinks?: ProductTagLink[];
  onPress?: () => void;
  onTagPress?: (link: ProductTagLink) => void;
};

function VerdictChip({ verdict }: { verdict: Verdict }) {
  return (
    <View style={[styles.verdictChip, { backgroundColor: verdictBackgrounds[verdict] }]}>
      <VerdictHeartIcon verdict={verdict} size={s(11)} color={getVerdictHeartColor(verdict)} />
      <Text style={[styles.verdictChipText, { color: verdictColors[verdict] }]}>{verdict}</Text>
    </View>
  );
}

function CategoryChip({ category }: { category: Category }) {
  const color = categoryColors[category];

  return (
    <View style={[styles.categoryChip, { backgroundColor: `${color}28`, borderColor: color }]}>
      <Text style={[styles.categoryChipText, { color }]}>{category}</Text>
    </View>
  );
}

export function ProductCard({
  product,
  tagLinks = [],
  onPress,
  onTagPress,
}: ProductCardProps) {
  const category = resolveProductCategory(product);
  const accessibilityLabel = `${product.name}, ${product.brand}, ${product.verdict}`;

  return (
    <Pressable
      onPress={onPress}
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.brand}>{product.brand}</Text>

      <View style={styles.chipRow}>
        <VerdictChip verdict={product.verdict} />
        <CategoryChip category={category} />
      </View>

      {tagLinks.length > 0 ? (
        <View style={styles.tagRow}>
          {tagLinks.map((link) => (
            <Pressable
              key={`${link.routineId}-${link.stepId}`}
              onPress={() => onTagPress?.(link)}
              style={styles.tagChip}
              accessibilityRole="button"
              accessibilityLabel={`Open ${link.stepName} in ${link.routineName}`}
            >
              <Text style={styles.tagRoutine}>{link.routineName}</Text>
              <Text style={styles.tagSeparator}> · </Text>
              <Text style={styles.tagStep}>{link.stepName}</Text>
            </Pressable>
          ))}
        </View>
      ) : (
        <Text style={styles.untaggedHint}>Not tagged to a routine step yet</Text>
      )}

      {product.notes ? (
        <Text style={styles.notes} numberOfLines={1} ellipsizeMode="tail">
          {product.notes}
        </Text>
      ) : null}
    </Pressable>
  );
}

type ProductPickRowProps = {
  product: Product;
  selected?: boolean;
  onPress?: () => void;
};

export function ProductPickRow({ product, selected = false, onPress }: ProductPickRowProps) {
  return (
    <Pressable onPress={onPress} style={[styles.pickRow, selected && styles.pickRowSelected]}>
      <View style={styles.pickCopy}>
        <Text style={styles.pickName}>{product.name}</Text>
        <Text style={[styles.pickVerdict, { color: verdictColors[product.verdict] }]}>
          {product.verdict}
        </Text>
      </View>
      {selected ? <CheckIcon size={s(14)} color={colors.blue} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: s(10),
    paddingHorizontal: s(12),
    paddingVertical: vs(11),
    marginBottom: s(6),
    borderWidth: 1,
    borderColor: colors.border,
  },
  name: {
    fontFamily: fonts.cardTitle,
    fontSize: fs(13),
    color: colors.navy,
  },
  brand: {
    marginTop: s(2),
    fontFamily: fonts.dmSans,
    fontSize: fs(11),
    color: colors.muted,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: s(5),
    marginTop: s(8),
  },
  verdictChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(4),
    borderRadius: s(8),
    paddingHorizontal: s(7),
    paddingVertical: vs(3),
  },
  verdictChipText: {
    fontFamily: fonts.dmSansSemiBold,
    fontSize: fs(9),
    fontWeight: '600',
  },
  categoryChip: {
    borderRadius: s(8),
    borderWidth: 1,
    paddingHorizontal: s(7),
    paddingVertical: vs(3),
  },
  categoryChipText: {
    fontFamily: fonts.dmSans,
    fontSize: fs(9),
    letterSpacing: s(0.4),
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: s(5),
    marginTop: s(8),
  },
  tagChip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    backgroundColor: colors.light,
    borderWidth: 1,
    borderColor: '#c8d9e6',
    borderRadius: s(8),
    paddingHorizontal: s(8),
    paddingVertical: vs(4),
    maxWidth: '100%',
  },
  tagRoutine: {
    fontFamily: fonts.dmSansSemiBold,
    fontSize: fs(9),
    color: colors.blue,
    fontWeight: '600',
  },
  tagSeparator: {
    fontFamily: fonts.dmSans,
    fontSize: fs(9),
    color: colors.muted,
  },
  tagStep: {
    fontFamily: fonts.dmSans,
    fontSize: fs(9),
    color: colors.gray,
    flexShrink: 1,
  },
  untaggedHint: {
    marginTop: s(8),
    fontFamily: fonts.dmSans,
    fontSize: fs(9),
    color: colors.muted,
    fontStyle: 'italic',
  },
  notes: {
    marginTop: s(8),
    fontFamily: fonts.dmSans,
    fontSize: fs(10),
    color: colors.gray,
    lineHeight: fs(14),
  },
  pickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: s(10),
    paddingHorizontal: s(11),
    paddingVertical: vs(9),
    marginBottom: s(5),
    borderWidth: 1,
    borderColor: colors.border,
  },
  pickRowSelected: {
    backgroundColor: colors.light,
    borderColor: '#c8d9e6',
  },
  pickCopy: {
    flex: 1,
  },
  pickName: {
    fontFamily: fonts.cardTitle,
    fontSize: fs(12),
    color: colors.navy,
  },
  pickVerdict: {
    marginTop: s(1),
    fontFamily: fonts.dmSans,
    fontSize: fs(9),
    fontWeight: '500',
  },
});
