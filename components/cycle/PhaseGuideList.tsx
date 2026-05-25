import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PhaseFlower } from '@/components/brand';
import { CheckIcon } from '@/components/icons/ActionIcons';
import { phases, phaseKeys } from '@/constants/phases';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import type { PhaseKey } from '@/constants/phases';

type PhaseGuideListProps = {
  activePhase?: PhaseKey;
};

export function PhaseGuideList({ activePhase }: PhaseGuideListProps) {
  return (
    <View>
      {phaseKeys.map((key) => {
        const phase = phases[key];
        const isActive = key === activePhase;

        return (
          <View
            key={key}
            style={[
              styles.row,
              isActive && { backgroundColor: `${phase.color}22`, borderColor: `${phase.color}55` },
            ]}
          >
            <PhaseFlower color={phase.color} size={18} />
            <View style={styles.copy}>
              <Text style={[styles.label, isActive && styles.labelActive]}>{phase.label}</Text>
              <Text style={styles.description}>{phase.description}</Text>
            </View>
            {isActive ? <Text style={styles.now}>NOW</Text> : null}
          </View>
        );
      })}
    </View>
  );
}

type PhasePickerProps = {
  selectedPhases: PhaseKey[];
  onToggle: (phase: PhaseKey) => void;
};

export function PhasePicker({ selectedPhases, onToggle }: PhasePickerProps) {
  return (
    <View>
      {phaseKeys.map((key) => {
        const phase = phases[key];
        const selected = selectedPhases.includes(key);

        return (
          <Pressable
            key={key}
            onPress={() => onToggle(key)}
            style={[
              styles.pickRow,
              selected && { backgroundColor: `${phase.color}22`, borderColor: `${phase.color}88` },
            ]}
          >
            <PhaseFlower color={phase.color} size={20} />
            <View style={styles.copy}>
              <Text style={[styles.label, selected && styles.labelActive]}>{phase.label}</Text>
              <Text style={styles.description}>{phase.description}</Text>
            </View>
            <View
              style={[
                styles.radio,
                selected && { backgroundColor: phase.color, borderColor: phase.color },
              ]}
            >
              {selected ? <CheckIcon size={10} color={colors.white} /> : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 5,
  },
  pickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 7,
  },
  copy: {
    flex: 1,
  },
  label: {
    fontFamily: fonts.dmSans,
    fontSize: 11,
    color: colors.navy,
  },
  labelActive: {
    fontFamily: fonts.dmSansSemiBold,
    fontWeight: '600',
  },
  description: {
    marginTop: 1,
    fontFamily: fonts.dmSans,
    fontSize: 9,
    color: colors.gray,
  },
  now: {
    fontFamily: fonts.dmSansSemiBold,
    fontSize: 8,
    color: colors.blue,
    fontWeight: '600',
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
