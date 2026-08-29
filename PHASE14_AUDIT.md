# Phase 14 — Audit final : Moozy avant / après vs. Gramophone

> Rapport de clôture du mandat de refonte de Moozy (Phases 1 à 13). Rédigé en fin de session, sur `main`, après le tag `v1.12.0`.

## Méthode

Ce rapport synthétise les 13 phases exécutées (voir `CONTINUATION.md` pour le détail phase par phase, les bugs corrigés et les fichiers touchés). Il compare trois états :
- **Moozy avant** : l'application telle qu'auditée en Phase 1 (avant toute intervention).
- **Moozy après** : l'état actuel (`v1.12.0`).
- **Gramophone** : le lecteur de référence (Kotlin natif, Media3/ExoPlayer, Jetpack Compose, Room), pris comme repère de qualité — jamais cloné, seulement une source d'inspiration technique/UX.

Toutes les vérifications listées ci-dessous ont été faites par compilation/lint/tests/build Gradle uniquement (voir section "Limites" en bas) — **aucune n'a été confirmée visuellement sur device**.

## Tableau comparatif

| Domaine | Moozy avant | Moozy après (v1.12.0) | Gramophone | Écart restant assumé |
|---|---|---|---|---|
| **Architecture** | Store unique peu structuré, queue réinitialisée à chaque tap, pas de cycle d'import géré | Stores Zustand séparés (musique/réglages), clés de storage centralisées, queue persistée par IDs, `ErrorBoundary` | Room DB, DI, architecture MVVM Compose | Pas de couche DB relationnelle (AsyncStorage/JSON reste le stockage) — changement jugé trop invasif pour la stack RN existante |
| **Design system** | Styles dupliqués par écran, pas de thème | `ThemeProvider`/`useTheme()`, Light/Dark/System, composants `Button`/`Card`/`LoadingState`/`EmptyState`/`ErrorState` | Material 3 Compose, Dynamic Color (Material You) | Pas de Dynamic Color (nécessiterait une dépendance native, décision différée en Phase 3) |
| **Navigation** | Égaliseur dans les tabs, `ArtistDetail` déclarée mais orpheline, objets figés passés en paramètre | 3 tabs (Home/Library/Settings), Égaliseur/PlaylistDetail/ArtistDetail en stack, navigation par ID | Navigation Compose par destination typée | Fonctionnellement équivalent pour le périmètre couvert |
| **Player** | `reset()` complet à chaque lecture, pas de persistance de session | Lecture efficace (`skip()` sans reset), session complète persistée (morceau/queue/position/repeat/shuffle) | Media3 `MediaSession`, persistance native | Persistance faite côté JS (AsyncStorage) plutôt que native — suffisant pour l'usage mais moins robuste qu'un vrai `MediaSession` state |
| **Bibliothèque** | Métadonnées devinées via nom de fichier, pas de dossiers, pas de tri, pas de vue grille | Module natif Kotlin `MediaScannerModule` (vraies métadonnées MediaStore), onglet Dossiers, tri, grille albums | Scan MediaStore natif, cache Room | Pas de cache DB du scan (re-scan à chaque lancement/rebuild plutôt que delta incrémental) |
| **Recherche** | Filtrait uniquement l'onglet Pistes | Recherche unifiée catégorisée (Titres/Artistes/Albums/Playlists) | Recherche globale multi-entités | Parité atteinte sur le périmètre |
| **Playlists** | Pas de renommer/réorganiser/retirer un morceau, ordre non fiable (`trackIds` ignoré) | CRUD complet, ordre fidèle à `trackIds`, ajout depuis la bibliothèque | CRUD complet + import M3U | Pas d'import/export M3U |
| **Lyrics** | Aucune | Fichiers `.lrc` locaux, écran dédié, défilement auto synchronisé | `.lrc` local + fournisseurs en ligne (LRCLIB), affichage mot-à-mot | Pas de récupération en ligne, pas de SRT/TTML, pas de mode mot-à-mot (écarté explicitement pour rester offline-first, Phase 9) |
| **Performance** | Queue complète (objets) réécrite en JSON à chaque action | Queue persistée par IDs seulement, virtualisation FlatList réglée | Compose LazyColumn, Room réactif | Pas de mesures de perf chiffrées (FPS, mémoire) — seulement une réduction de volume I/O |
| **Offline** | Lecture bloquée silencieusement sur fichier supprimé/corrompu | `Event.PlaybackError` → auto-skip, pistes de démo masquées si bibliothèque réelle présente | 100% offline par design | Parité fonctionnelle |
| **Settings** | Réglages minimaux | Lecture, Bibliothèque (filtrage/tri/exclusions/rebuild), Interface (densité/animations/grille), Données (cache/reset) | Réglages avancés (égaliseur natif, tag editor) | Pas d'éditeur de tags audio intégré |
| **Accessibilité** | Boutons icône-seule sans label, cibles tactiles trop petites, contraste sous le seuil WCAG AA | Labels systématiques, `hitSlop`, contraste recalculé (~4.8–5.4:1) | Compose + accessibilité Android native | Parité raisonnable sur les critères vérifiables statiquement |
| **Tests** | 1 seul test, infra cassée | 49 tests (stores, lyrics parsing, debounce, ErrorBoundary) | Suite de tests Kotlin/instrumentés | Pas de tests d'intégration UI (pas d'émulateur utilisé dans cette mission) |
| **Stabilité** | Notification jamais demandée (Android 13+), lecture tuée au swipe des tâches récentes | Permission runtime demandée, `ContinuePlayback` | Service de lecture robuste en arrière-plan | Non confirmé sur device réel (voir Limites) |

