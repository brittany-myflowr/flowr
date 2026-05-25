import { StyleSheet, Text, View } from 'react-native';

import { Daisy } from '@/components/brand';
import { FullWidthButton } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';

type FirstRoutineCardProps = {
  onGetStarted?: () => void;
};

export function FirstRoutineCard({ onGetStarted }: FirstRoutineCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Daisy color={colors.blue} size={44} />
      </View>
      <Text style={styles.title}>Build your first routine</Text>
      <Text style={styles.description}>
        Routines are collections of steps you do regularly. We&apos;ll walk you through
        creating yours.
      </Text>
      <FullWidthButton label="Get Started" onPress={onGetStarted} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  iconWrap: {
    marginBottom: 12,
  },
  title: {
    fontFamily: fonts.lora,
    fontSize: 18,
    color: colors.navy,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  description: {
    fontFamily: fonts.dmSans,
    fontSize: 11,
    color: colors.gray,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 18,
  },
});
