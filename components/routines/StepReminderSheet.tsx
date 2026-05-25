import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FullWidthButton } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Toggle';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import {
  formatReminderTime,
  resolveStepReminder,
  shiftReminderTime,
} from '@/lib/stepReminders';
import type { StepReminder, TimeOfDay } from '@/types';
import { s, vs, fs } from '@/lib/scale';

type StepReminderSheetProps = {
  visible: boolean;
  stepName: string;
  routineName: string;
  reminder?: StepReminder;
  timeOfDay: TimeOfDay;
  onSave: (reminder: StepReminder) => void;
  onCancel: () => void;
};

export function StepReminderSheet({
  visible,
  stepName,
  routineName,
  reminder,
  timeOfDay,
  onSave,
  onCancel,
}: StepReminderSheetProps) {
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState<StepReminder>(() =>
    resolveStepReminder(reminder, timeOfDay),
  );

  useEffect(() => {
    if (visible) {
      setDraft(resolveStepReminder(reminder, timeOfDay));
    }
  }, [visible, reminder, timeOfDay]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onCancel} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, s(36)) }]}>
          <View style={styles.handle} />
          <Text style={styles.title}>Step Reminder</Text>
          <Text style={styles.subtitle}>
            {routineName} · <Text style={styles.stepName}>{stepName}</Text>
          </Text>

          <View style={styles.toggleRow}>
            <View style={styles.toggleCopy}>
              <Text style={styles.toggleTitle}>Reminder on</Text>
              <Text style={styles.toggleSubtitle}>
                Daily notification at your chosen time
              </Text>
            </View>
            <Toggle
              value={draft.enabled}
              onValueChange={(enabled) => setDraft((current) => ({ ...current, enabled }))}
            />
          </View>

          {draft.enabled ? (
            <View style={styles.timeBlock}>
              <Text style={styles.sectionLabel}>Reminder Time</Text>
              <View style={styles.timeRow}>
                <Pressable
                  onPress={() => setDraft((current) => shiftReminderTime(current, -5))}
                  style={styles.timeButton}
                  hitSlop={4}
                >
                  <Text style={styles.timeButtonText}>−</Text>
                </Pressable>
                <Text style={styles.timeValue}>
                  {formatReminderTime(draft.hour, draft.minute)}
                </Text>
                <Pressable
                  onPress={() => setDraft((current) => shiftReminderTime(current, 5))}
                  style={styles.timeButton}
                  hitSlop={4}
                >
                  <Text style={styles.timeButtonText}>+</Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          <FullWidthButton label="Save Reminder" onPress={() => onSave(draft)} />
          <View style={styles.spacer} />
          <FullWidthButton label="Cancel" variant="ghost" onPress={onCancel} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: s(20),
    borderTopRightRadius: s(20),
    paddingHorizontal: s(18),
    paddingTop: s(0),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 12,
  },
  handle: {
    width: s(36),
    height: vs(4),
    borderRadius: s(2),
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginTop: s(12),
    marginBottom: s(18),
  },
  title: {
    fontFamily: fonts.lora,
    fontSize: fs(20),
    color: colors.navy,
    marginBottom: s(4),
  },
  subtitle: {
    fontFamily: fonts.dmSans,
    fontSize: fs(11),
    color: colors.gray,
    marginBottom: s(16),
  },
  stepName: {
    color: colors.navy,
    fontFamily: fonts.dmSansSemiBold,
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(12),
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: s(10),
    paddingHorizontal: s(12),
    paddingVertical: vs(10),
    marginBottom: s(12),
  },
  toggleCopy: {
    flex: 1,
  },
  toggleTitle: {
    fontFamily: fonts.dmSansSemiBold,
    fontSize: fs(12),
    color: colors.navy,
    fontWeight: '600',
  },
  toggleSubtitle: {
    marginTop: s(2),
    fontFamily: fonts.dmSans,
    fontSize: fs(9),
    color: colors.gray,
    lineHeight: fs(14),
  },
  timeBlock: {
    marginBottom: s(16),
  },
  sectionLabel: {
    fontFamily: fonts.dmSans,
    fontSize: fs(8),
    letterSpacing: s(2),
    textTransform: 'uppercase',
    color: colors.muted,
    marginBottom: s(6),
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: s(10),
    paddingHorizontal: s(10),
    paddingVertical: vs(8),
  },
  timeButton: {
    width: s(28),
    height: vs(28),
    borderRadius: s(8),
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
  timeButtonText: {
    fontFamily: fonts.dmSans,
    fontSize: fs(16),
    color: colors.navy,
    lineHeight: fs(18),
  },
  timeValue: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.lora,
    fontSize: fs(16),
    color: colors.navy,
  },
  spacer: {
    height: vs(8),
  },
});
