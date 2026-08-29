import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { borderRadius, ColorTokens, shadows, typography } from '../theme';
import { useTheme } from '../theme/ThemeContext';

interface Props {
  visible: boolean;
  onClose: () => void;
  title: string;
  submitLabel: string;
  initialName?: string;
  initialDescription?: string;
  onSubmit: (name: string, description: string) => void;
}

/** Shared form for both creating a new playlist and renaming an existing one. */
export const PlaylistFormModal: React.FC<Props> = ({
  visible,
  onClose,
  title,
  submitLabel,
  initialName = '',
  initialDescription = '',
  onSubmit,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);

  // Reset the fields to the current values every time the modal opens, so
  // reopening it for a different playlist doesn't show stale input.
  useEffect(() => {
    if (visible) {
      setName(initialName);
      setDescription(initialDescription);
    }
  }, [visible, initialName, initialDescription]);

  const trimmedName = name.trim();

  const handleSubmit = () => {
    if (!trimmedName) {
      return;
    }
    onSubmit(trimmedName, description.trim());
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
              <Text style={styles.title}>{title}</Text>

              <TextInput
                style={styles.input}
                placeholder="Nom de la playlist"
                placeholderTextColor={colors.textMuted}
                value={name}
                onChangeText={setName}
                autoFocus
                maxLength={60}
              />
              <TextInput
                style={[styles.input, styles.descriptionInput]}
                placeholder="Description (optionnel)"
                placeholderTextColor={colors.textMuted}
                value={description}
                onChangeText={setDescription}
                maxLength={140}
                multiline
              />

              <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                  <Text style={styles.cancelBtnText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.submitBtn, !trimmedName && styles.submitBtnDisabled]}
                  onPress={handleSubmit}
                  disabled={!trimmedName}
                >
                  <Text style={styles.submitBtnText}>{submitLabel}</Text>
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
      justifyContent: 'center',
      paddingHorizontal: 24,
    },
    card: {
      backgroundColor: colors.surfaceCard,
      borderRadius: borderRadius.xl,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.borderGlass,
      ...shadows.soft,
    },
    title: {
      ...typography.h2,
      color: colors.text,
      fontSize: 18,
      marginBottom: 16,
    },
    input: {
      ...typography.bodyLarge,
      color: colors.text,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 14,
      paddingVertical: 10,
      fontSize: 15,
      marginBottom: 12,
    },
    descriptionInput: {
      minHeight: 60,
      textAlignVertical: 'top',
    },
    actionsRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 10,
      marginTop: 4,
    },
    cancelBtn: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: borderRadius.round,
    },
    cancelBtnText: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    submitBtn: {
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: borderRadius.round,
    },
    submitBtnDisabled: {
      opacity: 0.5,
    },
    submitBtnText: {
      ...typography.bodySmall,
      color: '#FFF',
      fontWeight: '700',
    },
  });
}

export default PlaylistFormModal;