## Fonctionnalités de Gramophone volontairement non reproduites

| Fonctionnalité | Pourquoi elle a été écartée |
|---|---|
| **Material You / Dynamic Color** | Nécessiterait une dépendance native supplémentaire côté Android ; jugé hors du périmètre "design system" de la Phase 3, à traiter comme décision séparée si demandé. |
| **Paroles en ligne (LRCLIB) / SRT / TTML / mot-à-mot** | Casserait le fonctionnement offline-first de Moozy et ajouterait une dépendance réseau externe ; la convention `.lrc` locale suffit à l'usage principal. |
| **Genre musical** | Peu fiable en lecture depuis `MediaStore` sur Android ; aurait affiché "Inconnu" pour la quasi-totalité des pistes, sans valeur ajoutée réelle. |
| **Import/export de playlists M3U** | Non demandé dans le mandat original, pas traité par manque de priorité (pourrait être ajouté ultérieurement sans refonte). |
| **Éditeur de tags audio intégré** | Hors périmètre du mandat (lecteur, pas éditeur de métadonnées). |
| **Cache de scan bibliothèque en base relationnelle (Room-like)** | La stack RN retenue (AsyncStorage + module natif de scan) a été jugée suffisante ; une vraie DB locale (ex. SQLite/WatermelonDB) serait un chantier à part, plus invasif que le périmètre "Bibliothèque" de la Phase 5. |

## Limites de cet audit (à lire avant de considérer le travail "terminé")

- **Aucune vérification visuelle ou fonctionnelle n'a été faite sur un téléphone ou un émulateur**, à la demande explicite de l'utilisateur (contrainte matérielle). Toutes les phases ont été validées uniquement par `tsc --noEmit`, `npm run lint`, `npm test`, et `./gradlew assembleDebug`.
- Le module natif `MediaScannerModule.kt` (le plus gros ajout natif) n'a été vérifié que par compilation — sa logique métier réelle (requête MediaStore, filtre de durée, URI de pochette) n'a jamais tourné sur un appareil.
- Les points suivants restent à confirmer par l'utilisateur en priorité :
  - Le scan MediaStore natif retourne bien les bonnes métadonnées/durées/pochettes.
  - La notification de lecture apparaît après la demande de permission runtime (Android 13+).
  - La musique continue après un swipe des tâches récentes.
  - La restauration de session au redémarrage (position, morceau, queue) fonctionne.
  - Les contrôles à l'écran verrouillé répondent.
  - Le rendu réel du thème clair (jamais vu à l'écran).
  - L'affichage et la synchronisation réelle des paroles `.lrc`.

## Conclusion

Sur les 13 phases prévues, Moozy a comblé l'essentiel de l'écart structurel et fonctionnel avec Gramophone dans le périmètre du mandat (architecture, design system, navigation, player, bibliothèque, recherche, playlists, lyrics de base, performance, offline, settings, accessibilité, tests), tout en conservant son identité et sa stack React Native. Les écarts qui subsistent sont soit des choix assumés (Dynamic Color, lyrics en ligne, genre musical), soit des chantiers hors périmètre (éditeur de tags, DB relationnelle locale), soit — le point le plus important — **des comportements jamais confirmés sur un appareil réel**, faute d'émulateur utilisable dans cette session. La priorité immédiate après cette Phase 14 est donc une validation manuelle par l'utilisateur sur un téléphone Android réel.

Ceci clôt les 14 phases du mandat original.
