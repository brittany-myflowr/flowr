import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

function canUseHaptics() {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

export function hapticDragStart() {
  if (!canUseHaptics()) return;
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

export function hapticDragSwap() {
  if (!canUseHaptics()) return;
  void Haptics.selectionAsync();
}

export function hapticDragEnd() {
  if (!canUseHaptics()) return;
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export function hapticStepComplete() {
  if (!canUseHaptics()) return;
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export function hapticDayComplete() {
  if (!canUseHaptics()) return;
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}
