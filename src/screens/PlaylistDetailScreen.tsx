import React, { useMemo } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ChevronLeft, Play, Shuffle } from 'lucide-react-native';
import { borderRadius, ColorTokens, shadows, typography } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useMusicStore } from '../store/useMusicStore';
import { RootStackParamList } from '../types/navigation';
import { MusicListItem } from '../components/MusicListItem';
import { TrackArtwork } from '../components/TrackArtwork';
import { EmptyState } from '../components/states/EmptyState';

type PlaylistDetailRouteProp = RouteProp<RootStackParamList, 'PlaylistDetail'>;

export const PlaylistDetailScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<PlaylistDetailRouteProp>();
  const { playlistId } = route.params;
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const tracks = useMusicStore((s) => s.tracks);
  const currentTrack = useMusicStore((s) => s.currentTrack);
  const playTrack = useMusicStore((s) => s.playTrack);
  // Looked up live by id (rather than passed as a route param snapshot) so
  // a rename or a track added/removed elsewhere shows up immediately here.
  const playlist = useMusicStore((s) => s.playlists.find((p) => p.id === playlistId));

  const playlistTracks = useMemo(
    () => (playlist ? tracks.filter((t) => playlist.trackIds.includes(t.id)) : []),
    [tracks, playlist]
  );

  if (!playlist) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Playlist</Text>
          <View style={styles.placeholderBtn} />
        </View>
        <EmptyState
          title="Playlist introuvable"
          message="Elle a peut-être été supprimée."
        />
      </View>
    );
  }

  const handlePlayAll = () => {
    if (playlistTracks.length > 0) {
      playTrack(playlistTracks[0], playlistTracks);
    }
  };

  const handleShufflePlay = () => {
    if (playlistTracks.length > 0) {
      const shuffled = [...playlistTracks].sort(() => Math.random() - 0.5);
      playTrack(shuffled[0], shuffled);
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {playlist.name}
        </Text>
        <View style={styles.placeholderBtn} />
      </View>

      <FlatList
        data={playlistTracks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.heroSection}>
            <TrackArtwork uri={playlist.artwork} style={styles.artwork} iconSize={48} />
            <Text style={styles.playlistTitle}>{playlist.name}</Text>
            {playlist.description && (
              <Text style={styles.playlistDesc}>{playlist.description}</Text>
            )}
            <Text style={styles.trackCount}>
              {playlistTracks.length} morceau(x)
            </Text>

            {/* Action Buttons */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.playAllBtn}
                onPress={handlePlayAll}
              >
                <Play size={18} color="#FFF" fill="#FFF" />
                <Text style={styles.playAllText}>Tout Lire</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shuffleBtn}
                onPress={handleShufflePlay}
              >
                <Shuffle size={18} color={colors.textSecondary} />
                <Text style={styles.shuffleText}>Aléatoire</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Aucun morceau dans cette playlist.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <MusicListItem
            track={item}
            isActive={currentTrack?.id === item.id}
            onPress={() => playTrack(item, playlistTracks)}
          />
        )}
      />
    </View>
  );
};

function createStyles(colors: ColorTokens) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    backBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.surfaceCard,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.borderGlass,
    },
    placeholderBtn: {
      width: 38,
    },
    headerTitle: {
      ...typography.h2,
      color: colors.text,
      fontSize: 17,
    },
    listContent: {
      paddingBottom: 120,
    },
    heroSection: {
      alignItems: 'center',
      paddingVertical: 20,
      paddingHorizontal: 24,
    },
    artwork: {
      width: 180,
      height: 180,
      borderRadius: borderRadius.xl,
      backgroundColor: colors.surfaceCard,
      marginBottom: 16,
      ...shadows.soft,
    },
    playlistTitle: {
      ...typography.hero,
      color: colors.text,
      fontSize: 22,
      textAlign: 'center',
    },
    playlistDesc: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 4,
    },
    trackCount: {
      ...typography.caption,
      color: colors.textMuted,
      marginTop: 6,
    },
    actionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginTop: 20,
    },
    playAllBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: borderRadius.round,
      ...shadows.glow(colors.primaryGlow),
    },
    playAllText: {
      ...typography.bodyLarge,
      color: '#FFF',
      fontWeight: '700',
      fontSize: 14,
    },
    shuffleBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: colors.surfaceCard,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: borderRadius.round,
      borderWidth: 1,
      borderColor: colors.borderGlass,
    },
    shuffleText: {
      ...typography.bodyLarge,
      color: colors.textSecondary,
      fontWeight: '600',
      fontSize: 14,
    },
    emptyState: {
      padding: 40,
      alignItems: 'center',
    },
    emptyText: {
      ...typography.bodySmall,
      color: colors.textMuted,
    },
  });
}

export default PlaylistDetailScreen;
