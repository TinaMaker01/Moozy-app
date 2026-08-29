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
import { ChevronLeft, Mic, Play, Shuffle } from 'lucide-react-native';
import { borderRadius, ColorTokens, shadows, typography } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useMusicStore } from '../store/useMusicStore';
import { RootStackParamList } from '../types/navigation';
import { MusicListItem } from '../components/MusicListItem';

type ArtistDetailRouteProp = RouteProp<RootStackParamList, 'ArtistDetail'>;

export const ArtistDetailScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<ArtistDetailRouteProp>();
  const { artistName } = route.params;
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const tracks = useMusicStore((s) => s.tracks);
  const currentTrack = useMusicStore((s) => s.currentTrack);
  const playTrack = useMusicStore((s) => s.playTrack);

  // Live-filtered from the store by name, same reasoning as PlaylistDetail:
  // stays correct if the library is rescanned while this screen is open.
  const artistTracks = useMemo(
    () => tracks.filter((t) => t.artist === artistName),
    [tracks, artistName]
  );

  const handlePlayAll = () => {
    if (artistTracks.length > 0) {
      playTrack(artistTracks[0], artistTracks);
    }
  };

  const handleShufflePlay = () => {
    if (artistTracks.length > 0) {
      const shuffled = [...artistTracks].sort(() => Math.random() - 0.5);
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
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          accessibilityRole="button"
          accessibilityLabel="Retour"
        >
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {artistName}
        </Text>
        <View style={styles.placeholderBtn} />
      </View>

      <FlatList
        data={artistTracks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.heroSection}>
            <View style={styles.avatar}>
              <Mic size={40} color={colors.primaryLight} />
            </View>
            <Text style={styles.artistTitle}>{artistName}</Text>
            <Text style={styles.trackCount}>
              {artistTracks.length} morceau(x)
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
            <Text style={styles.emptyText}>Aucun morceau de cet artiste.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <MusicListItem
            track={item}
            isActive={currentTrack?.id === item.id}
            onPress={() => playTrack(item, artistTracks)}
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
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: 'rgba(139, 92, 246, 0.15)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    artistTitle: {
      ...typography.hero,
      color: colors.text,
      fontSize: 22,
      textAlign: 'center',
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

export default ArtistDetailScreen;
