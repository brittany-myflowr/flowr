import { useEffect, useMemo, useRef } from 'react';
import { Animated, Dimensions, Modal, StyleSheet, View } from 'react-native';

import { s } from '@/lib/scale';

/** Pastel brand palette — cream, peach, blush, periwinkle, lavender, sage. */
const COLORS = [
  '#f0c0d0',
  '#e8a0b0',
  '#ecb090',
  '#e8d4a8',
  '#c0b0d8',
  '#9eb0d4',
  '#b0c8e0',
  '#c4d4b8',
  '#9cb088',
  '#eee8f2',
  '#e8eef8',
  '#fceee0',
];
const PARTICLE_COUNT = 96;
const DURATION_MS = 3400;

type ConfettiBurstProps = {
  active: boolean;
  onFinished?: () => void;
};

type ParticleSpec = {
  id: number;
  color: string;
  size: number;
  startX: number;
  startY: number;
  driftX: number;
  fallY: number;
  delay: number;
  spin: number;
};

function pseudoRandom(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function buildParticles(width: number, height: number): ParticleSpec[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, index) => {
    const spreadX = pseudoRandom(index + 1);
    const spreadY = pseudoRandom(index + 11);
    const drift = pseudoRandom(index + 21);

    return {
      id: index,
      color: COLORS[index % COLORS.length],
      size: s(5 + (index % 5)),
      startX: spreadX * width,
      startY: -s(32) - spreadY * height * 0.18,
      driftX: (drift - 0.5) * width * 0.28,
      fallY: height * (0.95 + pseudoRandom(index + 31) * 0.22),
      delay: (index % 10) * 28,
      spin: (index % 2 === 0 ? 1 : -1) * (180 + (index % 4) * 120),
    };
  });
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

    Animated.stagger(8, animations).start(({ finished }) => {
      if (finished) {
        finishedRef.current?.();
      }
    });
  }, [active, particles, progress]);

  if (!active) return null;

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent>
      <View pointerEvents="none" style={styles.overlay}>
        {particles.map((particle, index) => {
          const value = progress[index];

          const translateY = value.interpolate({
            inputRange: [0, 1],
            outputRange: [particle.startY, particle.fallY],
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
            inputRange: [0, 0.1, 0.85, 1],
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
                  top: 0,
                  opacity,
                  transform: [{ translateX }, { translateY }, { rotate }],
                },
              ]}
            />
          );
        })}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  particle: {
    position: 'absolute',
  },
});
