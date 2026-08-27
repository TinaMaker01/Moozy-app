import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  State,
  useActiveTrack,
  usePlaybackState,
  useProgress,
} from 'react-native-track-player';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pause, Play, SkipForward } from 'lucide-react-native';
import { borderRadius, colors, shadows, typography } from '../theme';
import { AudioService } from '../services/audioService';
import { useMusicStore } from '../store/useMusicStore';
import { RootStackParamList } from '../types/navigation';
import { VisualizerBar } from './VisualizerBar';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const MiniPlayer: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const activeTrack = useActiveTrack();
  const playbackState = usePlaybackState();
  const { position, duration } = useProgress();
  const currentTrack = useMusicStore((s) => s.currentTrack);

  const track = activeTrack || currentTrack;
  const isPlaying = playbackState.state === State.Playing;

  if (!track) {
    return null;
  }

  const progressPercent = duration > 0 ? (position / duration) * 100 : 0;
  const artworkUri =
    track.artwork ||
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80';

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={() => navigation.navigate('Player')}
      style={[styles.wrapper, { marginBottom: insets.bottom + 8 }]}
    >
      {/* Top progress line */}
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
      </View>

      <View style={styles.container}>
        {/* Track Artwork */}
        <View style={styles.artworkContainer}>
          <Image source={{ uri: artworkUri }} style={styles.artwork} />
          {isPlaying && (
            <View style={styles.visualizerOverlay}>
              <VisualizerBar isPlaying={isPlaying} barCount={3} maxHeight={12} color="#FFFFFF" />
            </View>
          )}
        </View>

        {/* Track Title & Artist */}
        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {track.title}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {track.artist}
          </Text>
        </View>

        {/* Action Controls */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={styles.playButton}
            onPress={(e) => {
              e.stopPropagation();
              AudioService.togglePlayPause();
            }}
          >
            {isPlaying ? (
              <Pause size={20} color={colors.text} fill={colors.text} />
            ) : (
              <Play size={20} color={colors.text} fill={colors.text} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={(e) => {
              e.stopPropagation();
              AudioService.skipToNext();
            }}
          >
            <SkipForward size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 12,
    // marginBottom is set inline (insets.bottom + 8) to clear the transparent
    // edge-to-edge gesture/nav bar — see the JSX usage above.
    borderRadius: borderRadius.lg,
    backgroundColor: colors.playerBarBg,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    overflow: 'hidden',
    ...shadows.soft,
  },
  progressBarBackground: {
    height: 2.5,
    backgroundColor: colors.progressBarBg,
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  artworkContainer: {
    position: 'relative',
    width: 46,
    height: 46,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  artwork: {
    width: '100%',
    height: '100%',
  },
  visualizerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
    justifyContent: 'center',
  },
  title: {
    ...typography.bodyLarge,
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  artist: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.glow(colors.primaryGlow),
  },
  skipButton: {
    padding: 6,
  },
});
