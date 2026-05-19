import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// フォアグラウンド時も通知を表示する設定
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * アプリ起動時に呼ぶ。通知権限のリクエストと Android チャンネルの設定を行う。
 */
export async function setupNotifications(): Promise<void> {
  // Android はチャンネルが必要
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  await Notifications.requestPermissionsAsync();
}

/**
 * Expo Push Token を取得する。
 * Android エミュレーター（Google Play入り）または実機が必要。
 */
export async function getExpoPushToken(): Promise<string> {
  // iOSはシミュレーターでは動かない（実機必須）
  if (!Device.isDevice && Platform.OS === 'ios') {
    throw new Error('iOSは実機が必要です');
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) {
    throw new Error('app.json に projectId が設定されていません');
  }

  const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
  return token;
}

/**
 * 指定した秒数後にローカル通知をスケジュールする。
 * @param seconds 何秒後に通知を届けるか
 */
export async function scheduleLocalNotification(seconds: number): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '通知が届きました！ 🎉',
      body: `ボタンを押してから ${seconds} 秒経ちました`,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
    },
  });
}
