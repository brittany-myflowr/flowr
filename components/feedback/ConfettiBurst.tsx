import { useEffect, useMemo, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';

import { s } from '@/lib/scale';

const COLORS = ['#f5c842', '#e8854a', '#c95c4a', '#a87898', '#7ba7c2', '#fda4af', '#ffffff'];
const PARTICLE_COUNT = 28;
const DURATION_MS = 2600;

type ConfettiBurstProps = {
  active: boolean;
  onFinished?: () => void;
};

type ParticleSpec = {
  id: number;
  color: string;
  size: number;
  startX: number;
  driftX: number;
  fallY: number;
  delay: number;
  spin: number;
};

function buildParticles(width: number, height: number): ParticleSpec[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, index) => ({
    id: index,
    color: COLORS[index % COLORS.length],
    size: s(4 + (index % 3)),
    startX: width * (0.35 + (index / PARTICLE_COUNT) * 0.3),
    driftX: (index % 2 === 0 ? -1 : 1) * (s(20) + (index % 5) * s(8)),
    fallY: height * (0.45 + (index % 4) * 0.08),
    delay: (index % 6) * 40,
    spin: (index % 2 === 0 ? 1 : -1) * (180 + (index % 3) * 90),
  }));
}

export function ConfettiBurst({ active, onFinished }: ConfettiBurstProps) {
  const { width, height } = Dimensions.get('window');
  const particles = useMemo(() => buildParticles(width, height), [width, height]);
  const progress = useRef(particles.map(() => new Animated.Value(0))).current;
  const finishedRef = useRef(onFinished);
  finishedRef.current = onFinished;

  useEffect(() => {
    if (!active) {
      progress.forEach((value) => value.setValue(0));
      return;
    }

    const animations = progress.map((value, index) =>
      Animated.timing(value, {
        toValue: 1,
        duration: DURATION_MS,
        delay: particles[index].delay,
        useNativeDriver: true,
      }),
    );

    Animated.stagger(18, animations).start(({ finished }) => {
      if (finished) {
        finishedRef.current?.();
      }
    });
  }, [active, particles, progress]);

  if (!active) return null;

  return (
    <View pointerEvents="none" style={styles.overlay}>
      {particles.map((particle, index) => {
        const value = progress[index];

        const translateY = value.interpolate({
          inputRange: [0, 1],
          outputRange: [-s(12), particle.fallY],
        });
        const translateX = value.interpolate({
          inputRange: [0, 1],
          outputRange: [0, particle.driftX],
        });
        const rotate = value.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', `${particle.spin}deg`],
        });
        const opacity = value.interpolate({
          inputRange: [0, 0.15, 0.85, 1],
          outputRange: [0, 1, 1, 0],
        });

        return (
          <Animated.View
            key={particle.id}
            style={[
              styles.particle,
              {
                backgroundColor: particle.color,
                width: particle.size,
                height: particle.size * (index % 3 === 0 ? 1.6 : 1),
                borderRadius: index % 4 === 0 ? particle.size : s(1),
                left: particle.startX,
                top: height * 0.18,
                opacity,
                transform: [{ translateX }, { translateY }, { rotate }],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
  },
  particle: {
    position: 'absolute',
  },
});
