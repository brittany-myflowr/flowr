import { useRouter } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Daisy } from '@/components/brand';
import {
  BellOutlineIcon,
  CardOutlineIcon,
  LogOutOutlineIcon,
  MessageOutlineIcon,
  ShieldOutlineIcon,
  WarningOutlineIcon,
} from '@/components/icons/ProfileIcons';
import { ProfileMenuRow, ProfileUserCard } from '@/components/profile/ProfileMenuRow';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { getFlowerColorByName } from '@/lib/flowerColor';
import { useAuth } from '@/providers/AppStore';
import { s, fs } from '@/lib/scale';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, signOut, resetAllData } = useAuth();

  const flowerColor = getFlowerColorByName(user?.flowerColorName);

  const handleSignOut = () => {
    signOut();
    router.replace('/(auth)/splash');
  };

  const handleReset = () => {
    Alert.alert(
      'Reset App Data',
      'This will erase all routines, products, and settings on this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetAllData();
            router.replace('/(auth)/splash');
          },
        },
      ],
    );
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: s(18) + insets.top }]}>
        <Text style={styles.title}>My Profile</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {user ? (
          <ProfileUserCard
            firstName={user.firstName}
            email={user.email}
            flowerStroke={flowerColor.stroke}
            flowerBg={flowerColor.bg}
            onEdit={() => router.push('/(tabs)/profile/edit')}
          />
        ) : null}

        <Text style={styles.sectionLabel}>Account</Text>
        <ProfileMenuRow
          label="Notifications"
          icon={<BellOutlineIcon />}
          onPress={() => router.push('/(tabs)/profile/notifications')}
        />
        <ProfileMenuRow
          label="Manage Subscription"
          icon={<CardOutlineIcon />}
          onPress={() => router.push('/(tabs)/profile/subscription')}
        />
        <ProfileMenuRow
          label="Privacy & Data"
          icon={<ShieldOutlineIcon />}
          onPress={() => router.push('/(tabs)/profile/privacy')}
        />

        <Text style={styles.sectionLabel}>App</Text>
        <ProfileMenuRow
          label="About flowr"
          icon={<Daisy color={colors.muted} size={s(16)} />}
          onPress={() => router.push('/(tabs)/profile/about')}
        />
        <ProfileMenuRow
          label="Send Feedback"
          icon={<MessageOutlineIcon />}
          onPress={() => router.push('/(tabs)/profile/feedback')}
        />

        <ProfileMenuRow
          label="Log Out"
          icon={<LogOutOutlineIcon />}
          showChevron={false}
          onPress={handleSignOut}
        />

        <Text style={styles.devSectionLabel}>Developer</Text>
        <ProfileMenuRow
          label="Reset App Data"
          icon={<WarningOutlineIcon />}
          danger
          trailing="Dev only"
          onPress={handleReset}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: s(14),
    paddingBottom: s(8),
  },
  title: {
    fontFamily: fonts.lora,
    fontSize: fs(20),
    color: colors.navy,
  },
  content: {
    paddingHorizontal: s(10),
    paddingBottom: s(24),
  },
  sectionLabel: {
    fontFamily: fonts.dmSans,
    fontSize: fs(8),
    letterSpacing: s(2),
    textTransform: 'uppercase',
    color: colors.muted,
    marginBottom: s(5),
    marginTop: s(4),
  },
  devSectionLabel: {
    fontFamily: fonts.dmSans,
    fontSize: fs(8),
    letterSpacing: s(2),
    textTransform: 'uppercase',
    color: colors.dangerLight,
    marginBottom: s(5),
    marginTop: s(10),
  },
});
