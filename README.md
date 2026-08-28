# Moozy

Un lecteur de musique Android/iOS en React Native : bibliothèque locale, lecture en arrière-plan avec contrôle depuis la notification et l'écran verrouillé, playlists, favoris, égaliseur, minuteur de sommeil.

## Stack technique

- **React Native** 0.78 / **React** 19 / **TypeScript**
- **react-native-track-player** — moteur de lecture, notification média, contrôle lockscreen
- **zustand** — état global (bibliothèque, lecture, paramètres)
- **@react-navigation** (bottom-tabs + native-stack) — navigation
- **react-native-fs** — scan du stockage local pour découvrir les fichiers audio
- **AsyncStorage** — persistance locale (favoris, playlists, historique, bibliothèque)

## Prérequis

- Node.js (>=18)
- Environnement React Native configuré (Android Studio et/ou Xcode)

## Installation

```bash
npm install
```

## Lancer l'app

```bash
# Android
npx react-native run-android

# iOS
npx react-native run-ios --device
```

Pour un appareil physique : activer le mode développeur + débogage USB, le connecter, puis vérifier qu'il est détecté (`adb devices` / `xcrun xctrace list devices`) avant de lancer la commande ci-dessus.

## Structure du projet

```text
├── android/                 # Configuration native Android
├── ios/                     # Configuration native iOS
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
