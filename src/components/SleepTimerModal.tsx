import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Moon, X } from 'lucide-react-native';
import { borderRadius, colors, shadows, typography } from '../theme';
import { useSettingsStore } from '../store/useSettingsStore';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const TIMER_OPTIONS = [
  { label: '15 Minutes', minutes: 15 },
  { label: '30 Minutes', minutes: 30 },
  { label: '45 Minutes', minutes: 45 },
  { label: '60 Minutes (1 heure)', minutes: 60 },
  { label: '90 Minutes', minutes: 90 },
];

export const SleepTimerModal: React.FC<Props> = ({ visible, onClose }) => {
  const {
    sleepTimerRemainingSeconds,
    startSleepTimer,
    cancelSleepTimer,
  } = useSettingsStore();

  const formatRemaining = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
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
            <View style={styles.modalCard}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.titleRow}>
                  <Moon size={22} color={colors.primaryLight} />
                  <Text style={styles.title}>Minuteur de Sommeil</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <X size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Active Timer Indicator */}
              {sleepTimerRemainingSeconds !== null && (
                <View style={styles.activeBanner}>
                  <Text style={styles.activeBannerText}>
                    Arrêt de la musique dans :{' '}
                    <Text style={styles.activeTime}>
                      {formatRemaining(sleepTimerRemainingSeconds)}
                    </Text>
                  </Text>
                  <TouchableOpacity
                    onPress={() => cancelSleepTimer()}
                    style={styles.cancelBtn}
                  >
                    <Text style={styles.cancelBtnText}>Désactiver</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Options */}
              <Text style={styles.subtitle}>
                Arrêter automatiquement la lecture après :
              </Text>
              <View style={styles.optionsList}>
                {TIMER_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.minutes}
                    style={styles.optionItem}
                    onPress={() => {
                      startSleepTimer(opt.minutes);
                      onClose();
                    }}
                  >
                    <Text style={styles.optionText}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.surfaceCard,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    padding: 24,
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
    gap: 10,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    fontSize: 18,
  },
  closeBtn: {
    padding: 4,
  },
  activeBanner: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activeBannerText: {
    ...typography.bodySmall,
    color: colors.text,
  },
  activeTime: {
    color: colors.primaryLight,
    fontWeight: '700',
  },
  cancelBtn: {
    backgroundColor: colors.error,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  cancelBtnText: {
    ...typography.badge,
    color: '#FFF',
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  optionsList: {
    gap: 8,
    marginBottom: 16,
  },
  optionItem: {
    backgroundColor: colors.surface,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionText: {
    ...typography.bodyLarge,
    color: colors.text,
    fontSize: 15,
  },
});
