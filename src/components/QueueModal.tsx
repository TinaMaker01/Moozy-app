import React, { useMemo } from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {
  ChevronDown,
  ChevronUp,
  ListMusic,
  Trash2,
  X,
} from 'lucide-react-native';
import { borderRadius, ColorTokens, shadows, typography } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useMusicStore } from '../store/useMusicStore';
import { Track } from '../types/music';
import { TrackArtwork } from './TrackArtwork';
import { VisualizerBar } from './VisualizerBar';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const QueueModal: React.FC<Props> = ({ visible, onClose }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const queue = useMusicStore((s) => s.queue);
  const currentTrack = useMusicStore((s) => s.currentTrack);
  const playTrack = useMusicStore((s) => s.playTrack);
  const moveQueueItem = useMusicStore((s) => s.moveQueueItem);
  const removeFromQueue = useMusicStore((s) => s.removeFromQueue);
  const clearQueue = useMusicStore((s) => s.clearQueue);

  const currentIdx = currentTrack
    ? queue.findIndex((t) => t.id === currentTrack.id)
    : -1;

  const upNextTracks = currentIdx >= 0 ? queue.slice(currentIdx + 1) : queue;

  const handlePlayFromQueue = (track: Track) => {
    playTrack(track, queue);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
      navigationBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.titleRow}>
                  <ListMusic size={22} color={colors.primaryLight} />
                  <Text style={styles.title}>File d'Attente</Text>
                  <Text style={styles.countBadge}>({queue.length})</Text>
                </View>
                <View style={styles.headerActions}>
                  {queue.length > 1 && (
                    <TouchableOpacity
                      style={styles.clearBtn}
                      onPress={clearQueue}
                    >
                      <Trash2 size={16} color={colors.error} />
                      <Text style={styles.clearBtnText}>Vider</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={onClose}
                    style={styles.closeBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityRole="button"
                    accessibilityLabel="Fermer la file d'attente"
                  >
                    <X size={22} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Currently Playing Track */}
              {currentTrack && (
                <View style={styles.nowPlayingSection}>
                  <Text style={styles.sectionLabel}>EN COURS DE LECTURE</Text>
                  <View style={styles.activeTrackCard}>
                    <TrackArtwork uri={currentTrack.artwork} style={styles.activeThumb} iconSize={18} />
                    <View style={styles.activeInfo}>
                      <Text style={styles.activeTitle} numberOfLines={1}>
                        {currentTrack.title}
                      </Text>
                      <Text style={styles.activeArtist} numberOfLines={1}>
                        {currentTrack.artist}
                      </Text>
                    </View>
                    <VisualizerBar isPlaying={true} barCount={4} color={colors.primaryLight} maxHeight={16} />
                  </View>
                </View>
              )}

              {/* Up Next List */}
              <View style={styles.upNextSection}>
                <Text style={styles.sectionLabel}>À SUIVRE ({upNextTracks.length})</Text>

                <FlatList
                  data={upNextTracks}
                  keyExtractor={(item, index) => `${item.id}-${index}`}
                  contentContainerStyle={styles.listContent}
                  showsVerticalScrollIndicator={false}
                  ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                      <Text style={styles.emptyText}>
                        Aucun morceau en attente. Ajoutez des titres avec « Lire juste après ».
                      </Text>
                    </View>
                  }
                  renderItem={({ item, index }) => {
                    const globalIdx = currentIdx + 1 + index;
                    const canMoveUp = index > 0;
                    const canMoveDown = index < upNextTracks.length - 1;

                    return (
                      <View style={styles.queueItem}>
                        <TouchableOpacity
                          style={styles.trackInfoPressable}
                          onPress={() => handlePlayFromQueue(item)}
                          accessibilityRole="button"
                          accessibilityLabel={`${item.title}, ${item.artist}`}
                        >
                          <TrackArtwork uri={item.artwork} style={styles.queueThumb} iconSize={16} />
                          <View style={styles.queueInfo}>
                            <Text style={styles.queueTitle} numberOfLines={1}>
                              {item.title}
                            </Text>
                            <Text style={styles.queueArtist} numberOfLines={1}>
                              {item.artist}
                            </Text>
                          </View>
                        </TouchableOpacity>

                        {/* Reorder & Remove Controls */}
                        <View style={styles.itemControls}>
                          <TouchableOpacity
                            style={[styles.reorderBtn, !canMoveUp && styles.btnDisabled]}
                            disabled={!canMoveUp}
                            onPress={() => moveQueueItem(globalIdx, globalIdx - 1)}
                            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                            accessibilityRole="button"
                            accessibilityLabel="Déplacer vers le haut"
                          >
                            <ChevronUp
                              size={18}
                              color={canMoveUp ? colors.textSecondary : colors.border}
                            />
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[styles.reorderBtn, !canMoveDown && styles.btnDisabled]}
                            disabled={!canMoveDown}
                            onPress={() => moveQueueItem(globalIdx, globalIdx + 1)}
                            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                            accessibilityRole="button"
                            accessibilityLabel="Déplacer vers le bas"
                          >
                            <ChevronDown
                              size={18}
                              color={canMoveDown ? colors.textSecondary : colors.border}
                            />
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.removeBtn}
                            onPress={() => removeFromQueue(globalIdx)}
                            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                            accessibilityRole="button"
                            accessibilityLabel="Retirer de la file d'attente"
                          >
                            <X size={16} color={colors.textMuted} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  }}
                />
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
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      justifyContent: 'flex-end',
    },
    card: {
      backgroundColor: colors.surfaceCard,
      borderTopLeftRadius: borderRadius.xxl,
      borderTopRightRadius: borderRadius.xxl,
      paddingTop: 20,
      paddingHorizontal: 20,
      maxHeight: '82%',
      borderWidth: 1,
      borderColor: colors.borderGlass,
      ...shadows.soft,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    title: {
      ...typography.h2,
      color: colors.text,
      fontSize: 18,
    },
    countBadge: {
      ...typography.bodySmall,
      color: colors.textMuted,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    clearBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: 'rgba(239, 68, 68, 0.15)',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: borderRadius.sm,
    },
    clearBtnText: {
      ...typography.badge,
      color: colors.error,
    },
    closeBtn: {
      padding: 4,
    },
    nowPlayingSection: {
      marginBottom: 16,
    },
    sectionLabel: {
      ...typography.caption,
      color: colors.textMuted,
      fontSize: 11,
      marginBottom: 8,
    },
    activeTrackCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.activeTrackBg,
      padding: 12,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.activeTrackBorder,
    },
    activeThumb: {
      width: 44,
      height: 44,
      borderRadius: borderRadius.sm,
    },
    activeInfo: {
      flex: 1,
      marginLeft: 12,
    },
    activeTitle: {
      ...typography.bodyLarge,
      color: colors.primaryLight,
      fontWeight: '700',
      fontSize: 14,
    },
    activeArtist: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      fontSize: 12,
      marginTop: 2,
    },
    upNextSection: {
      flex: 1,
      minHeight: 280,
      paddingBottom: 24,
    },
    listContent: {
      gap: 8,
      paddingBottom: 32,
    },
    emptyContainer: {
      paddingVertical: 40,
      alignItems: 'center',
    },
    emptyText: {
      ...typography.bodySmall,
      color: colors.textMuted,
      textAlign: 'center',
    },
    queueItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    trackInfoPressable: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    queueThumb: {
      width: 38,
      height: 38,
      borderRadius: borderRadius.sm,
    },
    queueInfo: {
      flex: 1,
      marginLeft: 10,
    },
    queueTitle: {
      ...typography.bodyLarge,
      color: colors.text,
      fontSize: 13,
      fontWeight: '600',
    },
    queueArtist: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      fontSize: 11,
      marginTop: 2,
    },
    itemControls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    reorderBtn: {
      padding: 6,
    },
    btnDisabled: {
      opacity: 0.3,
    },
    removeBtn: {
      padding: 6,
      marginLeft: 4,
    },
  });
}

export default QueueModal;
