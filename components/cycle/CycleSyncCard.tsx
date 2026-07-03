import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Toggle } from '@/components/ui/Toggle';
import { colors } from '@/constants/colors';
import { plannerCard, plannerCornerRadius } from '@/constants/plannerCardStyles';
import { fonts } from '@/constants/typography';
import { s, fs } from '@/lib/scale';

type CycleSyncCardProps = {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  onPress?: () => void;
};

export function CycleSyncCard({ enabled, onToggle, onPress }: CycleSyncCardProps) {
  return (
    <Pressable onPress={onPress} style={[styles.card, plannerCard()]}>
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
    padding: s(12),
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(10),
  },
  copy: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.cardTitle,
    fontSize: fs(14),
    color: colors.navy,
  },
  subtitle: {
    marginTop: s(1),
    fontFamily: fonts.dmSans,
    fontSize: fs(10),
    color: colors.blue,
  },
});
