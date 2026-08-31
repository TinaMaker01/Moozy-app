import { PermissionsAndroid, Platform } from 'react-native';
import { requestNotificationPermission } from '../../src/services/permissions';

describe('requestNotificationPermission', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns true on non-Android platforms without requesting permissions', async () => {
    Platform.OS = 'ios';
    const requestSpy = jest.spyOn(PermissionsAndroid, 'request');

    const result = await requestNotificationPermission();

    expect(result).toBe(true);
    expect(requestSpy).not.toHaveBeenCalled();
  });

  it('returns true on Android versions lower than 33 (API 33) without prompting', async () => {
    Platform.OS = 'android';
    (Platform.constants as any).Version = 30;
    const requestSpy = jest.spyOn(PermissionsAndroid, 'request');

    const result = await requestNotificationPermission();

    expect(result).toBe(true);
    expect(requestSpy).not.toHaveBeenCalled();
  });

  it('requests POST_NOTIFICATIONS on Android API 33+ and returns true if granted', async () => {
    Platform.OS = 'android';
    (Platform.constants as any).Version = 34;
    jest
      .spyOn(PermissionsAndroid, 'request')
      .mockResolvedValueOnce(PermissionsAndroid.RESULTS.GRANTED);

    const result = await requestNotificationPermission();

    expect(result).toBe(true);
    expect(PermissionsAndroid.request).toHaveBeenCalledWith(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      expect.objectContaining({
        title: 'Notifications Moozy',
      })
    );
  });

  it('returns false when user denies POST_NOTIFICATIONS on Android API 33+', async () => {
    Platform.OS = 'android';
    (Platform.constants as any).Version = 33;
    jest
      .spyOn(PermissionsAndroid, 'request')
      .mockResolvedValueOnce(PermissionsAndroid.RESULTS.DENIED);

    const result = await requestNotificationPermission();

    expect(result).toBe(false);
  });

  it('returns false when permission request throws an exception', async () => {
    Platform.OS = 'android';
    (Platform.constants as any).Version = 33;
    jest.spyOn(PermissionsAndroid, 'request').mockRejectedValueOnce(new Error('Permission error'));

    const result = await requestNotificationPermission();

    expect(result).toBe(false);
  });
});
