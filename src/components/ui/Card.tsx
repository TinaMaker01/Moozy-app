import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { borderRadius, shadows } from '../../theme';

/** The one surface component every screen should use for a grouped block of content. */
export const Card: React.FC<ViewProps> = ({ style, children, ...rest }) => {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surfaceCard, borderColor: colors.borderGlass },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: 16,
    ...shadows.soft,
  },
});
