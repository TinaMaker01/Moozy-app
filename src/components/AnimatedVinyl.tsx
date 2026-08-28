import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  View,
} from 'react-native';
import { borderRadius, ColorTokens, shadows } from '../theme';
import { useTheme } from '../theme/ThemeContext';

interface Props {
  isPlaying: boolean;
  artworkUri?: string;
  size?: number;
  mode?: 'vinyl' | 'card';
  glowColor?: string;
}

export const AnimatedVinyl: React.FC<Props> = ({
  isPlaying,
  artworkUri,
  size = 280,
  mode = 'vinyl',
  glowColor,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const rotationLoop = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (isPlaying) {
      // Start or resume rotation
      rotationLoop.current = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 12000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      rotationLoop.current.start();

      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start();
    } else {
      if (rotationLoop.current) {
        rotationLoop.current.stop();
      }
      Animated.spring(scaleAnim, {
        toValue: 0.92,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }
  }, [isPlaying, rotateAnim, scaleAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const defaultImage =
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80';

  if (mode === 'card') {
    return (
      <View style={[styles.cardContainer, { width: size, height: size }]}>
        <View style={[styles.glowBehind, { backgroundColor: glowColor || colors.primaryGlow }]} />
        <Animated.View
          style={[
            styles.cardWrapper,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Image
            source={{ uri: artworkUri || defaultImage }}
            style={styles.cardImage}
            resizeMode="cover"
          />
        </Animated.View>
      </View>
    );
  }

  // Vinyl Mode
  return (
    <View style={[styles.vinylOuter, { width: size, height: size }]}>
      {/* Dynamic Ambient Glow Behind Vinyl */}
      <View style={[styles.glowBehind, { backgroundColor: glowColor || colors.primaryGlow }]} />

      <Animated.View
        style={[
          styles.vinylDisc,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            transform: [{ rotate: spin }, { scale: scaleAnim }],
          },
        ]}
      >
        {/* Grooves */}
        <View style={[styles.groove, { width: size * 0.85, height: size * 0.85, borderRadius: (size * 0.85) / 2 }]} />
        <View style={[styles.groove, { width: size * 0.7, height: size * 0.7, borderRadius: (size * 0.7) / 2 }]} />

        {/* Center Artwork */}
        <View
          style={[
            styles.centerArtworkWrapper,
            {
              width: size * 0.5,
              height: size * 0.5,
              borderRadius: (size * 0.5) / 2,
            },
          ]}
        >
          <Image
            source={{ uri: artworkUri || defaultImage }}
            style={styles.centerImage}
            resizeMode="cover"
          />
          {/* Vinyl center spindle hole */}
          <View style={styles.spindleHole} />
        </View>
      </Animated.View>
    </View>
  );
};

function createStyles(colors: ColorTokens) {
  return StyleSheet.create({
    cardContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
    },
    cardWrapper: {
      width: '100%',
      height: '100%',
      borderRadius: borderRadius.xxl,
      overflow: 'hidden',
      borderWidth: 1.5,
      borderColor: colors.borderGlass,
      ...shadows.soft,
    },
    cardImage: {
      width: '100%',
      height: '100%',
    },
    vinylOuter: {
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
    },
    glowBehind: {
      position: 'absolute',
      width: '90%',
      height: '90%',
      borderRadius: 9999,
      filter: 'blur(30px)',
      opacity: 0.8,
    },
    // The vinyl disc itself stays a dark physical-media black in both themes —
    // only the glow/border around it (above) follows Light/Dark/System.
    vinylDisc: {
      backgroundColor: '#0F121A',
      borderWidth: 4,
      borderColor: '#1F2636',
      alignItems: 'center',
      justifyContent: 'center',
      ...shadows.soft,
    },
    groove: {
      position: 'absolute',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    centerArtworkWrapper: {
      overflow: 'hidden',
      borderWidth: 4,
      borderColor: '#080A0F',
      alignItems: 'center',
      justifyContent: 'center',
    },
    centerImage: {
      width: '100%',
      height: '100%',
    },
    spindleHole: {
      position: 'absolute',
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: '#080A0F',
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
  });
}
