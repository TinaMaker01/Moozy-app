import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useProgress } from 'react-native-track-player';
import { MicVocal, X } from 'lucide-react-native';
import { borderRadius, ColorTokens, shadows, typography } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useMusicStore } from '../store/useMusicStore';
import { AudioService } from '../services/audioService';
import { findLyricsForTrack } from '../services/lyricsService';
import { LyricLine } from '../utils/lrcParser';
import { LoadingState } from './states/LoadingState';
import { EmptyState } from './states/EmptyState';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const LINE_HEIGHT = 46;

export const LyricsModal: React.FC<Props> = ({ visible, onClose }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

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
              <View style={styles.header}>
                <View style={styles.titleRow}>
                  <MicVocal size={20} color={colors.primaryLight} />
                  <Text style={styles.title}>Paroles</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <X size={22} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Only mounted (and only polling playback progress) while the
                  modal is actually open — no point paying for a second
                  progress poll running behind the scenes while it's closed. */}
              {visible && <LyricsContent />}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const LyricsContent: React.FC = () => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const currentTrack = useMusicStore((s) => s.currentTrack);
  const { position } = useProgress(500);
  const [lyrics, setLyrics] = useState<LyricLine[] | null>(null);
  const [loading, setLoading] = useState(true);
  const listRef = useRef<FlatList<LyricLine>>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLyrics(null);

    if (!currentTrack) {
      setLoading(false);
      return;
    }

    findLyricsForTrack(currentTrack).then((result) => {
      if (!cancelled) {
        setLyrics(result);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [currentTrack]);

  // The last line whose timestamp has already passed is the active one.
  const activeIndex = useMemo(() => {
    if (!lyrics) {
      return -1;
    }
    let idx = -1;
    for (let i = 0; i < lyrics.length; i++) {
      if (lyrics[i].time <= position) {
        idx = i;
      } else {
        break;
      }
    }
    return idx;
  }, [lyrics, position]);

  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) {
      return;
    }
    try {
      listRef.current.scrollToIndex({ index: activeIndex, viewPosition: 0.35, animated: true });
    } catch (e) {
      // scrollToIndex can throw if the target isn't in the measured range yet
      // (e.g. right after mount) — harmless, the next tick will catch up.
    }
  }, [activeIndex]);

  if (loading) {
    return <LoadingState message="Recherche des paroles..." />;
  }

  if (!currentTrack) {
    return <EmptyState title="Aucun morceau en cours" />;
  }

  if (!lyrics) {
    return (
      <EmptyState
        icon={<MicVocal size={40} color={colors.textMuted} />}
        title="Aucune parole disponible"
        message="Ajoutez un fichier .lrc portant le même nom que le morceau, dans le même dossier, pour voir les paroles ici."
      />
    );
  }

  return (
    <FlatList
      ref={listRef}
      data={lyrics}
      keyExtractor={(_, index) => `line-${index}`}
      style={styles.list}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      getItemLayout={(_, index) => ({ length: LINE_HEIGHT, offset: LINE_HEIGHT * index, index })}
      onScrollToIndexFailed={() => {}}
      renderItem={({ item, index }) => {
        const isActive = index === activeIndex;
        return (
          <TouchableOpacity
            style={styles.lineRow}
            onPress={() => AudioService.seekTo(item.time)}
          >
            <Text style={[styles.lineText, isActive && styles.lineTextActive]}>
              {item.text || '♪'}
            </Text>
          </TouchableOpacity>
        );
      }}
    />
  );
};

function createStyles(colors: ColorTokens) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      justifyContent: 'flex-end',
    },
    card: {
      backgroundColor: colors.surfaceCard,
      borderTopLeftRadius: borderRadius.xxl,
      borderTopRightRadius: borderRadius.xxl,
      paddingTop: 20,
      paddingHorizontal: 4,
      height: '75%',
      borderWidth: 1,
      borderColor: colors.borderGlass,
      ...shadows.soft,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
      paddingHorizontal: 16,
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
    closeBtn: {
      padding: 4,
    },
    list: {
      flex: 1,
    },
    listContent: {
      paddingVertical: 40,
      paddingHorizontal: 20,
    },
    lineRow: {
      minHeight: LINE_HEIGHT,
      justifyContent: 'center',
    },
    lineText: {
      ...typography.bodyLarge,
      color: colors.textMuted,
      fontSize: 17,
      lineHeight: 24,
    },
    lineTextActive: {
      color: colors.primaryLight,
      fontWeight: '700',
    },
  });
}

export default LyricsModal;
