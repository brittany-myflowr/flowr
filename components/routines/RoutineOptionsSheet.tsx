import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { s, vs, fs } from '@/lib/scale';

const SHEET_RADIUS = s(14);
const SIDE_INSET = s(10);

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
        <Pressable style={styles.backdrop} onPress={onCancel} accessibilityLabel="Dismiss" />
        <View
          style={[
            styles.sheet,
            { paddingBottom: Math.max(insets.bottom, s(10)) },
          ]}
          accessibilityLabel={`Options for ${routineName}`}
        >
          <View style={styles.group}>
            <Pressable onPress={onEdit} style={styles.row} accessibilityRole="button">
              <Text style={styles.rowLabel}>Edit</Text>
            </Pressable>
            <View style={styles.divider} />
            <Pressable onPress={onDuplicate} style={styles.row} accessibilityRole="button">
              <Text style={styles.rowLabel}>Duplicate</Text>
            </Pressable>
            <View style={styles.divider} />
            <Pressable onPress={onDelete} style={styles.row} accessibilityRole="button">
              <Text style={styles.destructiveLabel}>Remove</Text>
            </Pressable>
          </View>

          <View style={styles.group}>
            <Pressable onPress={onCancel} style={styles.row} accessibilityRole="button">
              <Text style={styles.cancelLabel}>Cancel</Text>
            </Pressable>
          </View>
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
    paddingHorizontal: SIDE_INSET,
    gap: s(8),
  },
  group: {
    backgroundColor: colors.white,
    borderRadius: SHEET_RADIUS,
    overflow: 'hidden',
  },
  row: {
    paddingVertical: vs(16),
    paddingHorizontal: s(16),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: vs(52),
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(26,26,46,0.12)',
  },
  rowLabel: {
    fontFamily: fonts.dmSans,
    fontSize: fs(13),
    color: colors.navy,
    textAlign: 'center',
  },
  destructiveLabel: {
    fontFamily: fonts.dmSans,
    fontSize: fs(13),
    color: colors.danger,
    textAlign: 'center',
  },
  cancelLabel: {
    fontFamily: fonts.dmSansSemiBold,
    fontSize: fs(13),
    color: colors.navy,
    textAlign: 'center',
    fontWeight: '600',
  },
});
