import { useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { Daisy } from '@/components/brand';
import { colors } from '@/constants/colors';
import { plannerCardBorder } from '@/constants/plannerCardStyles';
import { getFlowerColorByName } from '@/lib/flowerColor';
import { useAuth } from '@/providers/AppStore';
import { s } from '@/lib/scale';

type ProfileHeaderButtonProps = {
  onPress?: () => void;
};

export function ProfileHeaderButton({ onPress }: ProfileHeaderButtonProps) {
  const router = useRouter();
  const { user } = useAuth();
  const flowerColor = getFlowerColorByName(user?.flowerColorName);

  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }
    router.push('/(tabs)/profile');
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      accessibilityRole="button"
      accessibilityLabel="Open profile"
    >
      <Daisy color={flowerColor.stroke} size={s(24)} />
    </Pressable>
  );
}

const BUTTON_SIZE = s(48);

const styles = StyleSheet.create({
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    borderWidth: 1,
    borderColor: plannerCardBorder,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  buttonPressed: {
    opacity: 0.88,
  },
});
