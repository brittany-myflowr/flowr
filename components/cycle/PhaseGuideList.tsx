import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PhaseFlower } from '@/components/brand';
import { CheckIcon } from '@/components/icons/ActionIcons';
import { phases, phaseKeys } from '@/constants/phases';
import { colors } from '@/constants/colors';
import { plannerCard, plannerCardBorder, plannerCornerRadius } from '@/constants/plannerCardStyles';
import { fonts } from '@/constants/typography';
import type { PhaseKey } from '@/constants/phases';
import { s, vs, fs } from '@/lib/scale';

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
              plannerCard(),
              isActive && { backgroundColor: `${phase.color}22`, borderColor: `${phase.color}55` },
            ]}
          >
            <PhaseFlower color={phase.color} size={s(18)} />
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
              plannerCard(),
              selected && { backgroundColor: `${phase.color}22`, borderColor: `${phase.color}88` },
            ]}
          >
            <PhaseFlower color={phase.color} size={s(20)} />
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
              {selected ? <CheckIcon size={s(10)} color={colors.white} /> : null}
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
    gap: s(8),
    paddingHorizontal: s(10),
    paddingVertical: vs(8),
    marginBottom: s(5),
  },
  pickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(10),
    paddingHorizontal: s(12),
    paddingVertical: vs(10),
    marginBottom: s(7),
  },
  copy: {
    flex: 1,
  },
  label: {
    fontFamily: fonts.dmSans,
    fontSize: fs(11),
    color: colors.navy,
  },
  labelActive: {
    fontFamily: fonts.dmSansSemiBold,
    fontWeight: '600',
  },
  description: {
    marginTop: s(1),
    fontFamily: fonts.dmSans,
    fontSize: fs(12),
    color: colors.gray,
  },
  now: {
    fontFamily: fonts.dmSansSemiBold,
    fontSize: fs(8),
    color: colors.blue,
    fontWeight: '600',
  },
  radio: {
    width: s(18),
    height: vs(18),
    borderRadius: plannerCornerRadius,
    borderWidth: 1.5,
    borderColor: plannerCardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
