import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Daisy } from '@/components/brand';
import { BellIcon, MoreHorizontalIcon, ShareIcon } from '@/components/icons/ActionIcons';
import { categoryColors } from '@/constants/categories';
import { colors } from '@/constants/colors';
import { plannerCardBorder } from '@/constants/plannerCardStyles';
import { compactCardSizes } from '@/constants/tabPageTypography';
import { fonts } from '@/constants/typography';
import {
  formatFrequency,
  formatTimeOfDay,
} from '@/providers/RoutinesProvider';
import type { Routine } from '@/types';
import { s, fs } from '@/lib/scale';

const FLOWER_SIZE = s(16);
const TITLE_GAP = s(8);

type RoutineDetailHeaderProps = {
  routine: Routine;
  onBack?: () => void;
  onOpenMenu?: () => void;
  onShare?: () => void;
  sharing?: boolean;
  onOpenNotificationSettings?: () => void;
};

export function RoutineDetailHeader({
  routine,
  onBack,
  onOpenMenu,
  onShare,
  sharing = false,
  onOpenNotificationSettings,
}: RoutineDetailHeaderProps) {
  const categoryColor = categoryColors[routine.category];

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="Back">
          <Text style={styles.back}>← Back</Text>
        </Pressable>
        <View style={styles.iconCluster}>
          {onOpenNotificationSettings ? (
            <Pressable
              onPress={onOpenNotificationSettings}
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              hitSlop={8}
              style={styles.iconButton}
            >
              <BellIcon size={s(18)} color={colors.navy} />
            </Pressable>
          ) : null}
          {onShare ? (
            <Pressable
              onPress={onShare}
              disabled={sharing}
              accessibilityRole="button"
              accessibilityLabel="Share this routine"
              hitSlop={8}
              style={styles.iconButton}
            >
              <ShareIcon size={s(18)} color={sharing ? colors.muted : colors.navy} />
            </Pressable>
          ) : null}
          {onOpenMenu ? (
            <Pressable
              onPress={onOpenMenu}
              accessibilityRole="button"
              accessibilityLabel="More options"
              hitSlop={8}
              style={styles.iconButton}
            >
              <MoreHorizontalIcon size={s(18)} color={colors.navy} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <View style={styles.titleLine}>
        <View style={styles.flower}>
          <Daisy color={categoryColor} size={FLOWER_SIZE} />
        </View>
        <Text style={styles.name}>{routine.name}</Text>
      </View>

      <View style={styles.details}>
        {routine.description ? (
          <Text style={styles.description}>{routine.description}</Text>
        ) : null}
        <Text style={styles.subtitle}>
          {routine.category} · {routine.steps.length} steps ·{' '}
          {formatFrequency(routine.schedule.frequency)} ·{' '}
          {formatTimeOfDay(routine.timeOfDay)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: s(14),
    paddingHorizontal: s(12),
    paddingBottom: s(10),
    borderBottomWidth: 1,
    borderBottomColor: plannerCardBorder,
    backgroundColor: colors.bg,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: s(8),
  },
  back: {
    fontFamily: fonts.dmSans,
    fontSize: fs(12),
    color: colors.blue,
  },
  iconCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(2),
  },
  iconButton: {
    paddingHorizontal: s(2),
    paddingVertical: s(6),
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: TITLE_GAP,
  },
  flower: {
    width: FLOWER_SIZE,
    height: FLOWER_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    flex: 1,
    fontFamily: fonts.lora,
    fontSize: fs(16),
    lineHeight: fs(20),
    color: colors.navy,
  },
  details: {
    marginTop: s(6),
    alignItems: 'flex-start',
    gap: s(2),
  },
  description: {
    fontFamily: fonts.dmSans,
    fontSize: compactCardSizes.meta,
    lineHeight: fs(16),
    color: colors.gray,
    textAlign: 'left',
  },
  subtitle: {
    fontFamily: fonts.dmSans,
    fontSize: compactCardSizes.meta,
    color: colors.muted,
    textAlign: 'left',
  },
});
