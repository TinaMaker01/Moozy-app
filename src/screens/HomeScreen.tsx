import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Clock,
  FolderSync,
  Heart,
  Moon,
  Music,
  Play,
  Sparkles,
} from 'lucide-react-native';
import { borderRadius, ColorTokens, shadows, typography } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useMusicStore } from '../store/useMusicStore';
import { QuickFilter } from '../types/music';
import { RootStackParamList } from '../types/navigation';
import { SleepTimerModal } from '../components/SleepTimerModal';
import { TrackArtwork } from '../components/TrackArtwork';
import { getTrackPalette } from '../utils/artworkColors';
import { useLibraryScan } from '../hooks/useLibraryScan';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Previously a "mood" selector (Détente/Énergie/Concentration/Soirée) that
// filtered on Track.genre — a field the native MediaStore scanner and the
// filesystem-walk fallback never actually populate for local files (see
// Phase 5's decision not to guess genre), so every option but "Tous" quietly
// matched zero tracks for any real library. These filters are built only on
// data Moozy genuinely has for every track, so they actually do something.
const QUICK_FILTERS: { id: QuickFilter; label: string; icon: any; color: string }[] = [
  { id: 'all', label: 'Tous', icon: Sparkles, color: '#8B5CF6' },
  { id: 'favorites', label: 'Favoris ❤️', icon: Heart, color: '#EC4899' },
  { id: 'recent', label: 'Récents 🆕', icon: Clock, color: '#3B82F6' },
  { id: 'unplayed', label: 'À découvrir 🎧', icon: Music, color: '#06B6D4' },
];

