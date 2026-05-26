import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Daisy } from '@/components/brand';
import { ChevronRightIcon } from '@/components/icons/ProfileIcons';
import { colors } from '@/constants/colors';
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
      style={[styles.row, danger && styles.rowDanger]}
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
  flowerStroke: string;
  flowerBg: string;
  onEdit?: () => void;
};

export function ProfileUserCard({
  firstName,
  email,
  flowerStroke,
  flowerBg,
  onEdit,
}: ProfileUserCardProps) {
  return (
    <View style={styles.card}>
      <View style={[styles.avatar, { backgroundColor: flowerBg, borderColor: `${flowerStroke}66` }]}>
        <Daisy color={flowerStroke} size={s(22)} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.name}>{firstName}</Text>
        <Text style={styles.email}>{email}</Text>
      </View>
      <Pressable onPress={onEdit} style={styles.editButton}>
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
    backgroundColor: colors.white,
    borderRadius: s(10),
    paddingHorizontal: s(12),
    paddingVertical: vs(10),
    marginBottom: s(5),
    borderWidth: 1,
    borderColor: colors.border,
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
    backgroundColor: colors.white,
    borderRadius: s(12),
    padding: s(14),
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: s(10),
  },
  avatar: {
    width: s(44),
    height: vs(44),
    borderRadius: s(22),
    borderWidth: 2,
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
    fontSize: fs(9),
    color: colors.blue,
  },
  editButton: {
    backgroundColor: colors.light,
    borderWidth: 1,
    borderColor: '#c8d9e6',
    borderRadius: s(8),
    paddingHorizontal: s(10),
    paddingVertical: vs(5),
  },
  editLabel: {
    fontFamily: fonts.dmSans,
    fontSize: fs(9),
    color: colors.blue,
  },
});
