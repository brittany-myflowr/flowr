import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PhaseFlower } from '@/components/brand';
import { PhaseGuideList } from '@/components/cycle/PhaseGuideList';
import { CounterRow, SyncMethodPicker } from '@/components/cycle/SyncMethodPicker';
import { SubPageHeader } from '@/components/layout/SubPageHeader';
import { FullWidthButton } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Toggle';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import {
  formatDisplayDate,
  getCurrentPhaseInfo,
  shiftIsoDate,
} from '@/lib/cycle';
import { useCycleSettings } from '@/providers/AppStore';
import { useToast } from '@/providers/ToastProvider';

export default function CycleSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { cycleSettings, updateCycleSettings, setCycleEnabled } = useCycleSettings();
  const { showToast } = useToast();

  const phaseInfo = getCurrentPhaseInfo(cycleSettings);

  const handleSave = () => {
    showToast('Settings saved');
    router.back();
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <SubPageHeader
        title="Cycle Syncing"
        backLabel="← My Routines"
        onBack={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.toggleCard}>
          <View style={styles.toggleCopy}>
            <Text style={styles.toggleTitle}>Cycle Tracking On</Text>
            <Text style={styles.toggleSubtitle}>Routines synced to your phase</Text>
          </View>
          <Toggle
            value={cycleSettings.enabled}
            onValueChange={(enabled) => setCycleEnabled(enabled)}
          />
        </View>

        {phaseInfo && cycleSettings.enabled ? (
          <View
            style={[
              styles.currentPhaseCard,
              {
                backgroundColor: `${phaseInfo.color}22`,
                borderColor: `${phaseInfo.color}66`,
              },
            ]}
          >
            <PhaseFlower color={phaseInfo.color} size={24} />
            <View style={styles.currentPhaseCopy}>
              <Text style={styles.currentPhaseLabel}>Currently In</Text>
              <Text style={styles.currentPhaseTitle}>{phaseInfo.label} Phase</Text>
              <Text style={styles.currentPhaseMeta}>
                Day {phaseInfo.dayInCycle} of {phaseInfo.cycleLength} · {phaseInfo.description}
              </Text>
            </View>
          </View>
        ) : null}

        <Text style={styles.sectionLabel}>Sync Method</Text>
        <SyncMethodPicker
          value={cycleSettings.method}
          onChange={(method) => updateCycleSettings({ method })}
        />

        {cycleSettings.method === 'menstrual' ? (
          <View style={styles.manualCard}>
            <Text style={styles.fieldLabel}>Last Cycle Started</Text>
            <View style={styles.dateRow}>
              <Pressable
                onPress={() =>
                  updateCycleSettings({
                    lastPeriodStart: shiftIsoDate(
                      cycleSettings.lastPeriodStart || new Date().toISOString().slice(0, 10),
                      -1,
                    ),
                  })
                }
                style={styles.dateButton}
              >
                <Text style={styles.dateButtonText}>−</Text>
              </Pressable>
              <Text style={styles.dateValue}>
                {formatDisplayDate(cycleSettings.lastPeriodStart)}
              </Text>
              <Pressable
                onPress={() =>
                  updateCycleSettings({
                    lastPeriodStart: shiftIsoDate(
                      cycleSettings.lastPeriodStart || new Date().toISOString().slice(0, 10),
                      1,
                    ),
                  })
                }
                style={styles.dateButton}
              >
                <Text style={styles.dateButtonText}>+</Text>
              </Pressable>
            </View>

            <CounterRow
              label="Average Cycle Length"
              value={cycleSettings.cycleLength}
              min={21}
              max={40}
              onChange={(cycleLength) => updateCycleSettings({ cycleLength })}
            />
            <CounterRow
              label="Average Period Length"
              value={cycleSettings.periodLength}
              min={1}
              max={10}
              onChange={(periodLength) => updateCycleSettings({ periodLength })}
            />
          </View>
        ) : (
          <View style={styles.lunarNote}>
            <Text style={styles.lunarText}>
              Calculated automatically from the lunar cycle. No input needed.{'\n'}
              <Text style={styles.lunarMuted}>
                A great option if you have an irregular cycle, no cycle, or are on hormonal birth
                control.
              </Text>
            </Text>
          </View>
        )}

        <Text style={styles.sectionLabel}>Phase Guide</Text>
        <PhaseGuideList activePhase={phaseInfo?.phase} />

        <FullWidthButton label="Save Settings" onPress={handleSave} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 24,
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  toggleCopy: {
    flex: 1,
  },
  toggleTitle: {
    fontFamily: fonts.lora,
    fontSize: 14,
    color: colors.navy,
  },
  toggleSubtitle: {
    marginTop: 1,
    fontFamily: fonts.dmSans,
    fontSize: 9,
    color: colors.blue,
  },
  currentPhaseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  currentPhaseCopy: {
    flex: 1,
  },
  currentPhaseLabel: {
    fontFamily: fonts.dmSans,
    fontSize: 8,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.muted,
    marginBottom: 1,
  },
  currentPhaseTitle: {
    fontFamily: fonts.lora,
    fontSize: 14,
    color: colors.navy,
  },
  currentPhaseMeta: {
    marginTop: 1,
    fontFamily: fonts.dmSans,
    fontSize: 9,
    color: colors.gray,
  },
  sectionLabel: {
    fontFamily: fonts.dmSans,
    fontSize: 8,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.muted,
    marginBottom: 6,
    marginTop: 4,
  },
  manualCard: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  fieldLabel: {
    fontFamily: fonts.dmSans,
    fontSize: 8,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.muted,
    marginBottom: 5,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  dateButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateButtonText: {
    fontFamily: fonts.dmSans,
    fontSize: 14,
    color: colors.navy,
  },
  dateValue: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.dmSans,
    fontSize: 11,
    color: colors.navy,
  },
  lunarNote: {
    backgroundColor: colors.light,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  lunarText: {
    fontFamily: fonts.dmSans,
    fontSize: 10,
    color: colors.gray,
    lineHeight: 16,
  },
  lunarMuted: {
    color: colors.muted,
  },
});