export const HomeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [sleepModalVisible, setSleepModalVisible] = useState(false);
  const { isScanning, permissionDenied, scan, requestAndScan } = useLibraryScan();

  // Selectors: each hook call subscribes only to the slice it reads, so this
  // screen re-renders when that slice changes — not on every store update
  // (e.g. queue/progress changes while a track is playing).
  const tracks = useMusicStore((s) => s.tracks);
  const currentTrack = useMusicStore((s) => s.currentTrack);
  const playlists = useMusicStore((s) => s.playlists);
  const favorites = useMusicStore((s) => s.favorites);
  const recentlyPlayed = useMusicStore((s) => s.recentlyPlayed);
  const selectedFilter = useMusicStore((s) => s.selectedFilter);
  const setSelectedFilter = useMusicStore((s) => s.setSelectedFilter);
  const playTrack = useMusicStore((s) => s.playTrack);

  const activePalette = useMemo(
    () => getTrackPalette(currentTrack?.title || 'Moozy'),
    [currentTrack?.title]
  );

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return 'Bonjour ☀️';
    }
    if (hour < 18) {
      return 'Bon après-midi 🎶';
    }
    return 'Bonsoir 🌙';
  };

  // Non-local tracks would need network to load art and stream audio, so
  // they'd silently fail offline (auto-skipped by playbackService's
  // PlaybackError handler, but still a broken-feeling suggestion to show).
  // Every track the app can produce today is local (native/filesystem scan),
  // but this stays as a safety net in case a non-local source is ever added.
  const hasLocalTracks = useMemo(() => tracks.some((t) => t.isLocal), [tracks]);
  const homeTracks = useMemo(
    () => (hasLocalTracks ? tracks.filter((t) => t.isLocal) : tracks),
    [tracks, hasLocalTracks]
  );

  const filteredTracks = useMemo(() => {
    if (selectedFilter === 'favorites') {
      return homeTracks.filter((t) => favorites.includes(t.id));
    }
    if (selectedFilter === 'recent') {
      return [...homeTracks]
        .sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0))
        .slice(0, 20);
    }
    if (selectedFilter === 'unplayed') {
      const playedIds = new Set(recentlyPlayed.map((t) => t.id));
      return homeTracks.filter((t) => !playedIds.has(t.id));
    }
    return homeTracks;
  }, [homeTracks, selectedFilter, favorites, recentlyPlayed]);

  // A brand new install (or a fully reset one) must never show quick filter
  // chips, a "suggestion" hero card or empty section headers as if there
  // were already content — see Phase 15's first-open UX audit. This replaces
  // the whole scrollable Home with a single, honest call to action instead.
  if (tracks.length === 0) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <View style={styles.firstRunContainer}>
          <View style={styles.firstRunIconWrap}>
            <Music size={40} color={colors.primaryLight} />
          </View>
          <Text style={styles.firstRunTitle}>Bienvenue sur Moozy</Text>
          <Text style={styles.firstRunSubtitle}>
            Moozy lit la musique déjà présente sur votre appareil — rien n’est
            envoyé en ligne. Pour commencer, autorisez l’accès à vos fichiers
            audio afin que Moozy puisse les trouver.
          </Text>

          {permissionDenied ? (
            <>
              <Text style={styles.firstRunDeniedText}>
                L’accès à vos fichiers audio a été refusé. Vous pouvez
                l’autoriser depuis les paramètres de l’application.
              </Text>
              <TouchableOpacity
                style={styles.firstRunButton}
                onPress={() => Linking.openSettings()}
                accessibilityRole="button"
                accessibilityLabel="Ouvrir les paramètres de l’application"
              >
                <Text style={styles.firstRunButtonText}>Ouvrir les paramètres</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={styles.firstRunButton}
              onPress={requestAndScan}
              disabled={isScanning}
              accessibilityRole="button"
              accessibilityLabel="Trouver ma musique"
            >
              {isScanning ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <FolderSync size={18} color="#FFF" />
                  <Text style={styles.firstRunButtonText}>Trouver ma musique</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Ambient Lighting Glow Orb */}
      <View
        style={[
          styles.ambientGlow,
          { backgroundColor: activePalette.glowPrimary },
        ]}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Top Header */}
        <View style={styles.topHeader}>
          <View>
            <Text style={styles.greetingText}>{getGreeting()}</Text>
            <Text style={styles.appTitle}>Moozy Music</Text>
          </View>
          <View style={styles.topIconsRow}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => setSleepModalVisible(true)}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              accessibilityRole="button"
              accessibilityLabel="Minuteur de sommeil"
            >
              <Moon size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={scan}
              disabled={isScanning}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              accessibilityRole="button"
              accessibilityLabel="Scanner le stockage"
            >
              <FolderSync
                size={20}
                color={isScanning ? colors.primary : colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Filter Chips — backed by data every track actually has
            (favorites, addedAt, play history), not a guessed genre. */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          {QUICK_FILTERS.map((f) => {
            const isSelected = selectedFilter === f.id;
            const Icon = f.icon;
            return (
              <TouchableOpacity
                key={f.id}
                style={[
                  styles.filterChip,
                  isSelected && {
                    backgroundColor: f.color,
                    borderColor: f.color,
                  },
                ]}
                onPress={() => setSelectedFilter(f.id)}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
              >
                <Icon
                  size={15}
                  color={isSelected ? '#FFF' : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.filterText,
                    isSelected && styles.filterTextSelected,
                  ]}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Hero Featured Music Card */}
        {homeTracks.length > 0 && (
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.heroCard}
            onPress={() => playTrack(homeTracks[0], homeTracks)}
          >
            <TrackArtwork uri={homeTracks[0].artwork} style={styles.heroArtwork} iconSize={48} />
            <View style={styles.heroGradient}>
              <View style={[styles.heroBadge, { backgroundColor: activePalette.primary }]}>
                <Sparkles size={12} color="#FFF" />
                <Text style={styles.heroBadgeText}>SUGGESTION DU MOMENT</Text>
              </View>
              <Text style={styles.heroTitle} numberOfLines={1}>
                {homeTracks[0].title}
              </Text>
              <Text style={styles.heroArtist} numberOfLines={1}>
                {homeTracks[0].artist}
              </Text>

              <View style={[styles.heroPlayButton, { backgroundColor: activePalette.primary }]}>
                <Play size={20} color="#FFF" fill="#FFF" />
                <Text style={styles.heroPlayText}>Écouter maintenant</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Quick Picks / Filtered Tracks Carousel */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Morceaux Recommandés</Text>
          <Text style={styles.sectionCount}>{filteredTracks.length} titres</Text>
        </View>

        <FlatList
          data={filteredTracks}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.horizontalList}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.trackCard}
              onPress={() => playTrack(item, filteredTracks)}
            >
              <View style={styles.trackCardImageContainer}>
                <TrackArtwork uri={item.artwork} style={styles.trackCardImage} iconSize={32} />
                <View style={[styles.trackPlayOverlay, { backgroundColor: activePalette.primary }]}>
                  <Play size={16} color="#FFF" fill="#FFF" />
                </View>
              </View>
              <Text style={styles.trackCardTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.trackCardArtist} numberOfLines={1}>
                {item.artist}
              </Text>
            </TouchableOpacity>
          )}
        />

        {/* Playlists & Coups de Cœur — hidden while there are none yet,
            rather than showing an empty section header with nothing under it. */}
        {playlists.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Vos Playlists</Text>
            </View>

            <FlatList
              data={playlists}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.horizontalList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.playlistCard}
                  onPress={() =>
                    navigation.navigate('PlaylistDetail', { playlistId: item.id })
                  }
                >
                  <TrackArtwork uri={item.artwork} style={styles.playlistImage} iconSize={32} />
                  <Text style={styles.playlistName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.playlistDetails}>
                    {item.trackIds.length} morceaux
                  </Text>
                </TouchableOpacity>
              )}
            />
          </>
        )}

        {/* Recently Played */}
        {recentlyPlayed.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Récemment Écoutés</Text>
            </View>
            <View style={styles.recentList}>
              {recentlyPlayed.slice(0, 4).map((t) => (
                <TouchableOpacity
                  key={`recent-${t.id}`}
                  style={styles.recentItem}
                  onPress={() => playTrack(t, recentlyPlayed)}
                >
                  <TrackArtwork uri={t.artwork} style={styles.recentThumb} iconSize={18} />
                  <View style={styles.recentInfo}>
                    <Text style={styles.recentTitle} numberOfLines={1}>
                      {t.title}
                    </Text>
                    <Text style={styles.recentArtist} numberOfLines={1}>
                      {t.artist}
                    </Text>
                  </View>
                  <Play size={16} color={activePalette.primary} fill={activePalette.primary} />
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      <SleepTimerModal
        visible={sleepModalVisible}
        onClose={() => setSleepModalVisible(false)}
      />
    </View>
  );
};

function createStyles(colors: ColorTokens) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
      position: 'relative',
      overflow: 'hidden',
    },
    ambientGlow: {
      position: 'absolute',
      top: -100,
      right: -100,
      width: 280,
      height: 280,
      borderRadius: 140,
      opacity: 0.35,
    },
    firstRunContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
      gap: 12,
    },
    firstRunIconWrap: {
      width: 84,
      height: 84,
      borderRadius: 42,
      backgroundColor: colors.surfaceCard,
      borderWidth: 1,
      borderColor: colors.borderGlass,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    firstRunTitle: {
      ...typography.h2,
      color: colors.text,
      fontSize: 20,
      textAlign: 'center',
    },
    firstRunSubtitle: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
    firstRunDeniedText: {
      ...typography.bodySmall,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 20,
    },
    firstRunButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: colors.primary,
      paddingHorizontal: 22,
      paddingVertical: 14,
      borderRadius: borderRadius.round,
      marginTop: 12,
      minHeight: 48,
      minWidth: 220,
      justifyContent: 'center',
    },
    firstRunButtonText: {
      ...typography.bodyLarge,
      color: '#FFF',
      fontWeight: '700',
      fontSize: 15,
    },
    scrollContent: {
      paddingBottom: 160,
    },
    topHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 16,
    },
    greetingText: {
      ...typography.bodySmall,
      color: colors.textSecondary,
    },
    appTitle: {
      ...typography.hero,
      color: colors.text,
      fontSize: 26,
      marginTop: 2,
    },
    topIconsRow: {
      flexDirection: 'row',
      gap: 8,
    },
    iconBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surfaceCard,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.borderGlass,
    },
    filtersContainer: {
      paddingHorizontal: 20,
      gap: 8,
      paddingBottom: 16,
    },
    filterChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: borderRadius.round,
      backgroundColor: colors.surfaceCard,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterText: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    filterTextSelected: {
      color: '#FFF',
      fontWeight: '700',
    },
    heroCard: {
      marginHorizontal: 20,
      height: 180,
      borderRadius: borderRadius.xl,
      overflow: 'hidden',
      position: 'relative',
      marginBottom: 24,
      ...shadows.soft,
    },
    heroArtwork: {
      width: '100%',
      height: '100%',
      position: 'absolute',
    },
    heroGradient: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(8, 10, 15, 0.65)',
      padding: 16,
      justifyContent: 'flex-end',
    },
    heroBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: borderRadius.sm,
      alignSelf: 'flex-start',
      marginBottom: 8,
    },
    heroBadgeText: {
      ...typography.badge,
      color: '#FFF',
    },
    heroTitle: {
      ...typography.h2,
      color: colors.text,
    },
    heroArtist: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      marginBottom: 12,
    },
    heroPlayButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: borderRadius.round,
      alignSelf: 'flex-start',
    },
    heroPlayText: {
      ...typography.bodySmall,
      color: '#FFF',
      fontWeight: '700',
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      marginBottom: 12,
      marginTop: 8,
    },
    sectionTitle: {
      ...typography.h2,
      color: colors.text,
      fontSize: 18,
    },
    sectionCount: {
      ...typography.bodySmall,
      color: colors.textMuted,
    },
    horizontalList: {
      paddingHorizontal: 20,
      gap: 14,
      paddingBottom: 16,
    },
    trackCard: {
      width: 140,
    },
    trackCardImageContainer: {
      width: 140,
      height: 140,
      borderRadius: borderRadius.lg,
      overflow: 'hidden',
      position: 'relative',
      backgroundColor: colors.surfaceCard,
      marginBottom: 8,
    },
    trackCardImage: {
      width: '100%',
      height: '100%',
    },
    trackPlayOverlay: {
      position: 'absolute',
      bottom: 8,
      right: 8,
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    trackCardTitle: {
      ...typography.bodyLarge,
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
    },
    trackCardArtist: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      fontSize: 12,
      marginTop: 2,
    },
    playlistCard: {
      width: 150,
    },
    playlistImage: {
      width: 150,
      height: 150,
      borderRadius: borderRadius.lg,
      backgroundColor: colors.surfaceCard,
      marginBottom: 8,
    },
    playlistName: {
      ...typography.bodyLarge,
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
    },
    playlistDetails: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      fontSize: 12,
      marginTop: 2,
    },
    recentList: {
      paddingHorizontal: 20,
      gap: 8,
    },
    recentItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
      backgroundColor: colors.surfaceCard,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.borderGlass,
    },
    recentThumb: {
      width: 44,
      height: 44,
      borderRadius: borderRadius.sm,
    },
    recentInfo: {
      flex: 1,
      marginLeft: 12,
    },
    recentTitle: {
      ...typography.bodyLarge,
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
    },
    recentArtist: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      fontSize: 12,
      marginTop: 2,
    },
  });
}

export default HomeScreen;
