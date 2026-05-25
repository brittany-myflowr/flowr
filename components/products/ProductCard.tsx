import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CheckIcon } from '@/components/icons/ActionIcons';
import { Badge } from '@/components/ui/Badge';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import type { Product, Verdict } from '@/types';

export const verdictColors: Record<Verdict, string> = {
  'Love It': colors.blue,
  'Like It': colors.muted,
  'Not For Me': colors.dangerLight,
};

type ProductCardProps = {
  product: Product;
  linkedStepNames?: string[];
  onPress?: () => void;
};

export function ProductCard({ product, linkedStepNames = [], onPress }: ProductCardProps) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.brand}>{product.brand}</Text>

      <View style={styles.metaRow}>
        <Text style={styles.category}>{product.category}</Text>
        <Text style={styles.dot}>·</Text>
        <Text style={[styles.verdict, { color: verdictColors[product.verdict] }]}>
          {product.verdict}
        </Text>
      </View>

      {product.notes ? (
        <View style={styles.notesBox}>
          <Text style={styles.notes}>{product.notes}</Text>
        </View>
      ) : null}

      {linkedStepNames.length > 0 ? (
        <View style={styles.linkedSteps}>
          {linkedStepNames.map((stepName) => (
            <Badge
              key={stepName}
              label={stepName}
              color={colors.blue}
              backgroundColor={colors.light}
            />
          ))}
        </View>
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
      {selected ? <CheckIcon size={14} color={colors.blue} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  name: {
    fontFamily: fonts.lora,
    fontSize: 13,
    color: colors.navy,
  },
  brand: {
    marginTop: 1,
    fontFamily: fonts.dmSans,
    fontSize: 9,
    color: colors.muted,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 3,
  },
  category: {
    fontFamily: fonts.dmSans,
    fontSize: 8,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.muted,
  },
  dot: {
    color: colors.border,
    fontSize: 8,
  },
  verdict: {
    fontFamily: fonts.dmSans,
    fontSize: 9,
    fontWeight: '500',
  },
  notesBox: {
    marginTop: 4,
    backgroundColor: colors.inputBg,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  notes: {
    fontFamily: fonts.dmSans,
    fontSize: 9,
    color: colors.gray,
  },
  linkedSteps: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 5,
  },
  pickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 9,
    marginBottom: 5,
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
    fontFamily: fonts.lora,
    fontSize: 12,
    color: colors.navy,
  },
  pickVerdict: {
    marginTop: 1,
    fontFamily: fonts.dmSans,
    fontSize: 9,
    fontWeight: '500',
  },
});
