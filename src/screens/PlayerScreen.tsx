import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AudioSlider } from '../components/AudioSlider';
import {
  State,
  useActiveTrack,
  usePlaybackState,
  useProgress,
} from 'react-native-track-player';
import {
  ChevronDown,
  Disc,
  Heart,
  ListMusic,
  Moon,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Sliders,
  Sparkles,
} from 'lucide-react-native';
import { borderRadius, ColorTokens, shadows, typography } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { AudioService } from '../services/audioService';
import { useMusicStore } from '../store/useMusicStore';
import { RootStackParamList } from '../types/navigation';
import { AnimatedVinyl } from '../components/AnimatedVinyl';
import { VisualizerBar } from '../components/VisualizerBar';
import { SleepTimerModal } from '../components/SleepTimerModal';
import { QueueModal } from '../components/QueueModal';
import { getTrackPalette } from '../utils/artworkColors';

const { width } = Dimensions.get('window');
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) {
    return '0:00';
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export const PlayerScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [displayMode, setDisplayMode] = useState<'vinyl' | 'card'>('vinyl');
  const [sleepModalVisible, setSleepModalVisible] = useState(false);
  const [queueModalVisible, setQueueModalVisible] = useState(false);
  const [isSliding, setIsSliding] = useState(false);
  const [slidingValue, setSlidingValue] = useState(0);

  const activeTrack = useActiveTrack();
  const playbackState = usePlaybackState();
  const { position, duration } = useProgress();

  const currentTrack = useMusicStore((s) => s.currentTrack);
  const favorites = useMusicStore((s) => s.favorites);
  const isShuffle = useMusicStore((s) => s.isShuffle);
  const repeatMode = useMusicStore((s) => s.repeatMode);
  const toggleFavorite = useMusicStore((s) => s.toggleFavorite);
  const toggleShuffle = useMusicStore((s) => s.toggleShuffle);
  const cycleRepeatMode = useMusicStore((s) => s.cycleRepeatMode);

  const track = activeTrack || currentTrack;
  const isPlaying = playbackState.state === State.Playing;
  // Computed before the early return below so hook order stays stable across renders.
  const palette = useMemo(
    () => getTrackPalette(track?.title || track?.id || 'Moozy'),
    [track?.title, track?.id]
  );

  if (!track) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <Text style={styles.noTrackText}>Aucun morceau sélectionné</Text>
      </View>
    );
  }

  const isFavorite = favorites.includes(track.id);
  const currentPos = isSliding ? slidingValue : position;
  const effectiveDuration = duration > 0 ? duration : (track.duration || 180);

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom + 12 }]}>
      {/* Dynamic Adaptive Ambient Glow Orbs */}
      <View
        style={[
          styles.ambientOrbTop,
          { backgroundColor: palette.glowPrimary },
        ]}
      />
      <View
        style={[
          styles.ambientOrbBottom,
          { backgroundColor: palette.glowSecondary },
        ]}
      />

      {/* Top Action Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.circleBtn}
          onPress={() => navigation.goBack()}
        >
          <ChevronDown size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.topBarCenter}>
          <Text style={styles.nowPlayingSubtitle}>LECTURE EN COURS</Text>
          <Text style={styles.nowPlayingAlbum} numberOfLines={1}>
            {track.album || 'Moozy Music'}
          </Text>
        </View>

        <View style={styles.topBarRight}>
          <TouchableOpacity
            style={styles.circleBtn}
            onPress={() => setDisplayMode(displayMode === 'vinyl' ? 'card' : 'vinyl')}
          >
            <Disc size={20} color={displayMode === 'vinyl' ? palette.primary : colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.circleBtn}
            onPress={() => setQueueModalVisible(true)}
          >
            <ListMusic size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Visualizer & Ambient Art */}
      <View style={styles.artworkArea}>
        <AnimatedVinyl
          isPlaying={isPlaying}
          artworkUri={track.artwork}
          size={Math.min(width * 0.72, 290)}
          mode={displayMode}
          glowColor={palette.glowPrimary}
        />
      </View>

      {/* Live Audio Visualizer Bar */}
      <View style={styles.visualizerContainer}>
        <VisualizerBar
          isPlaying={isPlaying}
          barCount={18}
          color={palette.primary}
          maxHeight={22}
        />
      </View>

      {/* Track Metadata and Like Button */}
      <View style={styles.metaRow}>
        <View style={styles.metaInfo}>
          <View style={styles.badgeRow}>
            <View style={styles.hiResBadge}>
              <Sparkles size={10} color={palette.primary} />
              <Text style={[styles.hiResText, { color: palette.primary }]}>
                HI-RES LOSSLESS
              </Text>
            </View>
            {track.genre && (
              <Text style={styles.genreText}>• {track.genre}</Text>
            )}
          </View>
          <Text style={styles.title} numberOfLines={1}>
            {track.title}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {track.artist}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(track.id)}
        >
          <Heart
            size={26}
            color={isFavorite ? colors.accent : colors.textSecondary}
            fill={isFavorite ? colors.accent : 'transparent'}
          />
        </TouchableOpacity>
      </View>

      {/* Audio Progress Slider */}
      <View style={styles.progressContainer}>
        <AudioSlider
          style={styles.slider}
          minimumValue={0}
          maximumValue={effectiveDuration}
          value={currentPos}
          minimumTrackTintColor={palette.primary}
          maximumTrackTintColor={colors.progressBarBg}
          thumbTintColor={palette.primary}
          onValueChange={(val) => {
            setIsSliding(true);
            setSlidingValue(val);
          }}
          onSlidingComplete={async (val) => {
            setIsSliding(false);
            await AudioService.seekTo(val);
          }}
        />
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{formatTime(currentPos)}</Text>
          <Text style={styles.timeText}>
            -{formatTime(effectiveDuration - currentPos)}
          </Text>
        </View>
      </View>

      {/* Main Playback Deck */}
      <View style={styles.controlsRow}>
        {/* Shuffle */}
        <TouchableOpacity onPress={toggleShuffle} style={styles.sideControlBtn}>
          <Shuffle
            size={22}
            color={isShuffle ? palette.primary : colors.textMuted}
          />
        </TouchableOpacity>

        {/* Previous */}
        <TouchableOpacity
          onPress={() => AudioService.skipToPrevious()}
          style={styles.mainControlBtn}
        >
          <SkipBack size={28} color={colors.text} />
        </TouchableOpacity>

        {/* Play/Pause Pulsing Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => AudioService.togglePlayPause()}
          style={[
            styles.giantPlayBtn,
            { backgroundColor: palette.primary },
            shadows.glow(palette.glowPrimary),
          ]}
        >
          {isPlaying ? (
            <Pause size={32} color="#FFF" fill="#FFF" />
          ) : (
            <Play size={32} color="#FFF" fill="#FFF" style={styles.playIconOffset} />
          )}
        </TouchableOpacity>

        {/* Next */}
        <TouchableOpacity
          onPress={() => AudioService.skipToNext()}
          style={styles.mainControlBtn}
        >
          <SkipForward size={28} color={colors.text} />
        </TouchableOpacity>

        {/* Repeat */}
        <TouchableOpacity onPress={cycleRepeatMode} style={styles.sideControlBtn}>
          {repeatMode === 'track' ? (
            <Repeat1 size={22} color={palette.primary} />
          ) : (
            <Repeat
              size={22}
              color={repeatMode === 'queue' ? palette.primary : colors.textMuted}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* Bottom Quick Tools */}
      <View style={styles.bottomTools}>
        <TouchableOpacity
          style={styles.toolBtn}
          onPress={() => navigation.navigate('Equalizer')}
        >
          <Sliders size={18} color={colors.textSecondary} />
          <Text style={styles.toolText}>Égaliseur</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolBtn}
          onPress={() => setQueueModalVisible(true)}
        >
          <ListMusic size={18} color={colors.textSecondary} />
          <Text style={styles.toolText}>File d'attente</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolBtn}
          onPress={() => setSleepModalVisible(true)}
        >
          <Moon size={18} color={colors.textSecondary} />
          <Text style={styles.toolText}>Sommeil</Text>
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <SleepTimerModal
        visible={sleepModalVisible}
        onClose={() => setSleepModalVisible(false)}
      />

      <QueueModal
        visible={queueModalVisible}
        onClose={() => setQueueModalVisible(false)}
      />
    </View>
  );
};

