import { useRouter } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Daisy } from '@/components/brand';
import {
  BellOutlineIcon,
  CardOutlineIcon,
  LogOutOutlineIcon,
  MessageOutlineIcon,
  ShieldOutlineIcon,
  WarningOutlineIcon,
} from '@/components/icons/ProfileIcons';
import { TabPageHeader } from '@/components/layout/TabPageHeader';
import { ProfileMenuRow, ProfileUserCard } from '@/components/profile/ProfileMenuRow';
import { colors } from '@/constants/colors';
import { tabPageStyles, tabPageTypography } from '@/constants/tabPageTypography';
import { fonts } from '@/constants/typography';
import { getFlowerColorByName } from '@/lib/flowerColor';
import { useAuth } from '@/providers/AppStore';
import { s } from '@/lib/scale';

export default function ProfileScreen() {
  const router = useRouter();
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
    <View style={tabPageStyles.screen}>
      <TabPageHeader title="My Profile" />

      <ScrollView
        style={tabPageStyles.scroll}
        contentContainerStyle={tabPageStyles.content}
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
  sectionLabel: {
    fontFamily: fonts.dmSans,
    fontSize: tabPageTypography.sectionLabel,
    letterSpacing: s(2),
    textTransform: 'uppercase',
    color: colors.muted,
    marginBottom: s(5),
    marginTop: s(4),
  },
  devSectionLabel: {
    fontFamily: fonts.dmSans,
    fontSize: tabPageTypography.sectionLabel,
    letterSpacing: s(2),
    textTransform: 'uppercase',
    color: colors.dangerLight,
    marginBottom: s(5),
    marginTop: s(10),
  },
});
