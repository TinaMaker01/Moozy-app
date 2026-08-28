import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TriangleAlert } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { typography } from '../../theme';
import { Button } from '../ui/Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

/** Shared "something went wrong" placeholder with an optional retry action. */
export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Une erreur est survenue',
  message,
  onRetry,
}) => {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <TriangleAlert size={40} color={colors.error} />
      <Text style={[typography.h2, styles.title, { color: colors.text }]}>{title}</Text>
      {message ? (
        <Text style={[typography.bodySmall, styles.message, { color: colors.textMuted }]}>
          {message}
        </Text>
      ) : null}
      {onRetry ? <Button label="Réessayer" onPress={onRetry} style={styles.action} /> : null}
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
