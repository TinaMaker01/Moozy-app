import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Modal,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ArrowDownAZ,
  ArrowUpDown,
  Check,
  ChevronDown,
  Clock,
  Disc3,
  Folder,
  FolderSync,
  Heart,
  LayoutGrid,
  ListMusic,
  Mic,
  Music,
  Plus,
  Rows3,
  Search,
  SearchX,
  User,
  X,
} from 'lucide-react-native';
import { borderRadius, ColorTokens, shadows, typography } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useMusicStore } from '../store/useMusicStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { Playlist, Track } from '../types/music';
import { RootStackParamList } from '../types/navigation';
import { MusicListItem } from '../components/MusicListItem';
import { PlaylistFormModal } from '../components/PlaylistFormModal';
import { TrackArtwork } from '../components/TrackArtwork';
import { TrackOptionsModal } from '../components/TrackOptionsModal';
import { EmptyState } from '../components/states/EmptyState';
import { useLibraryScan } from '../hooks/useLibraryScan';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useFolderGroups } from '../hooks/useFolderGroups';

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

const SORT_OPTIONS: { id: SortOption; label: string; icon: any }[] = [
  { id: 'title', label: 'Titre', icon: ArrowDownAZ },
  { id: 'artist', label: 'Artiste', icon: User },
  { id: 'recent', label: 'Récent', icon: Clock },
];

// Short, icon-backed labels — the previous "Pistes (1243)" style counts made
// this row unreadable on a real device once the library got past a few
// hundred items (six chips, each with a 3-4 digit count, crammed into one
// horizontal scroller). The count for whichever tab is active now shows
// once, as a subtitle under the screen title, instead of six times over.
const TAB_ICONS: Record<LibraryTab, any> = {
  tracks: Music,
  favorites: Heart,
  artists: Mic,
  albums: Disc3,
  folders: Folder,
  playlists: ListMusic,
};

const TAB_LABELS: Record<LibraryTab, string> = {
  tracks: 'Pistes',
  favorites: 'Favoris',
  artists: 'Artistes',
  albums: 'Albums',
  folders: 'Dossiers',
  playlists: 'Playlists',
};

const LIBRARY_TABS: LibraryTab[] = ['tracks', 'favorites', 'artists', 'albums', 'folders', 'playlists'];

// Tuned for a library that can hold several thousand tracks: render fewer
// rows per batch and keep a smaller offscreen window than the defaults, and
// let Android drop offscreen rows' native views entirely rather than just
// hiding them. Applied to the lists bound directly to the raw track array
// (Tracks/Favorites/search) — the grouped Artists/Albums/Folders/Playlists
// lists are naturally much shorter, so their defaults are fine.
const LARGE_LIST_PERF_PROPS = {
  initialNumToRender: 12,
  maxToRenderPerBatch: 12,
  windowSize: 7,
  removeClippedSubviews: true,
} as const;

interface SheetOption<T extends string> {
  id: T;
  label: string;
  icon: any;
}

/**
 * Bottom sheet listing a small set of mutually-exclusive options (the 6
 * library categories, or the 3 sort orders) — replaces what used to be a
 * permanently-visible row of chips. Follows the same card convention as the
 * app's other option sheets (see TrackOptionsModal): dark backdrop, rounded
 * top corners, header + close button, divider, one row per option with a
 * checkmark on the current selection.
 */
