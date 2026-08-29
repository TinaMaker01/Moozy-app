import { PermissionsAndroid, Platform } from 'react-native';

/**
 * On Android 13+ (API 33), declaring POST_NOTIFICATIONS in the manifest
 * isn't enough — the OS treats it as denied until the app explicitly asks
 * for it at runtime, exactly like READ_MEDIA_AUDIO. Without this, the
 * playback notification (and with it, the lockscreen transport controls
 * most Android media sessions tie to it) never appears — the app would
 * keep playing in the background with no visible way to control it.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }

  const sdkInt = Platform.constants.Version as number;
  if (sdkInt < 33) {
    return true;
  }

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      {
        title: 'Notifications Moozy',
        message:
          'Moozy affiche une notification pour contrôler la lecture depuis l’écran verrouillé et la barre de notifications.',
        buttonPositive: 'Autoriser',
        buttonNegative: 'Refuser',
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn('Notification permission request failed', err);
    return false;
  }
}
