import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Toggle } from '@/components/ui/Toggle';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';

type CycleSyncCardProps = {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  onPress?: () => void;
};

export function CycleSyncCard({ enabled, onToggle, onPress }: CycleSyncCardProps) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.copy}>
        <Text style={styles.title}>Enable Cycle Syncing</Text>
        <Text style={styles.subtitle}>For those who track a hormonal cycle</Text>
      </View>
      <Toggle
        value={enabled}
        onValueChange={(value) => {
          onToggle(value);
        }}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  copy: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.lora,
    fontSize: 14,
    color: colors.navy,
  },
  subtitle: {
    marginTop: 1,
    fontFamily: fonts.dmSans,
    fontSize: 10,
    color: colors.blue,
  },
});
