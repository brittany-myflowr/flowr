import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CheckIcon } from '@/components/icons/ActionIcons';
import { VerdictHeartIcon } from '@/components/icons/VerdictHeartIcon';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
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
  onPress?: () => void;
};

export function ProductCard({ product, tagLinks = [], onPress }: ProductCardProps) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.verdictIcon} pointerEvents="none">
        <VerdictHeartIcon verdict={product.verdict} size={s(20)} />
      </View>

      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.brand}>{product.brand}</Text>

      <Text style={styles.category}>{product.category}</Text>

      {tagLinks.length > 0 ? (
        <Text style={styles.tagLine}>
          {tagLinks.map((link, index) => (
            <Text key={`${link.routineName}-${link.stepName}-${index}`}>
              {index > 0 ? ', ' : null}
              <Text style={styles.routineName}>{link.routineName}</Text>
              <Text style={styles.tagSeparator}> · </Text>
              <Text style={styles.stepName}>{link.stepName}</Text>
            </Text>
          ))}
        </Text>
      ) : null}

      {product.notes ? (
        <View style={styles.notesBox}>
          <Text style={styles.notes}>{product.notes}</Text>
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
      {selected ? <CheckIcon size={s(14)} color={colors.blue} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    backgroundColor: colors.white,
    borderRadius: s(10),
    paddingHorizontal: s(12),
    paddingVertical: vs(10),
    paddingRight: s(36),
    marginBottom: s(6),
    borderWidth: 1,
    borderColor: colors.border,
  },
  verdictIcon: {
    position: 'absolute',
    top: vs(10),
    right: s(12),
  },
  name: {
    fontFamily: fonts.cardTitle,
    fontSize: fs(13),
    color: colors.navy,
  },
  brand: {
    marginTop: s(4),
    fontFamily: fonts.dmSans,
    fontSize: fs(11),
    color: colors.muted,
  },
  category: {
    marginTop: s(3),
    fontFamily: fonts.dmSans,
    fontSize: fs(8),
    letterSpacing: s(1),
    textTransform: 'uppercase',
    color: colors.muted,
  },
  tagLine: {
    marginTop: s(4),
    fontFamily: fonts.dmSans,
    fontSize: fs(9),
    lineHeight: fs(13),
  },
  routineName: {
    color: colors.blue,
  },
  tagSeparator: {
    color: colors.muted,
  },
  stepName: {
    color: colors.muted,
  },
  notesBox: {
    marginTop: s(4),
    backgroundColor: colors.inputBg,
    borderRadius: s(6),
    paddingHorizontal: s(7),
    paddingVertical: vs(4),
  },
  notes: {
    fontFamily: fonts.dmSans,
    fontSize: fs(9),
    color: colors.gray,
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
