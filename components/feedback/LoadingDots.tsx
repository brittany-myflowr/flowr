import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

type LoadingDotsProps = {
  color?: string;
  size?: number;
};

export function LoadingDots({ color = 'rgba(255,255,255,0.4)', size = 6 }: LoadingDotsProps) {
  const opacities = useRef([0, 1, 2].map(() => new Animated.Value(0.4))).current;

  useEffect(() => {
    const animations = opacities.map((opacity, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 200),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.4,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ),
    );

    animations.forEach((animation) => animation.start());
    return () => animations.forEach((animation) => animation.stop());
  }, [opacities]);

  return (
    <View style={styles.row}>
      {opacities.map((opacity, index) => (
        <Animated.View
          key={index}
          style={[
            styles.dot,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: color,
              opacity,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
  },
  dot: {},
});
