import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Daisy } from '@/components/brand';
import { InlineEmptyCard } from '@/components/feedback/InlineEmptyCard';
import { SubPageHeader } from '@/components/layout/SubPageHeader';
import { FlowerColorPicker } from '@/components/profile/FlowerColorPicker';
import { FullWidthButton } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { defaultFlowerColor } from '@/constants/flowerColors';
import { getFlowerColorByName } from '@/lib/flowerColor';
import { useAuth } from '@/providers/AppStore';
import { useToast } from '@/providers/ToastProvider';
import { s, vs, fs } from '@/lib/scale';

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, updateAccount } = useAuth();
  const { showToast } = useToast();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedColor, setSelectedColor] = useState(() => getFlowerColorByName(defaultFlowerColor.name));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setEmail(user.email);
    setSelectedColor(getFlowerColorByName(user.flowerColorName));
  }, [user]);

  const handleSave = () => {
    const message = updateAccount({
      firstName,
      lastName,
      email,
      flowerColorName: selectedColor.name,
    });

    if (message) {
      setError(message);
      return;
    }

    showToast('Settings saved');
    router.back();
  };

  const canSave =
    firstName.trim().length > 0 && lastName.trim().length > 0 && email.trim().length > 0;

  if (!user) {
    return (
      <View style={[styles.screen, styles.centered, { paddingTop: insets.top }]}>
        <SubPageHeader title="Edit Profile" onBack={() => router.back()} />
        <InlineEmptyCard
          title="Not signed in"
          body="Log in to edit your profile settings."
        />
        <FullWidthButton label="← Back" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </Pressable>
        <View style={styles.profilePreview}>
          <View
            style={[
              styles.avatar,
              {
                backgroundColor: selectedColor.bg,
                borderColor: `${selectedColor.stroke}66`,
              },
            ]}
          >
            <Daisy color={selectedColor.stroke} size={s(24)} />
          </View>
          <View>
            <Text style={styles.previewName}>{firstName.trim() || user.firstName}</Text>
            <Text style={styles.previewEmail}>{email.trim() || user.email}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>Personal</Text>

        <FormField
          label="First Name"
          value={firstName}
          onChangeText={setFirstName}
          autoCapitalize="words"
        />
        <FormField
          label="Last Name"
          value={lastName}
          onChangeText={setLastName}
          autoCapitalize="words"
        />
        <FormField
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <Text style={styles.colorSectionLabel}>Your flowr Color</Text>
        <FlowerColorPicker
          selectedName={selectedColor.name}
          onSelect={setSelectedColor}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <FullWidthButton label="Save Settings" onPress={handleSave} disabled={!canSave} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  centered: {
    paddingHorizontal: s(14),
  },
  header: {
    paddingHorizontal: s(14),
    paddingBottom: s(12),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  back: {
    fontFamily: fonts.dmSans,
    fontSize: fs(10),
    color: colors.blue,
    marginBottom: s(8),
  },
  profilePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(12),
  },
  avatar: {
    width: s(46),
    height: vs(46),
    borderRadius: s(23),
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewName: {
    fontFamily: fonts.lora,
    fontSize: fs(16),
    color: colors.navy,
  },
  previewEmail: {
    marginTop: s(1),
    fontFamily: fonts.dmSans,
    fontSize: fs(9),
    color: colors.muted,
  },
  content: {
    paddingHorizontal: s(14),
    paddingTop: s(12),
    paddingBottom: s(24),
  },
  sectionLabel: {
    fontFamily: fonts.dmSans,
    fontSize: fs(8),
    letterSpacing: s(2),
    textTransform: 'uppercase',
    color: colors.muted,
    marginBottom: s(10),
  },
  colorSectionLabel: {
    fontFamily: fonts.dmSans,
    fontSize: fs(8),
    letterSpacing: s(2),
    textTransform: 'uppercase',
    color: colors.muted,
    marginBottom: s(8),
    marginTop: s(4),
  },
  error: {
    marginBottom: s(10),
    fontFamily: fonts.dmSans,
    fontSize: fs(11),
    color: colors.danger,
  },
});
