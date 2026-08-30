import React, { useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AudioSlider } from '../components/AudioSlider';
import { ChevronLeft, RotateCcw, Sliders, TriangleAlert, Volume2, Waves } from 'lucide-react-native';
import { borderRadius, ColorTokens, shadows, typography } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useSettingsStore } from '../store/useSettingsStore';
import { EqualizerPreset, EqualizerSettings } from '../types/music';

const PRESETS: EqualizerPreset[] = [
  'Flat',
  'Bass Boost',
  'Vocal Boost',
  'Electronic',
  'Rock',
  'Pop',
  'Acoustic',
  'Jazz',
];

const BANDS: { key: keyof EqualizerSettings['bands']; label: string }[] = [
  { key: 'hz60', label: '60 Hz' },
  { key: 'hz230', label: '230 Hz' },
  { key: 'hz910', label: '910 Hz' },
  { key: 'hz3600', label: '3.6 kHz' },
  { key: 'hz14000', label: '14 kHz' },
];

export const EqualizerScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const {
    equalizer,
    equalizerSupported,
    setEqualizerPreset,
    setBandGain,
    setBassBoost,
    setVirtualizer,
  } = useSettingsStore();

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            accessibilityRole="button"
            accessibilityLabel="Retour"
          >
            <ChevronLeft size={22} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerTitles}>
            <Text style={styles.headerTitle}>Égaliseur Audio</Text>
            <Text style={styles.headerSubtitle}>
              Sculptez le son selon vos préférences
            </Text>
          </View>
          <TouchableOpacity
            style={styles.resetBtn}
            onPress={() => setEqualizerPreset('Flat')}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            accessibilityRole="button"
            accessibilityLabel="Réinitialiser l'égaliseur"
          >
            <RotateCcw size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {equalizerSupported === false && (
          <View style={styles.unsupportedBanner}>
            <TriangleAlert size={16} color={colors.textMuted} />
            <Text style={styles.unsupportedText}>
              Cet appareil ne prend pas en charge les effets audio natifs — les réglages
              ci-dessous n'auront pas d'effet sur le son.
            </Text>
          </View>
        )}

        {/* Preset Selector Carousel */}
        <Text style={styles.sectionHeading}>Profils Prédéfinis</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.presetsList}
        >
          {PRESETS.map((p) => {
            const isSelected = equalizer.preset === p;
            return (
              <TouchableOpacity
                key={p}
                style={[
                  styles.presetChip,
                  isSelected && styles.presetChipSelected,
                ]}
                onPress={() => setEqualizerPreset(p)}
                disabled={!equalizerSupported}
              >
                <Text
                  style={[
                    styles.presetText,
                    isSelected && styles.presetTextSelected,
                  ]}
                >
                  {p}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* 5-Band Graphic Equalizer */}
        <View style={styles.eqBox}>
          <View style={styles.eqBoxHeader}>
            <Sliders size={18} color={colors.primaryLight} />
            <Text style={styles.eqBoxTitle}>Bandes de Fréquences (dB)</Text>
          </View>

          <View style={styles.bandsContainer}>
            {BANDS.map((b) => {
              const val = equalizer.bands[b.key];
              return (
                <View key={b.key} style={styles.bandCol}>
                  <Text style={styles.gainText}>
                    {val > 0 ? `+${val}` : `${val}`}
                  </Text>
                  <View style={styles.sliderVerticalWrapper}>
                    <AudioSlider
                      style={styles.bandSlider}
                      minimumValue={-10}
                      maximumValue={10}
                      step={1}
                      value={val}
                      minimumTrackTintColor={colors.primary}
                      maximumTrackTintColor={colors.progressBarBg}
                      thumbTintColor={colors.primaryLight}
                      onValueChange={(newGain) => setBandGain(b.key, newGain)}
                      disabled={!equalizerSupported}
                      accessibilityLabel={`Bande ${b.label}`}
                      accessibilityValue={{ min: -10, max: 10, now: val }}
                    />
                  </View>
                  <Text style={styles.bandLabel}>{b.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Sound Effects & Boosters */}
        <Text style={styles.sectionHeading}>Effets & Spatialisation</Text>

        {/* Bass Boost */}
        <View style={styles.effectCard}>
          <View style={styles.effectHeader}>
            <View style={styles.effectIconWrapper}>
              <Volume2 size={20} color={colors.accent} />
            </View>
            <View style={styles.effectInfo}>
              <Text style={styles.effectTitle}>Amplification des Basses</Text>
              <Text style={styles.effectSubtitle}>
                Basses profondes et percutantes
              </Text>
            </View>
            <Text style={styles.effectValue}>{equalizer.bassBoost}%</Text>
          </View>

          <AudioSlider
            style={styles.horizontalSlider}
            minimumValue={0}
            maximumValue={100}
            step={5}
            value={equalizer.bassBoost}
            minimumTrackTintColor={colors.accent}
            maximumTrackTintColor={colors.progressBarBg}
            thumbTintColor={colors.accent}
            onValueChange={setBassBoost}
            disabled={!equalizerSupported}
            accessibilityLabel="Amplification des basses"
            accessibilityValue={{ min: 0, max: 100, now: equalizer.bassBoost }}
          />
        </View>

        {/* 3D Virtualizer */}
        <View style={styles.effectCard}>
          <View style={styles.effectHeader}>
            <View style={[styles.effectIconWrapper, styles.cyanIconWrapper]}>
              <Waves size={20} color={colors.secondary} />
            </View>
            <View style={styles.effectInfo}>
              <Text style={styles.effectTitle}>Spatialisation 3D (Surround)</Text>
              <Text style={styles.effectSubtitle}>
                Élargissement de la scène stéréo
              </Text>
            </View>
            <Text style={styles.effectValue}>{equalizer.virtualizer}%</Text>
          </View>

          <AudioSlider
            style={styles.horizontalSlider}
            minimumValue={0}
            maximumValue={100}
            step={5}
            value={equalizer.virtualizer}
            minimumTrackTintColor={colors.secondary}
            maximumTrackTintColor={colors.progressBarBg}
            thumbTintColor={colors.secondary}
            onValueChange={setVirtualizer}
            disabled={!equalizerSupported}
            accessibilityLabel="Spatialisation 3D"
            accessibilityValue={{ min: 0, max: 100, now: equalizer.virtualizer }}
          />
        </View>
      </ScrollView>
    </View>
  );
};

function createStyles(colors: ColorTokens) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingBottom: 120,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 16,
      gap: 12,
    },
    headerTitles: {
      flex: 1,
    },
    headerTitle: {
      ...typography.hero,
      color: colors.text,
      fontSize: 22,
    },
    headerSubtitle: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      marginTop: 2,
    },
    backBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.surfaceCard,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.borderGlass,
    },
    resetBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.surfaceCard,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.borderGlass,
    },
    unsupportedBanner: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
      marginHorizontal: 20,
      marginBottom: 12,
      padding: 12,
      borderRadius: borderRadius.md,
      backgroundColor: colors.surfaceCard,
      borderWidth: 1,
      borderColor: colors.borderGlass,
    },
    unsupportedText: {
      ...typography.bodySmall,
      color: colors.textMuted,
      flex: 1,
      lineHeight: 18,
    },
    sectionHeading: {
      ...typography.h2,
      color: colors.text,
      fontSize: 16,
      paddingHorizontal: 20,
      marginTop: 12,
      marginBottom: 12,
    },
    presetsList: {
      paddingHorizontal: 20,
      gap: 8,
      paddingBottom: 16,
    },
    presetChip: {
      paddingHorizontal: 16,
      paddingVertical: 9,
      borderRadius: borderRadius.round,
      backgroundColor: colors.surfaceCard,
      borderWidth: 1,
      borderColor: colors.border,
    },
    presetChipSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
      ...shadows.glow(colors.primaryGlow),
    },
    presetText: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    presetTextSelected: {
      color: '#FFF',
      fontWeight: '700',
    },
    eqBox: {
      marginHorizontal: 20,
      backgroundColor: colors.surfaceCard,
      borderRadius: borderRadius.xl,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.borderGlass,
      marginBottom: 16,
      ...shadows.soft,
    },
    eqBoxHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 16,
    },
    eqBoxTitle: {
      ...typography.bodyLarge,
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
    },
    bandsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingVertical: 12,
    },
    bandCol: {
      alignItems: 'center',
      gap: 6,
    },
    gainText: {
      ...typography.badge,
      color: colors.primaryLight,
      fontSize: 11,
      minHeight: 14,
    },
    sliderVerticalWrapper: {
      height: 140,
      width: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    bandSlider: {
      width: 140,
      height: 40,
      transform: [{ rotate: '-90deg' }],
    },
    bandLabel: {
      ...typography.bodySmall,
      color: colors.textMuted,
      fontSize: 10,
      marginTop: 4,
    },
    effectCard: {
      marginHorizontal: 20,
      backgroundColor: colors.surfaceCard,
      borderRadius: borderRadius.xl,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.borderGlass,
      marginBottom: 12,
      ...shadows.soft,
    },
    effectHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    effectIconWrapper: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(236, 72, 153, 0.15)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    cyanIconWrapper: {
      backgroundColor: 'rgba(6, 182, 212, 0.15)',
    },
    effectInfo: {
      flex: 1,
      marginLeft: 12,
    },
    effectTitle: {
      ...typography.bodyLarge,
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
    },
    effectSubtitle: {
      ...typography.bodySmall,
      color: colors.textMuted,
      fontSize: 11,
    },
    effectValue: {
      ...typography.bodyLarge,
      color: colors.primaryLight,
      fontWeight: '700',
    },
    horizontalSlider: {
      width: '100%',
      height: 36,
    },
  });
}

export default EqualizerScreen;
