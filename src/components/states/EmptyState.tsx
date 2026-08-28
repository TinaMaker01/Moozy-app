import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { typography } from '../../theme';
import { Button } from '../ui/Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** Shared "nothing here yet" placeholder — an icon, a title, an optional call to action. */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  message,
  actionLabel,
  onAction,
}) => {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      {icon}
      <Text style={[typography.h2, styles.title, { color: colors.textSecondary }]}>{title}</Text>
      {message ? (
        <Text style={[typography.bodySmall, styles.message, { color: colors.textMuted }]}>
          {message}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} style={styles.action} />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 30,
    gap: 12,
  },
  title: {
    fontSize: 17,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
  },
  action: {
    marginTop: 8,
  },
});
