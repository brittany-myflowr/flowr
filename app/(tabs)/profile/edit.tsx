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
import { FlowerColorPicker } from '@/components/profile/FlowerColorPicker';
import { FullWidthButton } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { defaultFlowerColor } from '@/constants/flowerColors';
import { getFlowerColorByName } from '@/lib/flowerColor';
import { useAuth } from '@/providers/AppStore';
import { useToast } from '@/providers/ToastProvider';

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

  if (!user) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
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
            <Daisy color={selectedColor.stroke} size={24} />
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

        <FullWidthButton label="Save Settings" onPress={handleSave} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  back: {
    fontFamily: fonts.dmSans,
    fontSize: 10,
    color: colors.blue,
    marginBottom: 8,
  },
  profilePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewName: {
    fontFamily: fonts.lora,
    fontSize: 16,
    color: colors.navy,
  },
  previewEmail: {
    marginTop: 1,
    fontFamily: fonts.dmSans,
    fontSize: 9,
    color: colors.muted,
  },
  content: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 24,
  },
  sectionLabel: {
    fontFamily: fonts.dmSans,
    fontSize: 8,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.muted,
    marginBottom: 10,
  },
  colorSectionLabel: {
    fontFamily: fonts.dmSans,
    fontSize: 8,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.muted,
    marginBottom: 8,
    marginTop: 4,
  },
  error: {
    marginBottom: 10,
    fontFamily: fonts.dmSans,
    fontSize: 11,
    color: colors.danger,
  },
});
