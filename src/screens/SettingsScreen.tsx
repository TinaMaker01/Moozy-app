import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  FolderSync,
  HardDrive,
  Headphones,
  Moon,
  Sliders,
  Smartphone,
  Sparkles,
  Sun,
  Vibrate,
} from 'lucide-react-native';
import { borderRadius, ColorTokens, shadows, typography } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useMusicStore } from '../store/useMusicStore';
import { ThemeMode, useSettingsStore } from '../store/useSettingsStore';
import { SleepTimerModal } from '../components/SleepTimerModal';
import { RootStackParamList } from '../types/navigation';
import { useLibraryScan } from '../hooks/useLibraryScan';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const APPEARANCE_OPTIONS: { id: ThemeMode; label: string; icon: any }[] = [
  { id: 'light', label: 'Clair', icon: Sun },
  { id: 'dark', label: 'Sombre', icon: Moon },
  { id: 'system', label: 'Système', icon: Smartphone },
];

export const SettingsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [sleepModalVisible, setSleepModalVisible] = useState(false);
  const { isScanning, scan } = useLibraryScan();

  const tracks = useMusicStore((s) => s.tracks);
  const {
    themeMode,
    setThemeMode,
    hapticFeedbackEnabled,
    highQualityAudio,
    toggleHapticFeedback,
    toggleHighQualityAudio,
  } = useSettingsStore();

  const handleManualScan = async () => {
    try {
      const { found } = await scan();
      if (found.length > 0) {
        Alert.alert(
          'Scan Terminé',
          `${found.length} morceau(x) trouvé(s) sur votre appareil.`
        );
      } else {
        Alert.alert(
          'Scan Terminé',
          'Aucun nouveau fichier audio trouvé dans les dossiers standards.'
        );
      }
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de scanner les fichiers.');
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Paramètres</Text>
        </View>

        {/* Appearance Section */}
        <Text style={styles.sectionHeader}>Apparence</Text>
        <View style={styles.sectionCard}>
          <View style={styles.appearanceRow}>
            {APPEARANCE_OPTIONS.map((option) => {
              const isSelected = themeMode === option.id;
              const Icon = option.icon;
              return (
                <TouchableOpacity
                  key={option.id}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={`Thème ${option.label}`}
                  style={[
                    styles.appearanceOption,
                    isSelected && styles.appearanceOptionSelected,
                  ]}
                  onPress={() => setThemeMode(option.id)}
                >
                  <Icon size={20} color={isSelected ? '#FFF' : colors.textSecondary} />
                  <Text
                    style={[
                      styles.appearanceLabel,
                      isSelected && styles.appearanceLabelSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Audio Quality & Haptics Section */}
        <Text style={styles.sectionHeader}>Audio & Rendu</Text>
        <View style={styles.sectionCard}>
          <View style={styles.settingItem}>
            <View style={styles.settingIconWrapper}>
              <Headphones size={20} color={colors.primaryLight} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Audio Haute Définition</Text>
              <Text style={styles.settingSubtitle}>
                Décodage Lossless / 320 kbps actif
              </Text>
            </View>
            <Switch
              value={highQualityAudio}
              onValueChange={toggleHighQualityAudio}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFF"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingItem}>
            <View style={[styles.settingIconWrapper, styles.cyanIconBg]}>
              <Vibrate size={20} color={colors.secondary} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Retour Tactile (Haptique)</Text>
              <Text style={styles.settingSubtitle}>
                Vibration légère lors des interactions
              </Text>
            </View>
            <Switch
              value={hapticFeedbackEnabled}
              onValueChange={toggleHapticFeedback}
              trackColor={{ false: colors.border, true: colors.secondary }}
              thumbColor="#FFF"
            />
          </View>
        </View>

        {/* Storage & Local Media */}
        <Text style={styles.sectionHeader}>Stockage & Médias</Text>
        <View style={styles.sectionCard}>
          <View style={styles.settingItem}>
            <View style={[styles.settingIconWrapper, styles.pinkIconBg]}>
              <HardDrive size={20} color={colors.accent} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Musiques en Mémoire</Text>
              <Text style={styles.settingSubtitle}>
                {tracks.length} pistes dans la bibliothèque
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleManualScan}
            disabled={isScanning}
          >
            {isScanning ? (
              <ActivityIndicator size="small" color={colors.primaryLight} />
            ) : (
              <FolderSync size={18} color={colors.primaryLight} />
            )}
            <Text style={styles.actionBtnText}>
              {isScanning ? 'Scan des dossiers en cours...' : 'Scanner le stockage du téléphone'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Shortcuts Section */}
        <Text style={styles.sectionHeader}>Outils Rapides</Text>
        <View style={styles.sectionCard}>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate('Equalizer')}
          >
            <View style={styles.settingIconWrapper}>
              <Sliders size={20} color={colors.primaryLight} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Égaliseur Graphique</Text>
              <Text style={styles.settingSubtitle}>
                Personnaliser les basses et fréquences
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setSleepModalVisible(true)}
          >
            <View style={[styles.settingIconWrapper, styles.amberIconBg]}>
              <Moon size={20} color="#F59E0B" />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Minuteur de Sommeil</Text>
              <Text style={styles.settingSubtitle}>
                Programmer l’arrêt automatique
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <Text style={styles.sectionHeader}>À Propos</Text>
        <View style={styles.sectionCard}>
          <View style={styles.settingItem}>
            <View style={styles.settingIconWrapper}>
              <Sparkles size={20} color={colors.primaryLight} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Moozy Music Player</Text>
              <Text style={styles.settingSubtitle}>Version 1.5.0</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <SleepTimerModal
        visible={sleepModalVisible}
        onClose={() => setSleepModalVisible(false)}
      />
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
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 16,
    },
    headerTitle: {
      ...typography.hero,
      color: colors.text,
      fontSize: 26,
    },
    sectionHeader: {
      ...typography.h2,
      color: colors.textSecondary,
      fontSize: 14,
      paddingHorizontal: 20,
      marginTop: 16,
      marginBottom: 8,
    },
    sectionCard: {
      backgroundColor: colors.surfaceCard,
      marginHorizontal: 20,
      borderRadius: borderRadius.xl,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.borderGlass,
      ...shadows.soft,
    },
    appearanceRow: {
      flexDirection: 'row',
      gap: 10,
    },
    appearanceOption: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 14,
      borderRadius: borderRadius.lg,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    appearanceOptionSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    appearanceLabel: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    appearanceLabelSelected: {
      color: '#FFF',
      fontWeight: '700',
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    settingIconWrapper: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(139, 92, 246, 0.15)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    cyanIconBg: {
      backgroundColor: 'rgba(6, 182, 212, 0.15)',
    },
    pinkIconBg: {
      backgroundColor: 'rgba(236, 72, 153, 0.15)',
    },
    amberIconBg: {
      backgroundColor: 'rgba(245, 158, 11, 0.15)',
    },
    settingInfo: {
      flex: 1,
      marginLeft: 14,
    },
    settingTitle: {
      ...typography.bodyLarge,
      color: colors.text,
      fontSize: 15,
      fontWeight: '600',
    },
    settingSubtitle: {
      ...typography.bodySmall,
      color: colors.textMuted,
      fontSize: 12,
      marginTop: 2,
    },
    divider: {
      height: 1,
      backgroundColor: colors.divider,
      marginVertical: 14,
    },
    actionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: 'rgba(139, 92, 246, 0.12)',
      paddingVertical: 12,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: 'rgba(139, 92, 246, 0.3)',
    },
    actionBtnText: {
      ...typography.bodySmall,
      color: colors.primaryLight,
      fontWeight: '700',
    },
  });
}

export default SettingsScreen;
