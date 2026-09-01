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
  ChevronDown,
  ChevronUp,
  Database,
  FolderSync,
  FolderX,
  HardDrive,
  Headphones,
  Moon,
  RefreshCw,
  Sliders,
  Smartphone,
  Sparkles,
  Sun,
  Trash2,
  Undo2,
  Vibrate,
  Zap,
} from 'lucide-react-native';
import { borderRadius, ColorTokens, shadows, typography } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useMusicStore } from '../store/useMusicStore';
import { DefaultSort, ListDensity, ThemeMode, useSettingsStore } from '../store/useSettingsStore';
import { SleepTimerModal } from '../components/SleepTimerModal';
import { RootStackParamList } from '../types/navigation';
import { useLibraryScan } from '../hooks/useLibraryScan';
import { useFolderGroups } from '../hooks/useFolderGroups';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const APPEARANCE_OPTIONS: { id: ThemeMode; label: string; icon: any }[] = [
  { id: 'light', label: 'Clair', icon: Sun },
  { id: 'dark', label: 'Sombre', icon: Moon },
  { id: 'system', label: 'Système', icon: Smartphone },
];

const SORT_OPTIONS: { id: DefaultSort; label: string }[] = [
  { id: 'title', label: 'Titre' },
  { id: 'artist', label: 'Artiste' },
  { id: 'recent', label: 'Récent' },
];

const DENSITY_OPTIONS: { id: ListDensity; label: string }[] = [
  { id: 'comfortable', label: 'Confortable' },
  { id: 'compact', label: 'Compacte' },
];

