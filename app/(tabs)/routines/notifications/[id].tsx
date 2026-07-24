import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { InlineEmptyCard } from '@/components/feedback/InlineEmptyCard';
import { SubPageHeader } from '@/components/layout/SubPageHeader';
import { FullWidthButton } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import { plannerCardBorder, plannerCornerRadius } from '@/constants/plannerCardStyles';
import { fonts } from '@/constants/typography';
import { formatTimeOfDay } from '@/constants/schedules';
import {
  alertNotificationsPermissionDenied,
  formatHhMm,
  requestNotificationPermission,
} from '@/lib/routineNotifications';
import { s, vs, fs } from '@/lib/scale';
import { useRoutine, useRoutines } from '@/providers/RoutinesProvider';

function parseTimeToDate(hhmm: string | undefined): Date {
  const fallback = new Date();
  fallback.setHours(8, 0, 0, 0);
  if (!hhmm) return fallback;
  const match = hhmm.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return fallback;
  const next = new Date();
  next.setHours(Number(match[1]), Number(match[2]), 0, 0);
  return next;
}

export default function RoutineNotificationSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const routine = useRoutine(id);
  const { updateRoutine } = useRoutines();

  const [showPicker, setShowPicker] = useState(Platform.OS === 'ios');

  const enabled = Boolean(routine?.notificationsEnabled);
  const mode = routine?.notificationMode ?? 'timeOfDay';
  const timeValue = useMemo(
    () => parseTimeToDate(routine?.notificationTime),
    [routine?.notificationTime],
  );

  /**
   * After reinstall, cloud can still have notificationsEnabled=true while iOS
   * permission was reset. Changing the time used to skip the permission prompt.
   */
  useEffect(() => {
    if (!routine?.notificationsEnabled) return;

    let cancelled = false;
    void (async () => {
      const granted = await requestNotificationPermission();
      if (cancelled) return;
      if (!granted) {
        updateRoutine(routine.id, { notificationsEnabled: false });
        alertNotificationsPermissionDenied();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [routine?.id, routine?.notificationsEnabled, updateRoutine]);

  if (!routine) {
    return (
      <View style={[styles.screen, styles.centered, { paddingTop: insets.top }]}>
        <SubPageHeader title="Notifications" onBack={() => router.back()} />
        <InlineEmptyCard
          title="Routine not found"
          body="It may have been removed or this link is out of date."
        />
        <FullWidthButton label="← Back" onPress={() => router.back()} />
      </View>
    );
  }

  const ensurePermission = async (): Promise<boolean> => {
    const granted = await requestNotificationPermission();
    if (!granted) {
      updateRoutine(routine.id, { notificationsEnabled: false });
      alertNotificationsPermissionDenied();
      return false;
    }
    return true;
  };

  const enableReminders = async () => {
    if (!(await ensurePermission())) return;
    updateRoutine(routine.id, {
      notificationsEnabled: true,
      notificationMode: routine.notificationMode ?? 'timeOfDay',
      notificationTime:
        routine.notificationMode === 'specific'
          ? routine.notificationTime ?? formatHhMm(timeValue)
          : undefined,
    });
  };

  const handleToggle = (next: boolean) => {
    if (!next) {
      updateRoutine(routine.id, { notificationsEnabled: false });
      return;
    }
    void enableReminders();
  };

  const selectMode = (nextMode: 'specific' | 'timeOfDay') => {
    void (async () => {
      if (!(await ensurePermission())) return;
      updateRoutine(routine.id, {
        notificationsEnabled: true,
        notificationMode: nextMode,
        notificationTime:
          nextMode === 'specific' ? routine.notificationTime ?? formatHhMm(timeValue) : undefined,
      });
    })();
  };

  const onTimeChange = (_: unknown, date?: Date) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (!date) return;
    void (async () => {
      if (!(await ensurePermission())) return;
      updateRoutine(routine.id, {
        notificationsEnabled: true,
        notificationMode: 'specific',
        notificationTime: formatHhMm(date),
      });
    })();
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <SubPageHeader title="Notifications" onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.toggleSection}>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Send me a reminder</Text>
            <Switch
              value={enabled}
              onValueChange={handleToggle}
              trackColor={{ false: plannerCardBorder, true: colors.blue }}
              thumbColor={colors.white}
              ios_backgroundColor={plannerCardBorder}
            />
          </View>
          <Text style={styles.toggleSub}>
            A gentle nudge to start and finish {routine.name}.
          </Text>
          <Text style={styles.toggleSub}>
            If you finish early, we won't bother you again.
          </Text>
        </View>

        {enabled ? (
          <View style={styles.modes}>
            <Pressable
              onPress={() => selectMode('specific')}
              style={[styles.modeCard, mode === 'specific' && styles.modeCardSelected]}
              accessibilityRole="button"
              accessibilityState={{ selected: mode === 'specific' }}
            >
              <Text style={styles.modeTitle}>Specific time</Text>
              <Text style={styles.modeSub}>Pick a time that works for you.</Text>
              {mode === 'specific' ? (
                <View style={styles.pickerWrap}>
                  {Platform.OS === 'android' && !showPicker ? (
                    <Pressable
                      onPress={() => setShowPicker(true)}
                      style={styles.timeButton}
                    >
                      <Text style={styles.timeButtonLabel}>
                        {routine.notificationTime ?? formatHhMm(timeValue)}
                      </Text>
                    </Pressable>
                  ) : null}
                  {(Platform.OS === 'ios' || showPicker) && (
                    <DateTimePicker
                      value={timeValue}
                      mode="time"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={onTimeChange}
                    />
                  )}
                </View>
              ) : null}
            </Pressable>

            <Pressable
              onPress={() => selectMode('timeOfDay')}
              style={[styles.modeCard, mode === 'timeOfDay' && styles.modeCardSelected]}
              accessibilityRole="button"
              accessibilityState={{ selected: mode === 'timeOfDay' }}
            >
              <Text style={styles.modeTitle}>Time of day</Text>
              <Text style={styles.modeSub}>
                We'll remind you at the start and end of your{' '}
                {formatTimeOfDay(routine.timeOfDay).toLowerCase()} window.
              </Text>
              <Text style={styles.todValue}>{formatTimeOfDay(routine.timeOfDay)}</Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  centered: {
    paddingHorizontal: s(14),
  },
  content: {
    paddingHorizontal: s(14),
    paddingTop: s(16),
    paddingBottom: s(40),
    gap: s(16),
  },
  toggleSection: {
    gap: s(6),
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: s(12),
  },
  toggleLabel: {
    flex: 1,
    fontFamily: fonts.dmSansSemiBold,
    fontSize: fs(15),
    color: colors.navy,
  },
  toggleSub: {
    fontFamily: fonts.dmSans,
    fontSize: fs(13),
    lineHeight: fs(18),
    color: colors.gray,
  },
  modes: {
    gap: s(12),
  },
  modeCard: {
    borderWidth: 1,
    borderColor: plannerCardBorder,
    borderRadius: plannerCornerRadius,
    padding: s(14),
    gap: s(6),
    backgroundColor: colors.bg,
  },
  modeCardSelected: {
    borderColor: colors.navy,
  },
  modeTitle: {
    fontFamily: fonts.dmSansSemiBold,
    fontSize: fs(14),
    color: colors.navy,
  },
  modeSub: {
    fontFamily: fonts.dmSans,
    fontSize: fs(12),
    lineHeight: fs(17),
    color: colors.gray,
  },
  pickerWrap: {
    marginTop: s(6),
    alignItems: Platform.OS === 'ios' ? 'stretch' : 'flex-start',
  },
  timeButton: {
    paddingVertical: vs(10),
    paddingHorizontal: s(12),
    borderRadius: plannerCornerRadius,
    backgroundColor: colors.navy,
  },
  timeButtonLabel: {
    fontFamily: fonts.dmSansSemiBold,
    fontSize: fs(13),
    color: colors.white,
  },
  todValue: {
    marginTop: s(4),
    fontFamily: fonts.lora,
    fontSize: fs(16),
    color: colors.navy,
  },
});
