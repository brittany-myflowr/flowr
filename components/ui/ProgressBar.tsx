import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { fonts } from '@/constants/typography';
import { fs, s } from '@/lib/scale';

type ProgressBarProps = {
  percent: number;
  total?: number;
  trackColor?: string;
  fillColor?: string;
  labelColor?: string;
};

export function ProgressBar({
  percent,
  total,
  trackColor = 'rgba(255,255,255,0.22)',
  fillColor = 'rgba(255,255,255,0.95)',
  labelColor = 'rgba(255,255,255,0.9)',
}: ProgressBarProps) {
  const isEmpty = total === 0;
  const clamped = Math.min(100, Math.max(0, percent));
  const widthAnim = useRef(new Animated.Value(clamped)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: clamped,
      duration: 350,
      useNativeDriver: false,
    }).start();
  }, [clamped, widthAnim]);

  const fillWidth = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.row}>
      <View style={[styles.track, { backgroundColor: trackColor }]}>
        {!isEmpty && clamped > 0 ? (
          <Animated.View
            style={[styles.fill, { width: fillWidth, backgroundColor: fillColor }]}
          />
        ) : null}
      </View>
      <Text style={[styles.label, { color: labelColor }]}>
        {isEmpty ? '—' : `${clamped}%`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(10),
    width: '100%',
  },
  track: {
    flex: 1,
    height: s(5),
    borderRadius: s(3),
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: s(3),
  },
  label: {
    minWidth: s(28),
    fontFamily: fonts.dmSansSemiBold,
    fontSize: fs(10),
    fontWeight: '600',
    textAlign: 'right',
  },
});
