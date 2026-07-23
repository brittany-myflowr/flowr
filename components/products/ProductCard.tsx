import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CheckIcon } from '@/components/icons/ActionIcons';
import {
  getVerdictHeartColor,
  VerdictHeartIcon,
} from '@/components/icons/VerdictHeartIcon';
import { categoryColors } from '@/constants/categories';
import { colors } from '@/constants/colors';
import { plannerCard } from '@/constants/plannerCardStyles';
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

type ProductCardProps = {
  product: Product;
  tagLinks?: ProductTagLink[];
  selected?: boolean;
  onPress?: () => void;
  onTagPress?: (link: ProductTagLink) => void;
};

export function ProductCard({
  product,
  tagLinks = [],
  selected = false,
  onPress,
  onTagPress,
}: ProductCardProps) {
  const category = resolveProductCategory(product);
  const categoryColor = categoryColors[category];
  const accessibilityLabel = `${product.name}, ${product.brand}, ${category}, ${product.verdict}${
    selected ? ', selected' : ''
  }`;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        plannerCard(categoryColor),
        selected && styles.cardSelected,
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleBlock}>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.brand}>{product.brand}</Text>
        </View>
        <View style={styles.headerActions}>
          {selected ? <CheckIcon size={s(14)} color={colors.blue} /> : null}
          <View
            style={styles.verdictIconWrap}
            accessibilityLabel={product.verdict}
            importantForAccessibility="yes"
          >
            <VerdictHeartIcon
              verdict={product.verdict}
              size={s(18)}
              color={getVerdictHeartColor(product.verdict)}
            />
          </View>
        </View>
      </View>

      {tagLinks.length > 0 ? (
        <View style={styles.tagRow}>
          {tagLinks.map((link) =>
            onTagPress ? (
              <Pressable
                key={`${link.routineId}-${link.stepId}`}
                onPress={() => onTagPress(link)}
                style={styles.tagChip}
                accessibilityRole="button"
                accessibilityLabel={`Open ${link.stepName} in ${link.routineName}`}
              >
                <Text style={styles.tagRoutine}>{link.routineName}</Text>
                <Text style={styles.tagSeparator}> · </Text>
                <Text style={styles.tagStep}>{link.stepName}</Text>
              </Pressable>
            ) : (
              <View
                key={`${link.routineId}-${link.stepId}`}
                style={styles.tagChip}
                accessibilityLabel={`Tagged to ${link.stepName} in ${link.routineName}`}
              >
                <Text style={styles.tagRoutine}>{link.routineName}</Text>
                <Text style={styles.tagSeparator}> · </Text>
                <Text style={styles.tagStep}>{link.stepName}</Text>
              </View>
            ),
          )}
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
    paddingHorizontal: s(12),
    paddingVertical: vs(11),
    marginBottom: s(6),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: s(8),
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: s(6),
    flexShrink: 0,
  },
  cardSelected: {
    backgroundColor: colors.light,
    borderColor: '#c8d9e6',
  },
  verdictIconWrap: {
    flexShrink: 0,
    paddingTop: s(1),
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
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: s(6),
    marginTop: s(8),
  },
  tagChip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    maxWidth: '100%',
  },
  tagRoutine: {
    fontFamily: fonts.dmSansSemiBold,
    fontSize: fs(12),
    color: colors.navy,
    fontWeight: '600',
  },
  tagSeparator: {
    fontFamily: fonts.dmSans,
    fontSize: fs(12),
    color: colors.muted,
  },
  tagStep: {
    fontFamily: fonts.dmSans,
    fontSize: fs(12),
    color: colors.gray,
    flexShrink: 1,
  },
  untaggedHint: {
    marginTop: s(8),
    fontFamily: fonts.dmSans,
    fontSize: fs(12),
    color: colors.muted,
    fontStyle: 'italic',
  },
  notes: {
    marginTop: s(8),
    fontFamily: fonts.dmSans,
    fontSize: fs(12),
    color: colors.gray,
    lineHeight: fs(17),
  },
  pickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(11),
    paddingVertical: vs(9),
    marginBottom: s(5),
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
    fontSize: fs(13),
    color: colors.navy,
  },
  pickVerdict: {
    marginTop: s(1),
    fontFamily: fonts.dmSans,
    fontSize: fs(12),
    fontWeight: '500',
  },
});
