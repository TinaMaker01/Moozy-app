import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { typography } from '../../theme';

interface LoadingStateProps {
  message?: string;
}

/** Shared "content is loading" placeholder — use instead of a bare ActivityIndicator. */
export const LoadingState: React.FC<LoadingStateProps> = ({ message }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.container} accessibilityRole="progressbar" accessibilityLabel={message || 'Chargement'}>
      <ActivityIndicator size="large" color={colors.primary} />
      {message ? (
        <Text style={[typography.bodySmall, styles.message, { color: colors.textMuted }]}>
          {message}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  message: {
    textAlign: 'center',
  },
});
