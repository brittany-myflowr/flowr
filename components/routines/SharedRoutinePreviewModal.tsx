import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/constants/colors';
import { plannerCardBorder, plannerCornerRadius } from '@/constants/plannerCardStyles';
import { formatSchedulePreview } from '@/constants/schedules';
import { fonts } from '@/constants/typography';
import { formatTaggedProductLabel } from '@/lib/formatTaggedProductLabel';
import { s, vs, fs } from '@/lib/scale';
import type { SharedRoutineSnapshot } from '@/types/share';

type SharedRoutinePreviewModalProps = {
  visible: boolean;
  snapshot: SharedRoutineSnapshot | null;
  loading?: boolean;
  error?: string | null;
  adding?: boolean;
  onAdd: () => void;
  onClose: () => void;
};

export function SharedRoutinePreviewModal({
  visible,
  snapshot,
  loading = false,
  error = null,
  adding = false,
  onAdd,
  onClose,
}: SharedRoutinePreviewModalProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, s(24)) }]}>
          <View style={styles.handle} />
          <Text style={styles.eyebrow}>Someone shared a routine with you</Text>

          {loading ? (
            <View style={styles.centered}>
              <ActivityIndicator color={colors.navy} />
            </View>
          ) : error || !snapshot ? (
            <View style={styles.centered}>
              <Text style={styles.errorTitle}>Routine unavailable</Text>
              <Text style={styles.errorBody}>
                {error ?? 'This share link may be out of date or the routine was removed.'}
              </Text>
              <Pressable onPress={onClose} style={styles.secondaryButton}>
                <Text style={styles.secondaryLabel}>Close</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <Text style={styles.title}>{snapshot.name}</Text>
              {snapshot.description ? (
                <Text style={styles.description}>{snapshot.description}</Text>
              ) : null}
              <Text style={styles.meta}>
                {snapshot.category} · {snapshot.steps.length} steps ·{' '}
                {formatSchedulePreview(snapshot.schedule)}
              </Text>

              <ScrollView
                style={styles.stepsScroll}
                contentContainerStyle={styles.stepsContent}
                showsVerticalScrollIndicator={false}
              >
                {snapshot.steps.map((step, index) => (
                  <View key={`${step.name}-${index}`} style={styles.stepRow}>
                    <Text style={styles.stepIndex}>{index + 1}</Text>
                    <View style={styles.stepBody}>
                      <Text style={styles.stepName}>{step.name}</Text>
                      {step.schedule ? (
                        <Text style={styles.stepMeta}>
                          {formatSchedulePreview(step.schedule)}
                        </Text>
                      ) : null}
                      {step.note ? <Text style={styles.stepNote}>{step.note}</Text> : null}
                      {step.product ? (
                        <Text style={styles.stepProduct}>
                          {formatTaggedProductLabel(step.product)}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                ))}
              </ScrollView>

              <Pressable
                onPress={onAdd}
                disabled={adding}
                style={[styles.primaryButton, adding && styles.primaryButtonDisabled]}
                accessibilityRole="button"
                accessibilityLabel="Add to My Routines"
              >
                <Text style={styles.primaryLabel}>
                  {adding ? 'Adding…' : 'Add to My Routines'}
                </Text>
              </Pressable>
              <Pressable onPress={onClose} style={styles.secondaryButton}>
                <Text style={styles.secondaryLabel}>Not now</Text>
              </Pressable>
            </>
          )}
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
    borderTopLeftRadius: plannerCornerRadius,
    borderTopRightRadius: plannerCornerRadius,
    paddingHorizontal: s(18),
    paddingTop: s(0),
    maxHeight: '88%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 12,
  },
  handle: {
    width: s(36),
    height: vs(4),
    borderRadius: plannerCornerRadius,
    backgroundColor: plannerCardBorder,
    alignSelf: 'center',
    marginTop: s(12),
    marginBottom: s(14),
  },
  eyebrow: {
    fontFamily: fonts.dmSans,
    fontSize: fs(12),
    color: colors.muted,
    marginBottom: s(8),
  },
  title: {
    fontFamily: fonts.lora,
    fontSize: fs(22),
    color: colors.navy,
    marginBottom: s(6),
  },
  description: {
    fontFamily: fonts.dmSans,
    fontSize: fs(13),
    lineHeight: fs(18),
    color: colors.gray,
    marginBottom: s(6),
  },
  meta: {
    fontFamily: fonts.dmSans,
    fontSize: fs(12),
    color: colors.muted,
    marginBottom: s(14),
  },
  stepsScroll: {
    maxHeight: vs(280),
    marginBottom: s(16),
  },
  stepsContent: {
    gap: s(10),
    paddingBottom: s(4),
  },
  stepRow: {
    flexDirection: 'row',
    gap: s(10),
  },
  stepIndex: {
    fontFamily: fonts.dmSansSemiBold,
    fontSize: fs(12),
    color: colors.muted,
    width: s(18),
    marginTop: s(2),
  },
  stepBody: {
    flex: 1,
    gap: s(2),
  },
  stepName: {
    fontFamily: fonts.dmSansSemiBold,
    fontSize: fs(14),
    color: colors.navy,
  },
  stepMeta: {
    fontFamily: fonts.dmSans,
    fontSize: fs(11),
    color: colors.muted,
  },
  stepNote: {
    fontFamily: fonts.dmSans,
    fontSize: fs(12),
    color: colors.gray,
    lineHeight: fs(17),
  },
  stepProduct: {
    fontFamily: fonts.dmSans,
    fontSize: fs(11),
    color: colors.blue,
  },
  primaryButton: {
    paddingVertical: vs(12),
    borderRadius: plannerCornerRadius,
    backgroundColor: colors.navy,
    alignItems: 'center',
    marginBottom: s(8),
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryLabel: {
    fontFamily: fonts.dmSans,
    fontSize: fs(9),
    letterSpacing: s(2),
    textTransform: 'uppercase',
    color: colors.white,
  },
  secondaryButton: {
    paddingVertical: vs(12),
    borderRadius: plannerCornerRadius,
    borderWidth: 1,
    borderColor: plannerCardBorder,
    alignItems: 'center',
  },
  secondaryLabel: {
    fontFamily: fonts.dmSans,
    fontSize: fs(9),
    letterSpacing: s(2),
    textTransform: 'uppercase',
    color: colors.gray,
  },
  centered: {
    alignItems: 'center',
    paddingVertical: s(28),
    gap: s(10),
  },
  errorTitle: {
    fontFamily: fonts.lora,
    fontSize: fs(18),
    color: colors.navy,
  },
  errorBody: {
    fontFamily: fonts.dmSans,
    fontSize: fs(13),
    color: colors.gray,
    textAlign: 'center',
    lineHeight: fs(18),
    marginBottom: s(8),
  },
});