function SelectorSheet<T extends string>({
  visible,
  onClose,
  title,
  options,
  selectedId,
  onSelect,
  colors,
  styles,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  options: SheetOption<T>[];
  selectedId: T;
  onSelect: (id: T) => void;
  colors: ColorTokens;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      navigationBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.sheetBackdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.sheetCard}>
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>{title}</Text>
                <TouchableOpacity
                  onPress={onClose}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityRole="button"
                  accessibilityLabel="Fermer"
                >
                  <X size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <View style={styles.sheetDivider} />
              {options.map((opt) => {
                const isSelected = selectedId === opt.id;
                const Icon = opt.icon;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    style={[styles.sheetRow, isSelected && styles.sheetRowSelected]}
                    onPress={() => {
                      onSelect(opt.id);
                      onClose();
                    }}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <View
                      style={[
                        styles.sheetIconCircle,
                        isSelected && styles.sheetIconCircleSelected,
                      ]}
                    >
                      <Icon size={18} color={isSelected ? colors.primaryLight : colors.textSecondary} />
                    </View>
                    <Text style={[styles.sheetLabel, isSelected && styles.sheetLabelSelected]}>
                      {opt.label}
                    </Text>
                    {isSelected && <Check size={18} color={colors.primaryLight} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

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
  // Starts from the persisted Settings > Bibliothèque default, but stays
  // freely changeable per-session from the sort chips below.
  const defaultSort = useSettingsStore((s) => s.defaultSort);
  const [sortBy, setSortBy] = useState<SortOption>(defaultSort);
  const albumsViewMode = useSettingsStore((s) => s.albumsViewMode);
  const setAlbumsViewMode = useSettingsStore((s) => s.setAlbumsViewMode);
  const [selectedOptionTrack, setSelectedOptionTrack] = useState<Track | null>(null);
  const [createPlaylistVisible, setCreatePlaylistVisible] = useState(false);
  const [categorySheetVisible, setCategorySheetVisible] = useState(false);
  const [sortSheetVisible, setSortSheetVisible] = useState(false);
  const { isScanning, permissionDenied, scan, requestAndScan } = useLibraryScan();

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
  // Shared with Settings' folder-exclusion list via useFolderGroups.
  const foldersList = useFolderGroups();

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
  const ActiveTabIcon = TAB_ICONS[activeTab];
  const activeSortLabel = SORT_OPTIONS.find((o) => o.id === sortBy)?.label ?? '';

  // One count for whichever tab is active, shown once as a header subtitle
  // rather than crammed into every tab chip's label (see LIBRARY_TABS above).
  const activeTabCountLabel = useMemo(() => {
    const plural = (n: number, word: string) => `${n} ${word}${n !== 1 ? 's' : ''}`;
    switch (activeTab) {
      case 'tracks':
        return plural(filteredTracks.length, 'titre');
      case 'favorites':
        return plural(favoriteTracks.length, 'favori');
      case 'artists':
        return plural(artistsList.length, 'artiste');
      case 'albums':
        return plural(albumsList.length, 'album');
      case 'folders':
        return plural(foldersList.length, 'dossier');
      case 'playlists':
        return plural(playlists.length, 'playlist');
      default:
        return '';
    }
  }, [activeTab, filteredTracks, favoriteTracks, artistsList, albumsList, foldersList, playlists]);

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
        {...LARGE_LIST_PERF_PROPS}
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
          {...LARGE_LIST_PERF_PROPS}
          data={filteredTracks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Music size={48} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>
                {permissionDenied ? 'Accès à la musique refusé' : 'Aucune musique trouvée pour l’instant'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {permissionDenied
                  ? 'Autorisez l’accès aux fichiers audio depuis les paramètres pour voir votre musique ici.'
                  : 'Moozy cherche les fichiers audio déjà présents sur votre appareil.'}
              </Text>
              <TouchableOpacity
                style={styles.scanCta}
                onPress={permissionDenied ? () => Linking.openSettings() : requestAndScan}
                disabled={isScanning}
                accessibilityRole="button"
                accessibilityLabel={
                  permissionDenied ? 'Ouvrir les paramètres de l’application' : 'Scanner mes fichiers audio'
                }
              >
                {isScanning ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <FolderSync size={18} color="#FFF" />
                    <Text style={styles.scanCtaText}>
                      {permissionDenied ? 'Ouvrir les paramètres' : 'Scanner mes fichiers audio'}
                    </Text>
                  </>
                )}
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
          {...LARGE_LIST_PERF_PROPS}
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
      if (albumsViewMode === 'grid') {
        return (
          <FlatList
            key="albums-grid"
            data={albumsList}
            keyExtractor={(item) => item.album}
            numColumns={2}
            columnWrapperStyle={styles.gridRow}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.gridCard}
                onPress={() => playTrack(item.tracks[0], item.tracks)}
              >
                <TrackArtwork uri={item.artwork} style={styles.gridCover} iconSize={40} />
                <Text style={styles.gridTitle} numberOfLines={1}>
                  {item.album}
                </Text>
                <Text style={styles.gridSubtitle} numberOfLines={1}>
                  {item.artist}
                </Text>
              </TouchableOpacity>
            )}
          />
        );
      }

      return (
        <FlatList
          key="albums-list"
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
        <View>
          <Text style={styles.headerTitle}>Bibliothèque</Text>
          {!isSearching && (
            <Text style={styles.headerSubtitle}>{activeTabCountLabel}</Text>
          )}
        </View>
        <View style={styles.headerActions}>
          {activeTab === 'albums' && (
            <TouchableOpacity
              style={styles.scanBtn}
              onPress={() => setAlbumsViewMode(albumsViewMode === 'grid' ? 'list' : 'grid')}
              accessibilityLabel={
                albumsViewMode === 'grid' ? 'Afficher en liste' : 'Afficher en grille'
              }
            >
              {albumsViewMode === 'grid' ? (
                <Rows3 size={20} color={colors.textSecondary} />
              ) : (
                <LayoutGrid size={20} color={colors.textSecondary} />
              )}
            </TouchableOpacity>
          )}
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
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Effacer la recherche"
          >
            <X size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category selector — one pill opens a sheet listing all 6 categories,
          instead of six always-visible chips crammed into a scroller (the
          previous layout became unreadable on a real device once each chip
          carried a live item count). Hidden while searching, whose results
          are already shown categorized across everything at once. */}
      {!isSearching && (
        <View style={styles.selectorRow}>
          <TouchableOpacity
            style={styles.categoryPill}
            onPress={() => setCategorySheetVisible(true)}
            accessibilityRole="button"
            accessibilityLabel={`Catégorie : ${TAB_LABELS[activeTab]}. Toucher pour changer.`}
          >
            <ActiveTabIcon size={16} color={colors.primaryLight} />
            <Text style={styles.categoryPillLabel}>{TAB_LABELS[activeTab]}</Text>
            <ChevronDown size={15} color={colors.textMuted} />
          </TouchableOpacity>

          {showSortControl && (
            <TouchableOpacity
              style={styles.scanBtn}
              onPress={() => setSortSheetVisible(true)}
              accessibilityRole="button"
              accessibilityLabel={`Trier par ${activeSortLabel}. Toucher pour changer.`}
            >
              <ArrowUpDown size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Main List Body */}
      {isSearching ? renderSearchResults() : renderTabContent()}

      <SelectorSheet
        visible={categorySheetVisible}
        onClose={() => setCategorySheetVisible(false)}
        title="Choisir une catégorie"
        options={LIBRARY_TABS.map((id) => ({ id, label: TAB_LABELS[id], icon: TAB_ICONS[id] }))}
        selectedId={activeTab}
        onSelect={setActiveTab}
        colors={colors}
        styles={styles}
      />

      <SelectorSheet
        visible={sortSheetVisible}
        onClose={() => setSortSheetVisible(false)}
        title="Trier par"
        options={SORT_OPTIONS}
        selectedId={sortBy}
        onSelect={setSortBy}
        colors={colors}
        styles={styles}
      />

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
    headerSubtitle: {
      ...typography.bodySmall,
      color: colors.textMuted,
      marginTop: 2,
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
    selectorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginHorizontal: 20,
      marginBottom: 14,
    },
    categoryPill: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: colors.surfaceCard,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.round,
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    categoryPillLabel: {
      ...typography.bodyLarge,
      flex: 1,
      color: colors.text,
      fontSize: 14,
      fontWeight: '700',
    },
    sheetBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      justifyContent: 'flex-end',
    },
    sheetCard: {
      backgroundColor: colors.surfaceCard,
      borderTopLeftRadius: borderRadius.xxl,
      borderTopRightRadius: borderRadius.xxl,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.borderGlass,
      ...shadows.soft,
    },
    sheetHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    sheetTitle: {
      ...typography.h3,
      color: colors.text,
      fontSize: 16,
    },
    sheetDivider: {
      height: 1,
      backgroundColor: colors.divider,
      marginVertical: 16,
    },
    sheetRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 8,
      marginHorizontal: -8,
      borderRadius: borderRadius.md,
    },
    sheetRowSelected: {
      backgroundColor: colors.activeTrackBg,
    },
    sheetIconCircle: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sheetIconCircleSelected: {
      backgroundColor: colors.activeTrackBg,
      borderColor: colors.primary,
    },
    sheetLabel: {
      ...typography.bodyLarge,
      flex: 1,
      color: colors.text,
      fontSize: 14,
      fontWeight: '500',
    },
    sheetLabelSelected: {
      color: colors.primaryLight,
      fontWeight: '700',
    },
    listContent: {
      paddingBottom: 160,
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
    gridRow: {
      gap: 12,
      paddingHorizontal: 16,
    },
    gridCard: {
      flex: 1,
      marginVertical: 8,
    },
    gridCover: {
      width: '100%',
      aspectRatio: 1,
      borderRadius: borderRadius.lg,
      marginBottom: 8,
    },
    gridTitle: {
      ...typography.bodyLarge,
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
    },
    gridSubtitle: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      fontSize: 12,
      marginTop: 2,
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
