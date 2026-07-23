import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Daisy } from '@/components/brand';
import { ChevronRightIcon } from '@/components/icons/ProfileIcons';
import { colors } from '@/constants/colors';
import { plannerCard, plannerCornerRadius } from '@/constants/plannerCardStyles';
import { fonts } from '@/constants/typography';
import { s, vs, fs } from '@/lib/scale';

type ProfileMenuRowProps = {
  label: string;
  icon: React.ReactNode;
  onPress?: () => void;
  danger?: boolean;
  trailing?: string;
  showChevron?: boolean;
};

export function ProfileMenuRow({
  label,
  icon,
  onPress,
  danger = false,
  trailing,
  showChevron = true,
}: ProfileMenuRowProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.row, plannerCard(), danger && styles.rowDanger]}
    >
      <View style={styles.iconWrap}>{icon}</View>
      <Text style={[styles.label, danger && styles.labelDanger]}>{label}</Text>
      {trailing ? <Text style={styles.trailing}>{trailing}</Text> : null}
      {!danger && showChevron ? <ChevronRightIcon /> : null}
    </Pressable>
  );
}

type ProfileUserCardProps = {
  firstName: string;
  email: string;
  flowerColor: string;
  onEdit?: () => void;
};

export function ProfileUserCard({
  firstName,
  email,
  flowerColor,
  onEdit,
}: ProfileUserCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.flowerWrap}>
        <Daisy color={flowerColor} size={s(24)} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.name}>{firstName}</Text>
        <Text style={styles.email}>{email}</Text>
      </View>
      <Pressable
        onPress={onEdit}
        style={styles.editButton}
        accessibilityRole="button"
        accessibilityLabel="Edit profile"
      >
        <Text style={styles.editLabel}>Edit</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(10),
    paddingHorizontal: s(12),
    paddingVertical: vs(10),
    marginBottom: s(5),
  },
  rowDanger: {
    borderColor: colors.dangerLight,
  },
  iconWrap: {
    flexShrink: 0,
  },
  label: {
    flex: 1,
    fontFamily: fonts.dmSans,
    fontSize: fs(11),
    color: colors.navy,
  },
  labelDanger: {
    color: colors.danger,
  },
  trailing: {
    fontFamily: fonts.dmSans,
    fontSize: fs(9),
    color: colors.dangerLight,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(12),
    padding: s(14),
    marginBottom: s(10),
  },
  flowerWrap: {
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
  },
  name: {
    fontFamily: fonts.cardTitle,
    fontSize: fs(15),
    color: colors.navy,
  },
  email: {
    marginTop: s(1),
    fontFamily: fonts.dmSans,
    fontSize: fs(12),
    color: colors.blue,
  },
  editButton: {
    backgroundColor: colors.navy,
    borderRadius: plannerCornerRadius,
    paddingHorizontal: s(10),
    paddingVertical: s(6),
  },
  editLabel: {
    fontFamily: fonts.dmSansSemiBold,
    fontSize: fs(10),
    color: colors.white,
    fontWeight: '600',
  },
});
