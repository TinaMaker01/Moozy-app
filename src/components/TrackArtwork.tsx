import React, { useState } from 'react';
import { Image, ImageStyle, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Music } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';

interface Props {
  uri?: string;
  // Accepts whatever style an <Image> would (width/height/borderRadius are
  // all valid ViewStyle too), so it's a drop-in swap at every call site.
  style?: StyleProp<ImageStyle>;
  iconSize?: number;
}

/**
 * Drop-in replacement for `<Image>` when the source is a track/album's own
 * artwork. Many locally-scanned tracks have no embedded cover, and
 * Android's album-art content URI doesn't always resolve (especially on
 * Android 10+ with scoped storage) — rather than a broken-image icon, this
 * falls back to a plain music-note placeholder that matches the theme.
 * Pass the same `style` you'd give an `<Image>` (it sizes/rounds either way).
 */
export const TrackArtwork: React.FC<Props> = ({ uri, style, iconSize = 24 }) => {
  const { colors } = useTheme();
  const [failed, setFailed] = useState(false);

  if (!uri || failed) {
    return (
      <View
        style={[
          styles.placeholder,
          { backgroundColor: colors.surfaceCard },
          style as StyleProp<ViewStyle>,
        ]}
      >
        <Music size={iconSize} color={colors.textMuted} />
      </View>
    );
  }

  return <Image source={{ uri }} style={style} onError={() => setFailed(true)} />;
};

const styles = StyleSheet.create({
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
