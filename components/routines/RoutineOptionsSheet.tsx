import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/constants/colors';
import { plannerCardBorder, plannerCornerRadius } from '@/constants/plannerCardStyles';
import { fonts } from '@/constants/typography';
import { s, vs, fs } from '@/lib/scale';

type RoutineOptionsSheetProps = {
  visible: boolean;
  routineName: string;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onCancel: () => void;
};

export function RoutineOptionsSheet({
  visible,
  routineName,
  onEdit,
  onDuplicate,
  onDelete,
  onCancel,
}: RoutineOptionsSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onCancel} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, s(36)) }]}>
          <View style={styles.handle} />
          <Text style={styles.title} numberOfLines={2}>
            {routineName}
          </Text>
          <Pressable onPress={onEdit} style={styles.actionButton}>
            <Text style={styles.actionLabel}>Edit routine</Text>
          </Pressable>
          <Pressable onPress={onDuplicate} style={styles.actionButton}>
            <Text style={styles.actionLabel}>Duplicate routine</Text>
          </Pressable>
          <Pressable onPress={onDelete} style={styles.deleteButton}>
            <Text style={styles.deleteLabel}>Delete routine</Text>
          </Pressable>
          <Pressable onPress={onCancel} style={styles.cancelButton}>
            <Text style={styles.cancelLabel}>Cancel</Text>
          </Pressable>
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
    marginBottom: s(18),
  },
  title: {
    fontFamily: fonts.lora,
    fontSize: fs(20),
    color: colors.navy,
    marginBottom: s(16),
  },
  actionButton: {
    paddingVertical: vs(12),
    borderRadius: plannerCornerRadius,
    borderWidth: 1,
    borderColor: plannerCardBorder,
    alignItems: 'center',
    marginBottom: s(8),
  },
  actionLabel: {
    fontFamily: fonts.dmSans,
    fontSize: fs(9),
    letterSpacing: s(2),
    textTransform: 'uppercase',
    color: colors.navy,
  },
  deleteButton: {
    paddingVertical: vs(12),
    borderRadius: plannerCornerRadius,
    backgroundColor: colors.danger,
    alignItems: 'center',
    marginBottom: s(8),
  },
  deleteLabel: {
    fontFamily: fonts.dmSans,
    fontSize: fs(9),
    letterSpacing: s(2),
    textTransform: 'uppercase',
    color: colors.white,
  },
  cancelButton: {
    paddingVertical: vs(12),
    borderRadius: plannerCornerRadius,
    borderWidth: 1,
    borderColor: plannerCardBorder,
    alignItems: 'center',
  },
  cancelLabel: {
    fontFamily: fonts.dmSans,
    fontSize: fs(9),
    letterSpacing: s(2),
    textTransform: 'uppercase',
    color: colors.gray,
  },
});
