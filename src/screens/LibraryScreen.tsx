import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  SectionList,
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
  Folder,
  FolderSync,
  Heart,
  ListMusic,
  Mic,
  Music,
  Plus,
  Search,
  SearchX,
  X,
} from 'lucide-react-native';
import { borderRadius, ColorTokens, typography } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useMusicStore } from '../store/useMusicStore';
import { Playlist, Track } from '../types/music';
import { RootStackParamList } from '../types/navigation';
import { MusicListItem } from '../components/MusicListItem';
import { PlaylistFormModal } from '../components/PlaylistFormModal';
import { TrackArtwork } from '../components/TrackArtwork';
import { TrackOptionsModal } from '../components/TrackOptionsModal';
import { EmptyState } from '../components/states/EmptyState';
import { useLibraryScan } from '../hooks/useLibraryScan';
import { useDebouncedValue } from '../hooks/useDebouncedValue';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type LibraryTab = 'tracks' | 'artists' | 'albums' | 'folders' | 'playlists' | 'favorites';
type SortOption = 'title' | 'artist' | 'recent';

type ArtistGroup = { artist: string; count: number; tracks: Track[] };
type AlbumGroup = { album: string; artist: string; count: number; artwork?: string; tracks: Track[] };

type SearchSection =
  | { title: string; type: 'track'; data: Track[] }
  | { title: string; type: 'artist'; data: ArtistGroup[] }
  | { title: string; type: 'album'; data: AlbumGroup[] }
  | { title: string; type: 'playlist'; data: Playlist[] };

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'title', label: 'Titre' },
  { id: 'artist', label: 'Artiste' },
  { id: 'recent', label: 'Récemment ajouté' },
];

function sortTracks(list: Track[], sortBy: SortOption): Track[] {
  const sorted = [...list];
  if (sortBy === 'title') {
    sorted.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy === 'artist') {
    sorted.sort((a, b) => a.artist.localeCompare(b.artist));
  } else {
    sorted.sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));
  }
  return sorted;
}

