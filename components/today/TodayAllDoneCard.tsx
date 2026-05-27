import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Daisy } from '@/components/brand';
import { colors } from '@/constants/colors';
import { todayGlassCard } from '@/constants/todayCardStyles';
import { fonts } from '@/constants/typography';
import { fs, s } from '@/lib/scale';

type TodayAllDoneCardProps = {
  firstName?: string;
  streak: number;
};

export function TodayAllDoneCard({ firstName, streak }: TodayAllDoneCardProps) {
  const router = useRouter();
  const title = firstName?.trim() ? `You did it, ${firstName.trim()}.` : 'You did it.';

  return (
    <View style={[styles.card, todayGlassCard(undefined, 'hero')]}>
      <View style={styles.iconWrap}>
        <Daisy color={colors.blue} size={s(36)} />
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>Everything scheduled for today is complete.</Text>

      {streak > 0 ? (
        <View style={styles.streakPill}>
          <Text style={styles.streakText}>
            {streak}-day streak
          </Text>
        </View>
      ) : null}

      <Pressable onPress={() => router.push('/(tabs)/calendar')} style={styles.linkWrap}>
        <Text style={styles.link}>View calendar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: s(18),
    alignItems: 'center',
    marginBottom: s(10),
  },
  iconWrap: {
    marginBottom: s(10),
  },
  title: {
    fontFamily: fonts.cardTitle,
    fontSize: fs(16),
    color: colors.navy,
    textAlign: 'center',
    marginBottom: s(6),
  },
  body: {
    fontFamily: fonts.dmSans,
    fontSize: fs(10),
    color: colors.gray,
    textAlign: 'center',
    lineHeight: fs(15),
    marginBottom: s(10),
  },
  streakPill: {
    backgroundColor: colors.light,
    borderRadius: s(16),
    paddingHorizontal: s(12),
    paddingVertical: s(5),
    marginBottom: s(8),
  },
  streakText: {
    fontFamily: fonts.dmSansSemiBold,
    fontSize: fs(9),
    fontWeight: '600',
    color: colors.blue,
  },
  linkWrap: {
    paddingVertical: s(4),
  },
  link: {
    fontFamily: fonts.dmSans,
    fontSize: fs(9),
    color: colors.blue,
    textDecorationLine: 'underline',
  },
});