function createStyles(colors: ColorTokens) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: 'space-between',
      position: 'relative',
      overflow: 'hidden',
    },
    ambientOrbTop: {
      position: 'absolute',
      top: -80,
      right: -80,
      width: 260,
      height: 260,
      borderRadius: 130,
      opacity: 0.6,
    },
    ambientOrbBottom: {
      position: 'absolute',
      bottom: -60,
      left: -60,
      width: 240,
      height: 240,
      borderRadius: 120,
      opacity: 0.45,
    },
    noTrackText: {
      ...typography.bodyLarge,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 40,
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 10,
      zIndex: 10,
    },
    topBarCenter: {
      alignItems: 'center',
    },
    nowPlayingSubtitle: {
      ...typography.caption,
      color: colors.textMuted,
      fontSize: 10,
    },
    nowPlayingAlbum: {
      ...typography.bodySmall,
      color: colors.text,
      fontWeight: '600',
      marginTop: 2,
    },
    topBarRight: {
      flexDirection: 'row',
      gap: 8,
    },
    circleBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.surfaceCard,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.borderGlass,
    },
    artworkArea: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      zIndex: 5,
    },
    visualizerContainer: {
      marginVertical: 4,
      zIndex: 5,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 24,
      marginTop: 8,
      zIndex: 5,
    },
    metaInfo: {
      flex: 1,
      marginRight: 16,
    },
    badgeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 4,
    },
    hiResBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.surfaceCard,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: borderRadius.xs,
      borderWidth: 1,
      borderColor: colors.borderGlass,
    },
    hiResText: {
      ...typography.badge,
      fontSize: 9,
    },
    genreText: {
      ...typography.bodySmall,
      color: colors.textMuted,
      fontSize: 11,
    },
    title: {
      ...typography.hero,
      color: colors.text,
      fontSize: 22,
      fontWeight: '700',
    },
    artist: {
      ...typography.bodyLarge,
      color: colors.textSecondary,
      fontSize: 15,
      marginTop: 3,
    },
    favoriteButton: {
      padding: 6,
    },
    progressContainer: {
      paddingHorizontal: 20,
      marginTop: 8,
      zIndex: 5,
    },
    slider: {
      width: '100%',
      height: 36,
    },
    timeRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 6,
      marginTop: -6,
    },
    timeText: {
      ...typography.bodySmall,
      color: colors.textMuted,
      fontSize: 12,
    },
    controlsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 24,
      marginVertical: 10,
      zIndex: 5,
    },
    sideControlBtn: {
      padding: 10,
    },
    mainControlBtn: {
      padding: 8,
    },
    giantPlayBtn: {
      width: 68,
      height: 68,
      borderRadius: 34,
      alignItems: 'center',
      justifyContent: 'center',
    },
    bottomTools: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      paddingTop: 6,
      zIndex: 5,
    },
    toolBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.surfaceCard,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: borderRadius.round,
      borderWidth: 1,
      borderColor: colors.borderGlass,
    },
    toolText: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    playIconOffset: {
      marginLeft: 3,
    },
  });
}

export default PlayerScreen;
