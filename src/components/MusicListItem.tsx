import React, { useMemo } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Heart, MoreVertical } from 'lucide-react-native';
import { borderRadius, ColorTokens, typography } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { Track } from '../types/music';
import { useMusicStore } from '../store/useMusicStore';
import { TrackArtwork } from './TrackArtwork';
import { VisualizerBar } from './VisualizerBar';

interface Props {
  track: Track;
  isActive?: boolean;
  isPlaying?: boolean;
  onPress: () => void;
  onOptionsPress?: () => void;
}

function formatDuration(seconds?: number): string {
  if (!seconds || isNaN(seconds)) {
    return '--:--';
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

const MusicListItemComponent: React.FC<Props> = ({
  track,
  isActive = false,
  isPlaying = false,
  onPress,
  onOptionsPress,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const favorites = useMusicStore((s) => s.favorites);
  const toggleFavorite = useMusicStore((s) => s.toggleFavorite);
  const isFavorite = favorites.includes(track.id);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[
        styles.container,
        isActive && styles.activeContainer,
      ]}
      onPress={onPress}
    >
      {/* Artwork with playing overlay */}
      <View style={styles.artworkContainer}>
        <TrackArtwork uri={track.artwork} style={styles.artwork} iconSize={20} />
        {isActive && isPlaying && (
          <View style={styles.playingOverlay}>
            <VisualizerBar isPlaying={isPlaying} barCount={3} maxHeight={14} color="#FFFFFF" />
          </View>
        )}
      </View>

      {/* Title & Artist */}
      <View style={styles.infoContainer}>
        <Text
          style={[styles.title, isActive && styles.activeTitle]}
          numberOfLines={1}
        >
          {track.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {track.artist}
          {track.album ? ` • ${track.album}` : ''}
        </Text>
      </View>

      {/* Duration & Favorite button */}
      <View style={styles.actionsContainer}>
        <Text style={styles.duration}>{formatDuration(track.duration)}</Text>

        <TouchableOpacity
          onPress={() => toggleFavorite(track.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.heartButton}
        >
          <Heart
            size={18}
            color={isFavorite ? colors.accent : colors.textMuted}
            fill={isFavorite ? colors.accent : 'transparent'}
          />
        </TouchableOpacity>

        {onOptionsPress && (
          <TouchableOpacity
            onPress={onOptionsPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.moreButton}
          >
            <MoreVertical size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

function createStyles(colors: ColorTokens) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: borderRadius.md,
      marginHorizontal: 8,
      marginVertical: 2,
    },
    activeContainer: {
      backgroundColor: colors.activeTrackBg,
      borderWidth: 1,
      borderColor: colors.activeTrackBorder,
    },
    artworkContainer: {
      width: 48,
      height: 48,
      borderRadius: borderRadius.md,
      overflow: 'hidden',
      backgroundColor: colors.surfaceCard,
    },
    artwork: {
      width: '100%',
      height: '100%',
    },
    playingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(139, 92, 246, 0.65)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    infoContainer: {
      flex: 1,
      marginLeft: 14,
      marginRight: 8,
    },
    title: {
      ...typography.bodyLarge,
      color: colors.text,
      fontSize: 15,
      fontWeight: '600',
    },
    activeTitle: {
      color: colors.primaryLight,
      fontWeight: '700',
    },
    artist: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      marginTop: 3,
    },
    actionsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    duration: {
      ...typography.bodySmall,
      color: colors.textMuted,
      fontSize: 12,
    },
    heartButton: {
      padding: 4,
    },
    moreButton: {
      padding: 4,
    },
  });
}

// Memoized: this renders once per row in potentially long FlatLists (library,
// playlists, favorites). Combined with the store selectors above, a row now
// only re-renders when its own props or the favorites list actually change —
// not on every unrelated store update (queue, playback progress, etc.).
export const MusicListItem = React.memo(MusicListItemComponent);

export default MusicListItem;
