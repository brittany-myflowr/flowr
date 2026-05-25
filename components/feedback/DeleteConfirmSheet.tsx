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

type DeleteConfirmSheetProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function DeleteConfirmSheet({
  visible,
  title,
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
}: DeleteConfirmSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onCancel} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, s(36)) }]}>
          <View style={styles.handle} />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <Pressable onPress={onConfirm} style={styles.deleteButton}>
            <Text style={styles.deleteLabel}>{confirmLabel}</Text>
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
    marginBottom: s(6),
  },
  message: {
    fontFamily: fonts.dmSans,
    fontSize: fs(12),
    color: colors.gray,
    lineHeight: fs(19),
    marginBottom: s(20),
  },
  deleteButton: {
    paddingVertical: vs(12),
    borderRadius: s(10),
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
    borderRadius: s(10),
    borderWidth: 1,
    borderColor: colors.border,
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
