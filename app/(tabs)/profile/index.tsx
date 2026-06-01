import { useRouter } from 'expo-router';
import { Alert, ScrollView, View } from 'react-native';

import { Daisy } from '@/components/brand';
import {
  CardOutlineIcon,
  LogOutOutlineIcon,
  MessageOutlineIcon,
  ShieldOutlineIcon,
  WarningOutlineIcon,
} from '@/components/icons/ProfileIcons';
import { TrialBanner } from '@/components/subscription/TrialBanner';
import { TabPageHeader } from '@/components/layout/TabPageHeader';
import { ProfileMenuRow, ProfileUserCard } from '@/components/profile/ProfileMenuRow';
import { Divider } from '@/components/ui/Divider';
import { colors } from '@/constants/colors';
import { tabPageStyles } from '@/constants/tabPageTypography';
import { getFlowerColorByName } from '@/lib/flowerColor';
import { useAuth } from '@/providers/AppStore';
import { useSubscription } from '@/providers/SubscriptionProvider';
import { s } from '@/lib/scale';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut, resetAllData } = useAuth();
  const { trialInfo, accessStatus } = useSubscription();

  const flowerColor = getFlowerColorByName(user?.flowerColorName);

  const handleSignOut = () => {
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
      <TabPageHeader
        title="My Profile"
        onBackPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/(tabs)');
          }
        }}
      />

      <ScrollView
        style={tabPageStyles.scroll}
        contentContainerStyle={tabPageStyles.content}
        showsVerticalScrollIndicator={false}
      >
        {user ? (
          <ProfileUserCard
            firstName={user.firstName}
            email={user.email}
            flowerColor={flowerColor.stroke}
            onEdit={() => router.push('/(tabs)/profile/edit')}
          />
        ) : null}

        {accessStatus === 'trial' && trialInfo?.isActive ? (
          <TrialBanner
            trialInfo={trialInfo}
            onPress={() => router.push('/(tabs)/profile/subscription')}
          />
        ) : null}

        <Divider label="Account" large outlined />

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

        <Divider label="App" large outlined />

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

        <Divider label="Developer" large outlined />

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
