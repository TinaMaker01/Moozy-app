import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Heart, MoreVertical } from 'lucide-react-native';
import { borderRadius, colors, typography } from '../theme';
import { Track } from '../types/music';
import { useMusicStore } from '../store/useMusicStore';
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

export const MusicListItem: React.FC<Props> = ({
  track,
  isActive = false,
  isPlaying = false,
  onPress,
  onOptionsPress,
}) => {
  const { favorites, toggleFavorite } = useMusicStore();
  const isFavorite = favorites.includes(track.id);

  const artworkUri =
    track.artwork ||
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80';

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
        <Image source={{ uri: artworkUri }} style={styles.artwork} />
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

const styles = StyleSheet.create({
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

export default MusicListItem;
