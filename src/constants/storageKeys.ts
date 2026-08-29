/**
 * Centralized AsyncStorage keys. Kept in their own module (rather than
 * exported from useMusicStore.ts) so services like audioService.ts and
 * playbackService.ts can read/write them without importing the store and
 * creating a circular dependency (the store itself imports AudioService).
 */
export const FAVORITES_STORAGE_KEY = '@moozy_favorites_v1';
export const PLAYLISTS_STORAGE_KEY = '@moozy_playlists_v1';
export const HISTORY_STORAGE_KEY = '@moozy_history_v1';
export const TRACKS_STORAGE_KEY = '@moozy_tracks_v1';
export const CURRENT_TRACK_STORAGE_KEY = '@moozy_current_track_v1';
export const QUEUE_STORAGE_KEY = '@moozy_queue_v1';
export const REPEAT_MODE_STORAGE_KEY = '@moozy_repeat_mode_v1';
export const SHUFFLE_STORAGE_KEY = '@moozy_shuffle_v1';
/** Written periodically by playbackService.ts; read back once on app start to resume close to where playback left off. */
export const PLAYBACK_POSITION_STORAGE_KEY = '@moozy_playback_position_v1';
export const THEME_MODE_STORAGE_KEY = '@moozy_theme_mode_v1';
