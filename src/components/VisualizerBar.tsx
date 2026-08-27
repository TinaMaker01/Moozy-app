import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { colors } from '../theme';

interface Props {
  isPlaying: boolean;
  barCount?: number;
  color?: string;
  maxHeight?: number;
}

export const VisualizerBar: React.FC<Props> = ({
  isPlaying,
  barCount = 4,
  color = colors.primary,
  maxHeight = 24,
}) => {
  const animatedValues = useRef<Animated.Value[]>(
    Array.from({ length: barCount }, () => new Animated.Value(0.3))
  ).current;

  useEffect(() => {
    let animations: Animated.CompositeAnimation[] = [];

    if (isPlaying) {
      animations = animatedValues.map((anim, index) => {
        const duration = 300 + (index % 3) * 150 + Math.random() * 100;
        return Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 0.2 + Math.random() * 0.8,
              duration,
              useNativeDriver: false,
            }),
            Animated.timing(anim, {
              toValue: 0.2,
              duration,
              useNativeDriver: false,
            }),
          ])
        );
      });

      animations.forEach((a) => a.start());
    } else {
      animatedValues.forEach((anim) => {
        Animated.timing(anim, {
          toValue: 0.25,
          duration: 250,
          useNativeDriver: false,
        }).start();
      });
    }

    return () => {
      animations.forEach((a) => a.stop());
    };
  }, [isPlaying, animatedValues]);

  return (
    <View style={styles.container}>
      {animatedValues.map((anim, index) => {
        const height = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [4, maxHeight],
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.bar,
              {
                height,
                backgroundColor: color,
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    height: 30,
  },
  bar: {
    width: 3.5,
    borderRadius: 2,
  },
});
