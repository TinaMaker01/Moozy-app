import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import {
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  MoreVertical,
  Play,
  Shuffle,
} from 'lucide-react-native';
import { borderRadius, ColorTokens, shadows, typography } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useMusicStore } from '../store/useMusicStore';
import { RootStackParamList } from '../types/navigation';
import { Track } from '../types/music';
import { MusicListItem } from '../components/MusicListItem';
import { PlaylistFormModal } from '../components/PlaylistFormModal';
import { TrackArtwork } from '../components/TrackArtwork';
import { TrackOptionsModal } from '../components/TrackOptionsModal';
import { EmptyState } from '../components/states/EmptyState';

type PlaylistDetailRouteProp = RouteProp<RootStackParamList, 'PlaylistDetail'>;

export const PlaylistDetailScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<PlaylistDetailRouteProp>();
  const { playlistId } = route.params;
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [selectedOptionTrack, setSelectedOptionTrack] = useState<Track | null>(null);

  const tracks = useMusicStore((s) => s.tracks);
  const currentTrack = useMusicStore((s) => s.currentTrack);
  const playTrack = useMusicStore((s) => s.playTrack);
  const deletePlaylist = useMusicStore((s) => s.deletePlaylist);
  const renamePlaylist = useMusicStore((s) => s.renamePlaylist);
  const reorderPlaylistTracks = useMusicStore((s) => s.reorderPlaylistTracks);
  // Looked up live by id (rather than passed as a route param snapshot) so
  // a rename or a track added/removed elsewhere shows up immediately here.
  const playlist = useMusicStore((s) => s.playlists.find((p) => p.id === playlistId));

  // Mapped from trackIds (preserving playlist order) rather than filtering
  // the library array — filtering would silently follow the library's own
  // order and make reordering below have no visible effect. A trackId
  // whose track was removed from the device is skipped rather than
  // crashing on a lookup miss.
  const playlistTracks = useMemo(() => {
    if (!playlist) {
      return [];
    }
    const trackMap = new Map(tracks.map((t) => [t.id, t]));
    return playlist.trackIds
      .map((id) => trackMap.get(id))
      .filter((t): t is Track => !!t);
  }, [tracks, playlist]);

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

  const handleDelete = () => {
    Alert.alert(
      'Supprimer la playlist ?',
      `« ${playlist.name} » sera définitivement supprimée. Les morceaux eux-mêmes ne sont pas affectés.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            await deletePlaylist(playlist.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleOpenOptions = () => {
    Alert.alert(playlist.name, undefined, [
      { text: 'Renommer', onPress: () => setRenameModalVisible(true) },
      { text: 'Supprimer', style: 'destructive', onPress: handleDelete },
      { text: 'Annuler', style: 'cancel' },
    ]);
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
        <TouchableOpacity
          style={styles.backBtn}
          onPress={handleOpenOptions}
          accessibilityLabel="Options de la playlist"
        >
          <MoreVertical size={20} color={colors.text} />
        </TouchableOpacity>
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
        renderItem={({ item, index }) => (
          <View style={styles.trackRow}>
            <View style={styles.trackRowContent}>
              <MusicListItem
                track={item}
                isActive={currentTrack?.id === item.id}
                onPress={() => playTrack(item, playlistTracks)}
                onOptionsPress={() => setSelectedOptionTrack(item)}
              />
            </View>
            <View style={styles.reorderControls}>
              <TouchableOpacity
                style={[styles.reorderBtn, index === 0 && styles.reorderBtnDisabled]}
                disabled={index === 0}
                onPress={() => reorderPlaylistTracks(playlist.id, index, index - 1)}
                accessibilityLabel="Déplacer vers le haut"
              >
                <ChevronUp
                  size={16}
                  color={index === 0 ? colors.border : colors.textSecondary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.reorderBtn,
                  index === playlistTracks.length - 1 && styles.reorderBtnDisabled,
                ]}
                disabled={index === playlistTracks.length - 1}
                onPress={() => reorderPlaylistTracks(playlist.id, index, index + 1)}
                accessibilityLabel="Déplacer vers le bas"
              >
                <ChevronDown
                  size={16}
                  color={
                    index === playlistTracks.length - 1 ? colors.border : colors.textSecondary
                  }
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <TrackOptionsModal
        track={selectedOptionTrack}
        visible={selectedOptionTrack !== null}
        onClose={() => setSelectedOptionTrack(null)}
        playlistContext={{ playlistId: playlist.id }}
      />

      <PlaylistFormModal
        visible={renameModalVisible}
        onClose={() => setRenameModalVisible(false)}
        title="Renommer la playlist"
        submitLabel="Enregistrer"
        initialName={playlist.name}
        initialDescription={playlist.description}
        onSubmit={(name, description) => renamePlaylist(playlist.id, name, description)}
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
      flex: 1,
      textAlign: 'center',
      marginHorizontal: 8,
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
    trackRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    trackRowContent: {
      flex: 1,
    },
    reorderControls: {
      marginRight: 12,
    },
    reorderBtn: {
      padding: 4,
    },
    reorderBtnDisabled: {
      opacity: 0.3,
    },
  });
}

export default PlaylistDetailScreen;