export const SettingsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [sleepModalVisible, setSleepModalVisible] = useState(false);
  const [foldersExpanded, setFoldersExpanded] = useState(false);
  const { isScanning, scan, rebuild } = useLibraryScan();
  const folderGroups = useFolderGroups().filter((f) => f.folder !== 'Autres morceaux');

  const tracks = useMusicStore((s) => s.tracks);
  const clearHistory = useMusicStore((s) => s.clearHistory);
  const removeTracksInFolder = useMusicStore((s) => s.removeTracksInFolder);
  const {
    themeMode,
    setThemeMode,
    hapticFeedbackEnabled,
    highQualityAudio,
    toggleHapticFeedback,
    toggleHighQualityAudio,
    resumeOnStartup,
    toggleResumeOnStartup,
    hideShortTracks,
    toggleHideShortTracks,
    excludedFolders,
    toggleExcludedFolder,
    listDensity,
    setListDensity,
    reduceMotion,
    toggleReduceMotion,
    defaultSort,
    setDefaultSort,
    resetSettings,
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

  const handleRebuildLibrary = () => {
    Alert.alert(
      'Reconstruire la bibliothèque ?',
      'Moozy re-scanne entièrement votre stockage et retire les morceaux qui ont été supprimés ou déplacés depuis le dernier scan. Vos favoris et playlists ne sont pas affectés.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Reconstruire',
          onPress: async () => {
            const result = await rebuild();
            Alert.alert('Bibliothèque reconstruite', `${result.length} piste(s) trouvée(s).`);
          },
        },
      ]
    );
  };

  const handleToggleFolder = (folder: string) => {
    const isCurrentlyExcluded = excludedFolders.includes(folder);
    toggleExcludedFolder(folder);
    if (!isCurrentlyExcluded) {
      // Newly excluded — drop its tracks from the library right away rather
      // than waiting for the next scan to notice.
      removeTracksInFolder(folder);
    }
  };

  const handleClearCache = () => {
    Alert.alert(
      'Vider le cache ?',
      'Efface l’historique des morceaux récemment écoutés. Vos favoris, playlists et votre bibliothèque ne sont pas affectés.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Vider', style: 'destructive', onPress: () => clearHistory() },
      ]
    );
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Réinitialiser les paramètres ?',
      'Apparence, lecture, bibliothèque et interface reviennent à leurs valeurs par défaut. Votre bibliothèque, vos favoris et vos playlists ne sont pas affectés.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Réinitialiser', style: 'destructive', onPress: () => resetSettings() },
      ]
    );
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
          <View style={styles.chipRow}>
            {APPEARANCE_OPTIONS.map((option) => {
              const isSelected = themeMode === option.id;
              const Icon = option.icon;
              return (
                <TouchableOpacity
                  key={option.id}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={`Thème ${option.label}`}
                  style={[styles.chipOption, isSelected && styles.chipOptionSelected]}
                  onPress={() => setThemeMode(option.id)}
                >
                  <Icon size={20} color={isSelected ? '#FFF' : colors.textSecondary} />
                  <Text style={[styles.chipLabel, isSelected && styles.chipLabelSelected]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.hintText}>
            « Système » suit le thème clair/sombre réglé sur votre téléphone.
          </Text>
        </View>

        {/* Lecture Section */}
        <Text style={styles.sectionHeader}>Lecture</Text>
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

          <View style={styles.divider} />

          <View style={styles.settingItem}>
            <View style={[styles.settingIconWrapper, styles.pinkIconBg]}>
              <RefreshCw size={20} color={colors.accent} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Reprendre la lecture au démarrage</Text>
              <Text style={styles.settingSubtitle}>
                Recharge le morceau et la position laissés en quittant l’app
              </Text>
            </View>
            <Switch
              value={resumeOnStartup}
              onValueChange={toggleResumeOnStartup}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor="#FFF"
            />
          </View>
        </View>

        {/* Bibliothèque Section */}
        <Text style={styles.sectionHeader}>Bibliothèque</Text>
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

          <View style={styles.divider} />

          <View style={styles.settingItem}>
            <View style={styles.settingIconWrapper}>
              <Zap size={20} color={colors.primaryLight} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Masquer les pistes très courtes</Text>
              <Text style={styles.settingSubtitle}>Moins de 30 secondes</Text>
            </View>
            <Switch
              value={hideShortTracks}
              onValueChange={toggleHideShortTracks}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFF"
            />
          </View>

          <View style={styles.divider} />

          <Text style={styles.subSectionTitle}>Trier par défaut</Text>
          <View style={styles.chipRow}>
            {SORT_OPTIONS.map((opt) => {
              const isSelected = defaultSort === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.smallChip, isSelected && styles.smallChipSelected]}
                  onPress={() => setDefaultSort(opt.id)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text
                    style={[styles.smallChipText, isSelected && styles.smallChipTextSelected]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setFoldersExpanded((v) => !v)}
            accessibilityRole="button"
          >
            <View style={[styles.settingIconWrapper, styles.cyanIconBg]}>
              <FolderX size={20} color={colors.secondary} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Dossiers exclus</Text>
              <Text style={styles.settingSubtitle}>
                {excludedFolders.length > 0
                  ? `${excludedFolders.length} dossier(s) exclu(s)`
                  : 'Aucun — tous les dossiers sont scannés'}
              </Text>
            </View>
            {foldersExpanded ? (
              <ChevronUp size={18} color={colors.textMuted} />
            ) : (
              <ChevronDown size={18} color={colors.textMuted} />
            )}
          </TouchableOpacity>

          {foldersExpanded && (
            <View style={styles.folderList}>
              {folderGroups.length === 0 ? (
                <Text style={styles.hintText}>
                  Scannez votre stockage pour voir vos dossiers ici.
                </Text>
              ) : (
                folderGroups.map((f) => {
                  const isExcluded = excludedFolders.includes(f.folder);
                  return (
                    <View key={f.folder} style={styles.folderRow}>
                      <View style={styles.folderInfo}>
                        <Text style={styles.folderLabel} numberOfLines={1}>
                          {f.label}
                        </Text>
                        <Text style={styles.folderCount}>{f.count} pistes</Text>
                      </View>
                      <Switch
                        value={!isExcluded}
                        onValueChange={() => handleToggleFolder(f.folder)}
                        trackColor={{ false: colors.border, true: colors.primary }}
                        thumbColor="#FFF"
                      />
                    </View>
                  );
                })
              )}
              <Text style={styles.hintText}>
                Désactiver un dossier retire immédiatement ses pistes ; le réactiver les
                récupère au prochain scan.
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          <TouchableOpacity style={styles.actionBtn} onPress={handleRebuildLibrary}>
            <RefreshCw size={18} color={colors.primaryLight} />
            <Text style={styles.actionBtnText}>Reconstruire la bibliothèque</Text>
          </TouchableOpacity>
        </View>

        {/* Interface Section */}
        <Text style={styles.sectionHeader}>Interface</Text>
        <View style={styles.sectionCard}>
          <Text style={styles.subSectionTitle}>Densité des listes</Text>
          <View style={styles.chipRow}>
            {DENSITY_OPTIONS.map((opt) => {
              const isSelected = listDensity === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.smallChip, isSelected && styles.smallChipSelected]}
                  onPress={() => setListDensity(opt.id)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text
                    style={[styles.smallChipText, isSelected && styles.smallChipTextSelected]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.divider} />

          <View style={styles.settingItem}>
            <View style={styles.settingIconWrapper}>
              <Sparkles size={20} color={colors.primaryLight} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Réduire les animations</Text>
              <Text style={styles.settingSubtitle}>
                Désactive le vinyle animé et le visualiseur audio
              </Text>
            </View>
            <Switch
              value={reduceMotion}
              onValueChange={toggleReduceMotion}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFF"
            />
          </View>

          <View style={styles.divider} />

          <Text style={styles.hintText}>
            L’affichage Liste/Grille des albums se règle directement depuis l’onglet Albums
            de la Bibliothèque.
          </Text>
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

        {/* Données Section */}
        <Text style={styles.sectionHeader}>Données</Text>
        <View style={styles.sectionCard}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleClearCache}>
            <Trash2 size={18} color={colors.primaryLight} />
            <Text style={styles.actionBtnText}>Vider le cache</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.actionBtn} onPress={handleResetSettings}>
            <Undo2 size={18} color={colors.primaryLight} />
            <Text style={styles.actionBtnText}>Réinitialiser les paramètres</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <View style={styles.settingItem}>
            <View style={styles.settingIconWrapper}>
              <Database size={20} color={colors.primaryLight} />
            </View>
            <Text style={styles.hintTextInline}>
              Les favoris, playlists et votre bibliothèque restent stockés sur l’appareil,
              même hors connexion.
            </Text>
          </View>
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
              <Text style={styles.settingSubtitle}>Version 1.18.0</Text>
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
      paddingBottom: 160,
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
    subSectionTitle: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      fontWeight: '600',
      marginBottom: 10,
    },
    chipRow: {
      flexDirection: 'row',
      gap: 10,
    },
    chipOption: {
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
    chipOptionSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    chipLabel: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    chipLabelSelected: {
      color: '#FFF',
      fontWeight: '700',
    },
    smallChip: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 9,
      borderRadius: borderRadius.round,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    smallChipSelected: {
      backgroundColor: colors.activeTrackBg,
      borderColor: colors.primary,
    },
    smallChipText: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    smallChipTextSelected: {
      color: colors.primaryLight,
      fontWeight: '700',
    },
    hintText: {
      ...typography.bodySmall,
      color: colors.textMuted,
      fontSize: 12,
      marginTop: 10,
      lineHeight: 16,
    },
    hintTextInline: {
      ...typography.bodySmall,
      color: colors.textMuted,
      fontSize: 12,
      lineHeight: 16,
      flex: 1,
      marginLeft: 14,
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
    folderList: {
      marginTop: 12,
      gap: 10,
    },
    folderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 4,
    },
    folderInfo: {
      flex: 1,
      marginRight: 12,
    },
    folderLabel: {
      ...typography.bodySmall,
      color: colors.text,
      fontWeight: '600',
    },
    folderCount: {
      ...typography.bodySmall,
      color: colors.textMuted,
      fontSize: 11,
      marginTop: 1,
    },
  });
}

export default SettingsScreen;
