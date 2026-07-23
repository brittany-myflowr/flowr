import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PhaseFlower } from '@/components/brand';
import { PhaseGuideList } from '@/components/cycle/PhaseGuideList';
import { CounterRow, SyncMethodPicker } from '@/components/cycle/SyncMethodPicker';
import { FocusScrollView } from '@/components/layout/FocusScrollView';
import { SubPageHeader } from '@/components/layout/SubPageHeader';
import { FullWidthButton } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Toggle';
import { colors } from '@/constants/colors';
import { plannerCard, plannerCardBorder, plannerCornerRadius } from '@/constants/plannerCardStyles';
import { fonts } from '@/constants/typography';
import {
  formatDisplayDate,
  getCurrentPhaseInfo,
  shiftIsoDate,
} from '@/lib/cycle';
import { useCycleSettings } from '@/providers/AppStore';
import { useToast } from '@/providers/ToastProvider';
import { s, vs, fs } from '@/lib/scale';

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
        onBack={() => router.back()}
      />

      <FocusScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.toggleCard, plannerCard()]}>
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
              plannerCard(),
              {
                backgroundColor: `${phaseInfo.color}22`,
                borderColor: `${phaseInfo.color}66`,
              },
            ]}
          >
            <PhaseFlower color={phaseInfo.color} size={s(24)} />
            <View style={styles.currentPhaseCopy}>
              <Text style={styles.currentPhaseLabel}>Currently In</Text>
              <Text style={styles.currentPhaseTitle}>{phaseInfo.label} Phase</Text>
              <Text style={styles.currentPhaseMeta}>
                Day {phaseInfo.dayInCycle} of {phaseInfo.cycleLength}
                {phaseInfo.daysRemaining === 0
                  ? ' · Last day of cycle'
                  : ` · ${phaseInfo.daysRemaining} day${phaseInfo.daysRemaining === 1 ? '' : 's'} remaining`}
                {' · '}
                {phaseInfo.description}
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
          <View style={[styles.manualCard, plannerCard()]}>
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
          <View style={[styles.lunarNote, plannerCard()]}>
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
      </FocusScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingHorizontal: s(12),
    paddingTop: s(12),
    paddingBottom: s(24),
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(10),
    padding: s(12),
    marginBottom: s(10),
  },
  toggleCopy: {
    flex: 1,
  },
  toggleTitle: {
    fontFamily: fonts.cardTitle,
    fontSize: fs(14),
    color: colors.navy,
  },
  toggleSubtitle: {
    marginTop: s(1),
    fontFamily: fonts.dmSans,
    fontSize: fs(12),
    color: colors.blue,
  },
  currentPhaseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(10),
    paddingHorizontal: s(12),
    paddingVertical: vs(10),
    marginBottom: s(10),
  },
  currentPhaseCopy: {
    flex: 1,
  },
  currentPhaseLabel: {
    fontFamily: fonts.dmSans,
    fontSize: fs(10),
    letterSpacing: s(1.5),
    textTransform: 'uppercase',
    color: colors.muted,
    marginBottom: s(1),
  },
  currentPhaseTitle: {
    fontFamily: fonts.cardTitle,
    fontSize: fs(14),
    color: colors.navy,
  },
  currentPhaseMeta: {
    marginTop: s(1),
    fontFamily: fonts.dmSans,
    fontSize: fs(12),
    color: colors.gray,
  },
  sectionLabel: {
    fontFamily: fonts.dmSans,
    fontSize: fs(10),
    letterSpacing: s(2),
    textTransform: 'uppercase',
    color: colors.muted,
    marginBottom: s(6),
    marginTop: s(4),
  },
  manualCard: {
    padding: s(12),
    marginBottom: s(10),
  },
  fieldLabel: {
    fontFamily: fonts.dmSans,
    fontSize: fs(10),
    letterSpacing: s(2),
    textTransform: 'uppercase',
    color: colors.muted,
    marginBottom: s(5),
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(10),
    marginBottom: s(10),
  },
  dateButton: {
    width: s(28),
    height: vs(28),
    borderRadius: plannerCornerRadius,
    borderWidth: 1,
    borderColor: plannerCardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateButtonText: {
    fontFamily: fonts.dmSans,
    fontSize: fs(14),
    color: colors.navy,
  },
  dateValue: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.dmSans,
    fontSize: fs(11),
    color: colors.navy,
  },
  lunarNote: {
    backgroundColor: colors.light,
    paddingHorizontal: s(12),
    paddingVertical: vs(10),
    marginBottom: s(10),
  },
  lunarText: {
    fontFamily: fonts.dmSans,
    fontSize: fs(10),
    color: colors.gray,
    lineHeight: fs(16),
  },
  lunarMuted: {
    color: colors.muted,
  },
});
