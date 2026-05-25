import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import {
  getNotificationPermissionLabel,
  type NotificationPermissionStatus,
} from '@/hooks/useNotificationPermission';
import { s, vs, fs } from '@/lib/scale';

type PermissionStatusRowProps = {
  status: NotificationPermissionStatus;
};

const STATUS_COLORS: Record<NotificationPermissionStatus, string> = {
  allowed: colors.blue,
  denied: colors.danger,
  not_determined: colors.muted,
};

export function PermissionStatusRow({ status }: PermissionStatusRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>Permission Status</Text>
      <View style={[styles.badge, { backgroundColor: `${STATUS_COLORS[status]}22` }]}>
        <Text style={[styles.badgeText, { color: STATUS_COLORS[status] }]}>
          {getNotificationPermissionLabel(status)}
        </Text>
      </View>
    </View>
  );
}

type PlanOptionCardProps = {
  label: string;
  price: string;
  interval: string;
  badge?: string;
  selected?: boolean;
  onPress?: () => void;
};

export function PlanOptionCard({
  label,
  price,
  interval,
  badge,
  selected = false,
  onPress,
}: PlanOptionCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.planCard, selected && styles.planCardSelected]}
    >
      <View style={styles.planCopy}>
        <View style={styles.planHeader}>
          <Text style={styles.planLabel}>{label}</Text>
          {badge ? (
            <View style={styles.planBadge}>
              <Text style={styles.planBadgeText}>{badge}</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.planPrice}>
          {price} <Text style={styles.planInterval}>{interval}</Text>
        </Text>
      </View>
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected ? <View style={styles.radioDot} /> : null}
      </View>
    </Pressable>
  );
}

type PolicyLinkRowProps = {
  label: string;
  onPress?: () => void;
  first?: boolean;
};

export function PolicyLinkRow({ label, onPress, first = false }: PolicyLinkRowProps) {
  return (
    <Pressable onPress={onPress} style={[styles.policyRow, first && styles.policyRowFirst]}>
      <Text style={styles.policyLabel}>{label}</Text>
      <Text style={styles.policyAction}>Open</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: s(10),
  },
  label: {
    fontFamily: fonts.dmSans,
    fontSize: fs(8),
    letterSpacing: s(2),
    textTransform: 'uppercase',
    color: colors.muted,
  },
  badge: {
    borderRadius: s(999),
    paddingHorizontal: s(10),
    paddingVertical: vs(4),
  },
  badgeText: {
    fontFamily: fonts.dmSansSemiBold,
    fontSize: fs(10),
    fontWeight: '600',
  },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(12),
    backgroundColor: colors.white,
    borderRadius: s(12),
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: s(14),
    paddingVertical: vs(12),
    marginBottom: s(8),
  },
  planCardSelected: {
    borderColor: colors.blue,
    backgroundColor: colors.light,
  },
  planCopy: {
    flex: 1,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(6),
    marginBottom: s(2),
  },
  planLabel: {
    fontFamily: fonts.dmSansSemiBold,
    fontSize: fs(12),
    color: colors.navy,
    fontWeight: '600',
  },
  planBadge: {
    backgroundColor: `${colors.blue}22`,
    borderRadius: s(999),
    paddingHorizontal: s(6),
    paddingVertical: vs(2),
  },
  planBadgeText: {
    fontFamily: fonts.dmSans,
    fontSize: fs(8),
    color: colors.blue,
  },
  planPrice: {
    fontFamily: fonts.lora,
    fontSize: fs(18),
    color: colors.navy,
  },
  planInterval: {
    fontFamily: fonts.dmSans,
    fontSize: fs(10),
    color: colors.gray,
  },
  radio: {
    width: s(18),
    height: vs(18),
    borderRadius: s(9),
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: colors.blue,
  },
  radioDot: {
    width: s(8),
    height: vs(8),
    borderRadius: s(4),
    backgroundColor: colors.blue,
  },
  policyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: vs(10),
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  policyRowFirst: {
    borderTopWidth: 0,
  },
  policyLabel: {
    fontFamily: fonts.dmSans,
    fontSize: fs(12),
    color: colors.navy,
  },
  policyAction: {
    fontFamily: fonts.dmSans,
    fontSize: fs(10),
    color: colors.blue,
    textDecorationLine: 'underline',
  },
});
