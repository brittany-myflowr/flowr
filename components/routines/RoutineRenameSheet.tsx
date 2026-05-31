import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/constants/colors';
import { plannerCardBorder, plannerCornerRadius } from '@/constants/plannerCardStyles';
import { fonts } from '@/constants/typography';
import { s, vs, fs } from '@/lib/scale';

type RoutineRenameSheetProps = {
  visible: boolean;
  initialName: string;
  onSave: (name: string) => void;
  onCancel: () => void;
};

export function RoutineRenameSheet({
  visible,
  initialName,
  onSave,
  onCancel,
}: RoutineRenameSheetProps) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState(initialName);

  useEffect(() => {
    if (visible) {
      setName(initialName);
    }
  }, [visible, initialName]);

  const handleSave = () => {
    const trimmed = name.trim();
    onSave(trimmed || initialName);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.backdrop} onPress={onCancel} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, s(36)) }]}>
          <View style={styles.handle} />
          <Text style={styles.title}>Name your routine</Text>
          <Text style={styles.message}>Give this duplicate a name before you start editing.</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Routine name"
            placeholderTextColor={colors.muted}
            autoCapitalize="words"
            autoCorrect
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleSave}
            style={styles.inputField}
          />
          <Pressable onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveLabel}>Save</Text>
          </Pressable>
          <Pressable onPress={onCancel} style={styles.cancelButton}>
            <Text style={styles.cancelLabel}>Cancel</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
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
    marginBottom: s(6),
  },
  message: {
    fontFamily: fonts.dmSans,
    fontSize: fs(12),
    color: colors.gray,
    lineHeight: fs(19),
    marginBottom: s(14),
  },
  inputField: {
    marginBottom: s(16),
    paddingVertical: vs(10),
    paddingHorizontal: s(12),
    borderWidth: 1,
    borderColor: plannerCardBorder,
    borderRadius: plannerCornerRadius,
    backgroundColor: colors.white,
    fontFamily: fonts.dmSans,
    fontSize: fs(12),
    color: colors.navy,
  },
  saveButton: {
    paddingVertical: vs(12),
    borderRadius: plannerCornerRadius,
    backgroundColor: colors.navy,
    alignItems: 'center',
    marginBottom: s(8),
  },
  saveLabel: {
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