export const LibraryScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [activeTab, setActiveTab] = useState<LibraryTab>('tracks');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('title');
  const [selectedOptionTrack, setSelectedOptionTrack] = useState<Track | null>(null);
  const [createPlaylistVisible, setCreatePlaylistVisible] = useState(false);
  const { isScanning, scan } = useLibraryScan();

  // Selectors: subscribe only to the slices this screen actually reads, so it
  // doesn't re-render (and re-render every row of the track list) on unrelated
  // store changes like queue reordering or playback progress.
  const tracks = useMusicStore((s) => s.tracks);
  const currentTrack = useMusicStore((s) => s.currentTrack);
  const favorites = useMusicStore((s) => s.favorites);
  const playlists = useMusicStore((s) => s.playlists);
  const playTrack = useMusicStore((s) => s.playTrack);
  const createPlaylist = useMusicStore((s) => s.createPlaylist);

  // Debounced so typing quickly on a large library doesn't recompute four
  // separate searches (tracks/artists/albums/playlists) on every keystroke.
  const debouncedQuery = useDebouncedValue(searchQuery.trim().toLowerCase(), 150);
  const isSearching = debouncedQuery.length > 0;

  const filteredTracks = useMemo(() => sortTracks(tracks, sortBy), [tracks, sortBy]);

  const favoriteTracks = useMemo(
    () => filteredTracks.filter((t) => favorites.includes(t.id)),
    [filteredTracks, favorites]
  );

  // Extract unique artists — only recomputed when the track list itself changes,
  // not on every keystroke in the search box or tab switch.
  const artistsList = useMemo<ArtistGroup[]>(() => {
    const artistsMap = new Map<string, Track[]>();
    tracks.forEach((t) => {
      const list = artistsMap.get(t.artist) || [];
      list.push(t);
      artistsMap.set(t.artist, list);
    });
    return Array.from(artistsMap.entries()).map(([artist, trks]) => ({
      artist,
      count: trks.length,
      tracks: trks,
    }));
  }, [tracks]);

  // Extract unique albums — same rationale as artistsList above.
  const albumsList = useMemo<AlbumGroup[]>(() => {
    const albumsMap = new Map<string, Track[]>();
    tracks.forEach((t) => {
      const albumName = t.album || 'Sans Album';
      const list = albumsMap.get(albumName) || [];
      list.push(t);
      albumsMap.set(albumName, list);
    });
    return Array.from(albumsMap.entries()).map(([album, trks]) => ({
      album,
      artist: trks[0].artist,
      count: trks.length,
      artwork: trks[0].artwork,
      tracks: trks,
    }));
  }, [tracks]);

  // Extract folders (Android only — local scans set folderPath from the
  // MediaStore file path; demo/remote tracks fall into a single bucket).
  const foldersList = useMemo(() => {
    const foldersMap = new Map<string, Track[]>();
    tracks.forEach((t) => {
      const folder = t.folderPath || 'Autres morceaux';
      const list = foldersMap.get(folder) || [];
      list.push(t);
      foldersMap.set(folder, list);
    });
    return Array.from(foldersMap.entries()).map(([folder, trks]) => ({
      folder,
      label: folder.split('/').filter(Boolean).pop() || folder,
      count: trks.length,
      tracks: trks,
    }));
  }, [tracks]);

  // Unified, categorized search across everything in the library at once —
  // rather than only ever filtering whichever tab happens to be open (the
  // old behavior: switching to Artists/Albums/Folders silently ignored
  // whatever was typed in the search box).
  const searchSections = useMemo<SearchSection[]>(() => {
    if (!isSearching) {
      return [];
    }
    const q = debouncedQuery;
    const sections: SearchSection[] = [];

    const matchedTracks = tracks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        (t.album && t.album.toLowerCase().includes(q))
    );
    if (matchedTracks.length > 0) {
      sections.push({ title: 'Titres', type: 'track', data: matchedTracks });
    }

    const matchedArtists = artistsList.filter((a) => a.artist.toLowerCase().includes(q));
    if (matchedArtists.length > 0) {
      sections.push({ title: 'Artistes', type: 'artist', data: matchedArtists });
    }

    const matchedAlbums = albumsList.filter((a) => a.album.toLowerCase().includes(q));
    if (matchedAlbums.length > 0) {
      sections.push({ title: 'Albums', type: 'album', data: matchedAlbums });
    }

    const matchedPlaylists = playlists.filter((p) => p.name.toLowerCase().includes(q));
    if (matchedPlaylists.length > 0) {
      sections.push({ title: 'Playlists', type: 'playlist', data: matchedPlaylists });
    }

    return sections;
  }, [isSearching, debouncedQuery, tracks, artistsList, albumsList, playlists]);

  const showSortControl = !isSearching && (activeTab === 'tracks' || activeTab === 'favorites');

  const renderSearchResults = () => {
    if (searchSections.length === 0) {
      return (
        <EmptyState
          icon={<SearchX size={48} color={colors.textMuted} />}
          title="Aucun résultat"
          message={`Rien ne correspond à « ${searchQuery.trim()} ».`}
        />
      );
    }

    return (
      <SectionList<any, SearchSection>
        sections={searchSections}
        keyExtractor={(item, index) => {
          const anyItem = item as { id?: string; album?: string; artist?: string };
          if (anyItem.id) {
            return `id-${anyItem.id}`;
          }
          if (anyItem.album) {
            return `album-${anyItem.album}`;
          }
          if (anyItem.artist) {
            return `artist-${anyItem.artist}`;
          }
          return `row-${index}`;
        }}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionHeaderText}>
            {section.title} ({section.data.length})
          </Text>
        )}
        renderItem={({ item, section }) => {
          if (section.type === 'track') {
            const track = item as Track;
            return (
              <MusicListItem
                track={track}
                isActive={currentTrack?.id === track.id}
                onPress={() => playTrack(track, section.data)}
                onOptionsPress={() => setSelectedOptionTrack(track)}
              />
            );
          }
          if (section.type === 'artist') {
            const a = item as ArtistGroup;
            return (
              <TouchableOpacity
                style={styles.cardItem}
                onPress={() => navigation.navigate('ArtistDetail', { artistName: a.artist })}
              >
                <View style={styles.artistAvatar}>
                  <Mic size={24} color={colors.primaryLight} />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>{a.artist}</Text>
                  <Text style={styles.cardSubtitle}>{a.count} morceaux</Text>
                </View>
              </TouchableOpacity>
            );
          }
          if (section.type === 'album') {
            const al = item as AlbumGroup;
            return (
              <TouchableOpacity
                style={styles.cardItem}
                onPress={() => playTrack(al.tracks[0], al.tracks)}
              >
                <TrackArtwork uri={al.artwork} style={styles.albumCover} iconSize={20} />
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>{al.album}</Text>
                  <Text style={styles.cardSubtitle}>
                    {al.artist} • {al.count} pistes
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }
          const pl = item as Playlist;
          return (
            <TouchableOpacity
              style={styles.cardItem}
              onPress={() => navigation.navigate('PlaylistDetail', { playlistId: pl.id })}
            >
              <View style={styles.playlistIcon}>
                <ListMusic size={24} color={colors.accent} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{pl.name}</Text>
                <Text style={styles.cardSubtitle}>{pl.trackIds.length} morceaux</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    );
  };

  const renderTabContent = () => {
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
              <TouchableOpacity style={styles.scanCta} onPress={scan}>
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
              onPress={() => navigation.navigate('ArtistDetail', { artistName: item.artist })}
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
              <TrackArtwork uri={item.artwork} style={styles.albumCover} iconSize={20} />
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

    if (activeTab === 'folders') {
      return (
        <FlatList
          data={foldersList}
          keyExtractor={(item) => item.folder}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Folder size={48} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>Aucun dossier</Text>
              <Text style={styles.emptySubtitle}>
                Scannez votre stockage pour voir vos morceaux classés par dossier.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.cardItem}
              onPress={() => playTrack(item.tracks[0], item.tracks)}
            >
              <View style={styles.folderIcon}>
                <Folder size={24} color={colors.primaryLight} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {item.label}
                </Text>
                <Text style={styles.cardSubtitle} numberOfLines={1}>
                  {item.count} pistes
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
          ListEmptyComponent={
            <EmptyState
              icon={<ListMusic size={48} color={colors.textMuted} />}
              title="Aucune playlist"
              message="Créez votre première playlist pour organiser vos morceaux."
              actionLabel="Créer une playlist"
              onAction={() => setCreatePlaylistVisible(true)}
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.cardItem}
              onPress={() => navigation.navigate('PlaylistDetail', { playlistId: item.id })}
            >
              <View style={styles.playlistIcon}>
                <ListMusic size={24} color={colors.accent} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardSubtitle}>{item.trackIds.length} morceaux</Text>
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
        <View style={styles.headerActions}>
          {activeTab === 'playlists' && (
            <TouchableOpacity
              style={styles.scanBtn}
              onPress={() => setCreatePlaylistVisible(true)}
              accessibilityLabel="Créer une playlist"
            >
              <Plus size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.scanBtn}
            onPress={scan}
            disabled={isScanning}
            accessibilityLabel="Scanner le stockage"
          >
            {isScanning ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <FolderSync size={20} color={colors.textSecondary} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Instant Search Bar — searches titles, artists, albums and playlists
          at once, regardless of which tab is selected below. */}
      <View style={styles.searchBar}>
        <Search size={18} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher titre, artiste, album, playlist..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} accessibilityLabel="Effacer la recherche">
            <X size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Sub-tabs Carousel — hidden while searching since results are shown
          categorized across everything instead of scoped to one tab. */}
      {!isSearching && (
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
              { id: 'folders', label: `Dossiers (${foldersList.length})` },
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
      )}

      {/* Sort Control — only meaningful for the flat track lists */}
      {showSortControl && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sortRow}
        >
          <Text style={styles.sortLabel}>Trier :</Text>
          {SORT_OPTIONS.map((opt) => {
            const isSelected = sortBy === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                style={[styles.sortChip, isSelected && styles.sortChipSelected]}
                onPress={() => setSortBy(opt.id)}
              >
                <Text
                  style={[styles.sortChipText, isSelected && styles.sortChipTextSelected]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Main List Body */}
      {isSearching ? renderSearchResults() : renderTabContent()}

      <TrackOptionsModal
        track={selectedOptionTrack}
        visible={selectedOptionTrack !== null}
        onClose={() => setSelectedOptionTrack(null)}
      />

      <PlaylistFormModal
        visible={createPlaylistVisible}
        onClose={() => setCreatePlaylistVisible(false)}
        title="Nouvelle playlist"
        submitLabel="Créer"
        onSubmit={(name, description) => createPlaylist(name, description || undefined)}
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
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 8,
    },
    headerTitle: {
      ...typography.hero,
      color: colors.text,
      fontSize: 26,
    },
    headerActions: {
      flexDirection: 'row',
      gap: 8,
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
    sortRow: {
      paddingHorizontal: 20,
      alignItems: 'center',
      gap: 8,
      paddingBottom: 10,
    },
    sortLabel: {
      ...typography.bodySmall,
      color: colors.textMuted,
      marginRight: 2,
    },
    sortChip: {
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: borderRadius.round,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sortChipSelected: {
      backgroundColor: colors.activeTrackBg,
      borderColor: colors.primary,
    },
    sortChipText: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      fontSize: 12,
    },
    sortChipTextSelected: {
      color: colors.primaryLight,
      fontWeight: '700',
    },
    listContent: {
      paddingBottom: 120,
    },
    sectionHeaderText: {
      ...typography.caption,
      color: colors.textMuted,
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 8,
      backgroundColor: colors.background,
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
    },
    folderIcon: {
      width: 48,
      height: 48,
      borderRadius: borderRadius.md,
      backgroundColor: 'rgba(139, 92, 246, 0.15)',
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
}

export default LibraryScreen;
