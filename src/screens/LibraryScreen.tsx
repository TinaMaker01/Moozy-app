import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  FolderSync,
  Heart,
  ListMusic,
  Mic,
  Music,
  Search,
  X,
} from 'lucide-react-native';
import { borderRadius, colors, typography } from '../theme';
import { useMusicStore } from '../store/useMusicStore';
import { Track } from '../types/music';
import { RootStackParamList } from '../types/navigation';
import { MusicListItem } from '../components/MusicListItem';
import { scanLocalMusicFiles } from '../services/localMusicScanner';
import { TrackOptionsModal } from '../components/TrackOptionsModal';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type LibraryTab = 'tracks' | 'artists' | 'albums' | 'playlists' | 'favorites';

export const LibraryScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const [activeTab, setActiveTab] = useState<LibraryTab>('tracks');
  const [searchQuery, setSearchQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [selectedOptionTrack, setSelectedOptionTrack] = useState<Track | null>(null);

  const {
    tracks,
    currentTrack,
    favorites,
    playlists,
    playTrack,
    setTracks,
  } = useMusicStore();

  const handleScan = async () => {
    setIsScanning(true);
    try {
      const localSongs = await scanLocalMusicFiles();
      if (localSongs.length > 0) {
        const existingIds = new Set(tracks.map((t) => t.id));
        const combined = [
          ...tracks,
          ...localSongs.filter((s) => !existingIds.has(s.id)),
        ];
        setTracks(combined);
      }
    } finally {
      setIsScanning(false);
    }
  };

  // Filter based on search query
  const query = searchQuery.trim().toLowerCase();
  const filteredTracks = tracks.filter((t) => {
    if (!query) {
      return true;
    }
    return (
      t.title.toLowerCase().includes(query) ||
      t.artist.toLowerCase().includes(query) ||
      (t.album && t.album.toLowerCase().includes(query))
    );
  });

  const favoriteTracks = filteredTracks.filter((t) => favorites.includes(t.id));

  // Extract unique artists
  const artistsMap = new Map<string, Track[]>();
  tracks.forEach((t) => {
    const list = artistsMap.get(t.artist) || [];
    list.push(t);
    artistsMap.set(t.artist, list);
  });
  const artistsList = Array.from(artistsMap.entries()).map(([artist, trks]) => ({
    artist,
    count: trks.length,
    tracks: trks,
  }));

  // Extract unique albums
  const albumsMap = new Map<string, Track[]>();
  tracks.forEach((t) => {
    const albumName = t.album || 'Sans Album';
    const list = albumsMap.get(albumName) || [];
    list.push(t);
    albumsMap.set(albumName, list);
  });
  const albumsList = Array.from(albumsMap.entries()).map(([album, trks]) => ({
    album,
    artist: trks[0].artist,
    count: trks.length,
    artwork: trks[0].artwork,
    tracks: trks,
  }));

  const renderContent = () => {
    if (activeTab === 'tracks') {
      return (
        <FlatList
          data={filteredTracks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Music size={48} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>Aucun morceau trouvé</Text>
              <TouchableOpacity style={styles.scanCta} onPress={handleScan}>
                <FolderSync size={18} color="#FFF" />
                <Text style={styles.scanCtaText}>Scanner mes fichiers audio</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => (
            <MusicListItem
              track={item}
              isActive={currentTrack?.id === item.id}
              onPress={() => playTrack(item, filteredTracks)}
              onOptionsPress={() => setSelectedOptionTrack(item)}
            />
          )}
        />
      );
    }

    if (activeTab === 'favorites') {
      return (
        <FlatList
          data={favoriteTracks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Heart size={48} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>Aucun coup de cœur</Text>
              <Text style={styles.emptySubtitle}>
                Cliquez sur le cœur d’un morceau pour l’ajouter ici.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <MusicListItem
              track={item}
              isActive={currentTrack?.id === item.id}
              onPress={() => playTrack(item, favoriteTracks)}
              onOptionsPress={() => setSelectedOptionTrack(item)}
            />
          )}
        />
      );
    }

    if (activeTab === 'artists') {
      return (
        <FlatList
          data={artistsList}
          keyExtractor={(item) => item.artist}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.cardItem}
              onPress={() => playTrack(item.tracks[0], item.tracks)}
            >
              <View style={styles.artistAvatar}>
                <Mic size={24} color={colors.primaryLight} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{item.artist}</Text>
                <Text style={styles.cardSubtitle}>{item.count} morceaux</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      );
    }

    if (activeTab === 'albums') {
      return (
        <FlatList
          data={albumsList}
          keyExtractor={(item) => item.album}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.cardItem}
              onPress={() => playTrack(item.tracks[0], item.tracks)}
            >
              <View style={styles.albumCover}>
                <Music size={24} color={colors.secondary} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{item.album}</Text>
                <Text style={styles.cardSubtitle}>
                  {item.artist} • {item.count} pistes
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      );
    }

    if (activeTab === 'playlists') {
      return (
        <FlatList
          data={playlists}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.cardItem}
              onPress={() =>
                navigation.navigate('PlaylistDetail', { playlist: item })
              }
            >
              <View style={styles.playlistIcon}>
                <ListMusic size={24} color={colors.accent} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardSubtitle}>
                  {item.trackIds.length} morceaux
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      );
    }

    return null;
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Top Bar */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bibliothèque</Text>
        <TouchableOpacity
          style={styles.scanBtn}
          onPress={handleScan}
          disabled={isScanning}
        >
          {isScanning ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <FolderSync size={20} color={colors.textSecondary} />
          )}
        </TouchableOpacity>
      </View>

      {/* Instant Search Bar */}
      <View style={styles.searchBar}>
        <Search size={18} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher titre, artiste, album..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <X size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Sub-tabs Carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContainer}
      >
        {(
          [
            { id: 'tracks', label: `Pistes (${filteredTracks.length})` },
            { id: 'favorites', label: `Favoris (${favorites.length})` },
            { id: 'artists', label: `Artistes (${artistsList.length})` },
            { id: 'albums', label: `Albums (${albumsList.length})` },
            { id: 'playlists', label: `Playlists (${playlists.length})` },
          ] as { id: LibraryTab; label: string }[]
        ).map((t) => {
          const isSelected = activeTab === t.id;
          return (
            <TouchableOpacity
              key={t.id}
              style={[styles.tabChip, isSelected && styles.tabChipSelected]}
              onPress={() => setActiveTab(t.id)}
            >
              <Text
                style={[
                  styles.tabLabel,
                  isSelected && styles.tabLabelSelected,
                ]}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Main List Body */}
      {renderContent()}

      <TrackOptionsModal
        track={selectedOptionTrack}
        visible={selectedOptionTrack !== null}
        onClose={() => setSelectedOptionTrack(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTitle: {
    ...typography.hero,
    color: colors.text,
    fontSize: 26,
  },
  scanBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderGlass,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceCard,
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 12,
    paddingHorizontal: 14,
    height: 44,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: colors.text,
    fontSize: 14,
  },
  tabsContainer: {
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 12,
  },
  tabChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: borderRadius.round,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  tabLabelSelected: {
    color: '#FFF',
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 120,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 30,
    gap: 12,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.textSecondary,
    fontSize: 17,
  },
  emptySubtitle: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
  },
  scanCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: borderRadius.round,
    marginTop: 8,
  },
  scanCtaText: {
    ...typography.bodySmall,
    color: '#FFF',
    fontWeight: '700',
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: colors.surfaceCard,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderGlass,
  },
  artistAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  albumCover: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playlistIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(236, 72, 153, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
    marginLeft: 14,
  },
  cardTitle: {
    ...typography.bodyLarge,
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  cardSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

export default LibraryScreen;
