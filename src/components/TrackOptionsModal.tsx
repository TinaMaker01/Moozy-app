import React, { useMemo } from 'react';
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {
  CornerDownRight,
  Heart,
  ListPlus,
  Play,
  X,
} from 'lucide-react-native';
import { borderRadius, ColorTokens, shadows, typography } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useMusicStore } from '../store/useMusicStore';
import { Track } from '../types/music';

interface Props {
  track: Track | null;
  visible: boolean;
  onClose: () => void;
}

export const TrackOptionsModal: React.FC<Props> = ({
  track,
  visible,
  onClose,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const favorites = useMusicStore((s) => s.favorites);
  const toggleFavorite = useMusicStore((s) => s.toggleFavorite);
  const playNextTrack = useMusicStore((s) => s.playNextTrack);
  const addToQueue = useMusicStore((s) => s.addToQueue);
  const playTrack = useMusicStore((s) => s.playTrack);

  if (!track) {
    return null;
  }

  const isFavorite = favorites.includes(track.id);

  const handlePlayNow = () => {
    playTrack(track);
    onClose();
  };

  const handlePlayNext = () => {
    playNextTrack(track);
    onClose();
  };

  const handleAddToQueue = () => {
    addToQueue(track);
    onClose();
  };

  const handleToggleFav = () => {
    toggleFavorite(track.id);
    onClose();
  };

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
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              {/* Header with track preview */}
              <View style={styles.trackHeader}>
                <Image
                  source={{
                    uri:
                      track.artwork ||
                      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
                  }}
                  style={styles.artwork}
                />
                <View style={styles.headerInfo}>
                  <Text style={styles.title} numberOfLines={1}>
                    {track.title}
                  </Text>
                  <Text style={styles.artist} numberOfLines={1}>
                    {track.artist}
                  </Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <X size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.divider} />

              {/* Action List */}
              <View style={styles.actionsList}>
                <TouchableOpacity
                  style={styles.actionRow}
                  onPress={handlePlayNow}
                >
                  <View style={styles.iconCircle}>
                    <Play size={18} color={colors.primaryLight} />
                  </View>
                  <Text style={styles.actionText}>Écouter immédiatement</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionRow}
                  onPress={handlePlayNext}
                >
                  <View style={styles.iconCircle}>
                    <CornerDownRight size={18} color={colors.secondary} />
                  </View>
                  <Text style={styles.actionText}>Lire juste après</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionRow}
                  onPress={handleAddToQueue}
                >
                  <View style={styles.iconCircle}>
                    <ListPlus size={18} color={colors.primaryLight} />
                  </View>
                  <Text style={styles.actionText}>Ajouter à la file d'attente</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionRow}
                  onPress={handleToggleFav}
                >
                  <View style={styles.iconCircle}>
                    <Heart
                      size={18}
                      color={isFavorite ? colors.accent : colors.textSecondary}
                      fill={isFavorite ? colors.accent : 'transparent'}
                    />
                  </View>
                  <Text style={styles.actionText}>
                    {isFavorite ? 'Retirer des Coups de Cœur' : 'Ajouter aux Coups de Cœur'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

function createStyles(colors: ColorTokens) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      justifyContent: 'flex-end',
    },
    card: {
      backgroundColor: colors.surfaceCard,
      borderTopLeftRadius: borderRadius.xxl,
      borderTopRightRadius: borderRadius.xxl,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.borderGlass,
      ...shadows.soft,
    },
    trackHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    artwork: {
      width: 48,
      height: 48,
      borderRadius: borderRadius.md,
      backgroundColor: colors.surface,
    },
    headerInfo: {
      flex: 1,
      marginLeft: 12,
    },
    title: {
      ...typography.bodyLarge,
      color: colors.text,
      fontSize: 15,
      fontWeight: '700',
    },
    artist: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      fontSize: 12,
      marginTop: 2,
    },
    closeBtn: {
      padding: 6,
    },
    divider: {
      height: 1,
      backgroundColor: colors.divider,
      marginVertical: 16,
    },
    actionsList: {
      gap: 12,
      marginBottom: 12,
    },
    actionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
    },
    iconCircle: {
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
    actionText: {
      ...typography.bodyLarge,
      color: colors.text,
      fontSize: 14,
      fontWeight: '500',
    },
  });
}

export default TrackOptionsModal;
