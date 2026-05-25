import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CounterRow } from '@/components/cycle/SyncMethodPicker';
import { PhasePicker } from '@/components/cycle/PhaseGuideList';
import { DateStepperRow } from '@/components/schedule/DateStepperRow';
import { TimeOfDayPicker } from '@/components/schedule/TimeOfDayPicker';
import { WeekDayPicker } from '@/components/schedule/WeekDayPicker';
import { Chip } from '@/components/ui/Chip';
import { FullWidthButton } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import {
  cloneSchedule,
  END_OPTIONS,
  formatSchedulePreview,
  FREQUENCY_OPTIONS,
  type EndOption,
} from '@/constants/schedules';
import { fonts } from '@/constants/typography';
import type { PhaseKey } from '@/constants/phases';
import { defaultEndDate, todayIsoDate } from '@/lib/schedule';
import { useCycleSettings } from '@/providers/AppStore';
import type { Schedule, ScheduleFrequency } from '@/types';
import { s, vs, fs } from '@/lib/scale';

const CYCLE_FREQUENCY_OPTION = { value: 'cycle' as const, label: 'Cycle Phase' };

type ScheduleEditorFormProps = {
  initialSchedule: Schedule;
  onSave: (schedule: Schedule) => void;
};

function withStartDate(schedule: Schedule): Schedule {
  return {
    ...schedule,
    startDate: schedule.startDate ?? todayIsoDate(),
  };
}

