import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet } from 'react-native';

import { MenuIcon } from '@/components/icons/ActionIcons';
import { AccountMenuSheet } from '@/components/profile/AccountMenuSheet';
import { colors } from '@/constants/colors';
import { useAuth } from '@/providers/AppStore';
import { s } from '@/lib/scale';

type ProfileHeaderButtonProps = {
  onPress?: () => void;
};

/** Header ⋯ control — opens account menu (profile, subscription, log out). */
export function ProfileHeaderButton({ onPress }: ProfileHeaderButtonProps) {
  const router = useRouter();
  const { signOut } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);

  const closeMenu = () => setMenuVisible(false);

  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }
    setMenuVisible(true);
  };

  const handleProfile = () => {
    closeMenu();
    router.push('/(tabs)/profile');
  };

  const handleSubscription = () => {
    closeMenu();
    router.push('/(tabs)/profile/subscription');
  };

  const handleLogOut = () => {
    closeMenu();
    Alert.alert('Log out?', 'You will need to sign in again to access your account.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/splash');
        },
      },
    ]);
  };

  return (
    <>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        accessibilityRole="button"
        accessibilityLabel="Open account menu"
      >
        <MenuIcon size={s(22)} color={colors.navy} />
      </Pressable>

      <AccountMenuSheet
        visible={menuVisible}
        onProfile={handleProfile}
        onSubscription={handleSubscription}
        onLogOut={handleLogOut}
        onCancel={closeMenu}
      />
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: s(8),
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  buttonPressed: {
    opacity: 0.88,
  },
});
