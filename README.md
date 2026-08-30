# Moozy

Un lecteur de musique Android en React Native : bibliothèque locale, lecture en arrière-plan avec contrôle depuis la notification et l'écran verrouillé, playlists, favoris, égaliseur, minuteur de sommeil.

> Un scaffold iOS existe dans `ios/` mais n'est pas fonctionnel aujourd'hui — la permission d'accès à la musique n'y est pas déclarée et il n'y a pas d'équivalent du scanner natif Android. Ne pas s'y fier tant qu'un vrai chantier iOS n'a pas été fait.

## Stack technique

- **React Native** 0.78 / **React** 19 / **TypeScript**
- **react-native-track-player** — moteur de lecture, notification média, contrôle lockscreen
- **zustand** — état global (bibliothèque, lecture, paramètres)
- **@react-navigation** (bottom-tabs + native-stack) — navigation
- **react-native-fs** — scan du stockage local pour découvrir les fichiers audio
- **AsyncStorage** — persistance locale (favoris, playlists, historique, bibliothèque)

## Prérequis

- Node.js (>=18)
- Environnement React Native configuré (Android Studio)

## Installation

```bash
npm install
```

## Lancer l'app

```bash
npx react-native run-android
```

Pour un appareil physique : activer le mode développeur + débogage USB, le connecter, puis vérifier qu'il est détecté (`adb devices`) avant de lancer la commande ci-dessus.

## Structure du projet

```text
├── android/                 # Configuration native Android
├── ios/                     # Scaffold React Native standard, non fonctionnel actuellement (voir plus haut)
├── src/
│   ├── components/          # Composants UI partagés (MiniPlayer, modales, visualiseur…)
│   ├── hooks/                # Hooks partagés (scan de bibliothèque…)
│   ├── navigation/           # Configuration de la navigation
│   ├── screens/               # Écrans de l'application
│   ├── services/               # Lecture audio (TrackPlayer) et scan du stockage local
│   ├── store/                   # État global zustand (musique, paramètres)
│   ├── theme/                    # Design tokens (couleurs, typographie, espacements)
│   ├── types/                     # Types partagés (Track, Playlist, navigation…)
│   └── utils/                      # Utilitaires (palette dynamique par morceau…)
├── App.tsx                  # Point d'entrée
├── index.js                 # Point d'entrée du bundle JS
├── metro.config.js          # Configuration Metro
├── package.json
└── tsconfig.json
```

## Tests

```bash
npm test
```
