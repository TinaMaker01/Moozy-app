import React, { useMemo, useState } from 'react';
import {
  FlatList,
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
  Compass,
  Flame,
  FolderSync,
  Moon,
  Play,
  Sparkles,
  Zap,
} from 'lucide-react-native';
import { borderRadius, ColorTokens, shadows, typography } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useMusicStore } from '../store/useMusicStore';
import { MoodCategory } from '../types/music';
import { RootStackParamList } from '../types/navigation';
import { SleepTimerModal } from '../components/SleepTimerModal';
import { TrackArtwork } from '../components/TrackArtwork';
import { getTrackPalette } from '../utils/artworkColors';
import { useLibraryScan } from '../hooks/useLibraryScan';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MOODS: { id: MoodCategory; label: string; icon: any; color: string }[] = [
  { id: 'all', label: 'Tous', icon: Sparkles, color: '#8B5CF6' },
  { id: 'chill', label: 'Détente 🌙', icon: Moon, color: '#06B6D4' },
  { id: 'energy', label: 'Énergie ⚡', icon: Zap, color: '#EC4899' },
  { id: 'focus', label: 'Concentration 🎯', icon: Compass, color: '#3B82F6' },
  { id: 'party', label: 'Soirée 🔥', icon: Flame, color: '#F59E0B' },
];

export const HomeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [sleepModalVisible, setSleepModalVisible] = useState(false);
  const { isScanning, scan } = useLibraryScan();

  // Selectors: each hook call subscribes only to the slice it reads, so this
  // screen re-renders when that slice changes — not on every store update
  // (e.g. queue/progress changes while a track is playing).
  const tracks = useMusicStore((s) => s.tracks);
  const currentTrack = useMusicStore((s) => s.currentTrack);
  const playlists = useMusicStore((s) => s.playlists);
  const recentlyPlayed = useMusicStore((s) => s.recentlyPlayed);
  const selectedMood = useMusicStore((s) => s.selectedMood);
  const setSelectedMood = useMusicStore((s) => s.setSelectedMood);
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

  // Once the user has real local music, stop surfacing the demo/remote
  // tracks here — they need network to load art and stream audio, so
  // they'd silently fail offline (auto-skipped by playbackService's
  // PlaybackError handler, but still a broken-feeling suggestion to show).
  // Demo tracks stay in the store either way — Favorites and the two
  // seeded demo playlists still work if opened explicitly.
  const hasLocalTracks = useMemo(() => tracks.some((t) => t.isLocal), [tracks]);
  const homeTracks = useMemo(
    () => (hasLocalTracks ? tracks.filter((t) => t.isLocal) : tracks),
    [tracks, hasLocalTracks]
  );

  const filteredTracks = useMemo(() => {
    return homeTracks.filter((t) => {
      if (selectedMood === 'all') {
        return true;
      }
      if (selectedMood === 'chill') {
        return t.genre?.toLowerCase().includes('lo-fi') || t.genre?.toLowerCase().includes('ambient');
      }
      if (selectedMood === 'energy') {
        return t.genre?.toLowerCase().includes('edm') || t.genre?.toLowerCase().includes('cyber');
      }
      if (selectedMood === 'focus') {
        return t.genre?.toLowerCase().includes('ambient') || t.genre?.toLowerCase().includes('focus');
      }
      return true;
    });
  }, [homeTracks, selectedMood]);

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

        {/* Mood Selector Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.moodsContainer}
        >
          {MOODS.map((m) => {
            const isSelected = selectedMood === m.id;
            const Icon = m.icon;
            return (
              <TouchableOpacity
                key={m.id}
                style={[
                  styles.moodChip,
                  isSelected && {
                    backgroundColor: m.color,
                    borderColor: m.color,
                  },
                ]}
                onPress={() => setSelectedMood(m.id)}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
              >
                <Icon
                  size={15}
                  color={isSelected ? '#FFF' : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.moodText,
                    isSelected && styles.moodTextSelected,
                  ]}
                >
                  {m.label}
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

        {/* Playlists & Coups de Cœur */}
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
    scrollContent: {
      paddingBottom: 120,
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
    moodsContainer: {
      paddingHorizontal: 20,
      gap: 8,
      paddingBottom: 16,
    },
    moodChip: {
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
    moodText: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    moodTextSelected: {
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