export function ScheduleEditorForm({ initialSchedule, onSave }: ScheduleEditorFormProps) {
  const { cycleSettings } = useCycleSettings();
  const [schedule, setSchedule] = useState<Schedule>(() =>
    withStartDate(cloneSchedule(initialSchedule)),
  );

  const frequencyOptions = cycleSettings.enabled
    ? [...FREQUENCY_OPTIONS, CYCLE_FREQUENCY_OPTION]
    : FREQUENCY_OPTIONS;

  const showWeekDays =
    schedule.frequency === 'weekly' || schedule.frequency === 'biweekly';
  const showPhasePicker = schedule.frequency === 'cycle';
  const showCustomInterval = schedule.frequency === 'custom';
  const ends = schedule.ends ?? 'never';

  const setFrequency = (frequency: ScheduleFrequency) => {
    setSchedule((current) => {
      const startDate = current.startDate ?? todayIsoDate();

      return {
        ...current,
        frequency,
        startDate,
        daysOfWeek:
          frequency === 'weekly' || frequency === 'biweekly'
            ? current.daysOfWeek?.length
              ? current.daysOfWeek
              : [1, 3, 5]
            : undefined,
        phases:
          frequency === 'cycle'
            ? current.phases?.length
              ? current.phases
              : (['follicular', 'ovulatory'] as PhaseKey[])
            : undefined,
        customIntervalDays:
          frequency === 'custom' ? (current.customIntervalDays ?? 3) : undefined,
      };
    });
  };

  const togglePhase = (phase: PhaseKey) => {
    setSchedule((current) => {
      const phases = current.phases ?? [];
      const next = phases.includes(phase)
        ? phases.filter((item) => item !== phase)
        : [...phases, phase];

      return { ...current, phases: next };
    });
  };

  const setEnds = (nextEnds: EndOption) => {
    setSchedule((current) => {
      const startDate = current.startDate ?? todayIsoDate();
      const next: Schedule = { ...current, ends: nextEnds, startDate };

      if (nextEnds === 'date' && !current.endDate) {
        next.endDate = defaultEndDate(startDate);
      }

      if (nextEnds === 'after' && !current.endAfterCount) {
        next.endAfterCount = 10;
      }

      return next;
    });
  };

  const handleSave = () => {
    onSave(withStartDate(schedule));
  };

  return (
    <View>
      <View style={styles.preview}>
        <Text style={styles.previewLabel}>Preview</Text>
        <Text style={styles.previewValue}>{formatSchedulePreview(schedule)}</Text>
      </View>

      <Text style={styles.sectionLabel}>Repeat</Text>
      <View style={styles.chips}>
        {frequencyOptions.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            selected={schedule.frequency === option.value}
            small
            onPress={() => setFrequency(option.value)}
          />
        ))}
      </View>

      {showCustomInterval ? (
        <CounterRow
          label="Repeat Every"
          value={schedule.customIntervalDays ?? 3}
          min={2}
          max={90}
          unit="days"
          onChange={(customIntervalDays) =>
            setSchedule((current) => ({ ...current, customIntervalDays }))
          }
        />
      ) : null}

      {showWeekDays ? (
        <>
          <Text style={styles.sectionLabel}>On These Days</Text>
          <WeekDayPicker
            selectedDays={schedule.daysOfWeek ?? []}
            onChange={(daysOfWeek) => setSchedule((current) => ({ ...current, daysOfWeek }))}
          />
        </>
      ) : null}

      {showPhasePicker ? (
        <>
          <Text style={styles.sectionLabel}>Active During These Phases</Text>
          <PhasePicker
            selectedPhases={schedule.phases ?? []}
            onToggle={togglePhase}
          />
        </>
      ) : null}

      <Text style={styles.sectionLabel}>Time of Day</Text>
      <TimeOfDayPicker
        value={schedule.timeOfDay}
        onChange={(timeOfDay) => setSchedule((current) => ({ ...current, timeOfDay }))}
      />

      <DateStepperRow
        label="Start Date"
        value={schedule.startDate ?? todayIsoDate()}
        onChange={(startDate) => setSchedule((current) => ({ ...current, startDate }))}
      />

      <Text style={styles.sectionLabel}>Ends</Text>
      <View style={styles.endsRow}>
        {END_OPTIONS.map((option) => {
          const selected = ends === option;
          const label = option === 'never' ? 'Never' : option === 'date' ? 'On Date' : 'After';

          return (
            <Pressable
              key={option}
              onPress={() => setEnds(option)}
              style={[styles.endsButton, selected ? styles.endsSelected : styles.endsDefault]}
            >
              <Text
                style={[
                  styles.endsLabel,
                  selected ? styles.endsLabelSelected : styles.endsLabelDefault,
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {ends === 'date' ? (
        <DateStepperRow
          label="End Date"
          value={schedule.endDate ?? defaultEndDate(schedule.startDate ?? todayIsoDate())}
          onChange={(endDate) => setSchedule((current) => ({ ...current, endDate }))}
        />
      ) : null}

      {ends === 'after' ? (
        <CounterRow
          label="Stop After"
          value={schedule.endAfterCount ?? 10}
          min={1}
          max={365}
          unit="times"
          onChange={(endAfterCount) =>
            setSchedule((current) => ({ ...current, endAfterCount }))
          }
        />
      ) : null}

      <View style={styles.footer}>
        <FullWidthButton label="Save Schedule" onPress={handleSave} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  preview: {
    backgroundColor: colors.light,
    borderWidth: 1,
    borderColor: '#c8d9e6',
    borderRadius: s(10),
    paddingHorizontal: s(12),
    paddingVertical: vs(10),
    marginBottom: s(12),
  },
  previewLabel: {
    fontFamily: fonts.dmSans,
    fontSize: fs(8),
    letterSpacing: s(2),
    textTransform: 'uppercase',
    color: colors.muted,
    marginBottom: s(2),
  },
  previewValue: {
    fontFamily: fonts.lora,
    fontSize: fs(14),
    color: colors.navy,
  },
  sectionLabel: {
    fontFamily: fonts.dmSans,
    fontSize: fs(8),
    letterSpacing: s(2),
    textTransform: 'uppercase',
    color: colors.muted,
    marginBottom: s(6),
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: s(4),
    marginBottom: s(12),
  },
  endsRow: {
    flexDirection: 'row',
    gap: s(6),
    marginBottom: s(12),
  },
  endsButton: {
    flex: 1,
    paddingVertical: vs(8),
    borderRadius: s(8),
    borderWidth: 1,
    alignItems: 'center',
  },
  endsDefault: {
    backgroundColor: colors.white,
    borderColor: colors.border,
  },
  endsSelected: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  endsLabel: {
    fontFamily: fonts.dmSans,
    fontSize: fs(9),
  },
  endsLabelDefault: {
    color: colors.gray,
  },
  endsLabelSelected: {
    color: colors.white,
  },
  footer: {
    marginTop: s(4),
  },
});
