import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import React, { useEffect, useState } from 'react';
import { Alert, Clipboard, Platform, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ExternalLink } from '@/components/external-link';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Collapsible } from '@/components/ui/collapsible';
import { WebBadge } from '@/components/web-badge';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getExpoPushToken, scheduleLocalNotification, setupNotifications } from '@/utils/notifications';

export default function TabTwoScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };
  const theme = useTheme();

  // 通知ボタンの送信中フラグ
  const [isSending, setIsSending] = useState(false);
  // Push Token（サーバーに渡す「住所」）
  const [pushToken, setPushToken] = useState<string | null>(null);

  // 画面起動時に通知の権限をリクエストし、Push Token を取得
  useEffect(() => {
    (async () => {
      await setupNotifications();
      try {
        const token = await getExpoPushToken();
        setPushToken(token);
        // トークンをサーバーに送信（10.0.2.2 = Androidエミュレーターからみたホスト機のlocalhost）
        await fetch('http://10.0.2.2:3000/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
      } catch (e) {
        console.warn('Push Token 取得失敗:', e);
      }
    })();
  }, []);

  // ボタンを押したら3秒後に通知をスケジュールする
  const handleSendNotification = async () => {
    setIsSending(true);
    await scheduleLocalNotification(3);
    setIsSending(false);
    Alert.alert('通知をセット！', '3秒後に通知が届きます。\nアプリをバックグラウンドにしてみてください');
  };

  const contentPlatformStyle = Platform.select({
    android: {
      paddingTop: insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      paddingBottom: insets.bottom,
    },
    web: {
      paddingTop: Spacing.six,
      paddingBottom: Spacing.four,
    },
  });

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentInset={insets}
      contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="subtitle">Explore</ThemedText>
          <ThemedText style={styles.centerText} themeColor="textSecondary">
            This starter app includes example{'\n'}code to help you get started.
          </ThemedText>

          <ExternalLink href="https://docs.expo.dev" asChild>
            <Pressable style={({ pressed }) => pressed && styles.pressed}>
              <ThemedView type="backgroundElement" style={styles.linkButton}>
                <ThemedText type="link">Expo documentation</ThemedText>
                <SymbolView
                  tintColor={theme.text}
                  name={{ ios: 'arrow.up.right.square', android: 'link', web: 'link' }}
                  size={12}
                />
              </ThemedView>
            </Pressable>
          </ExternalLink>
        </ThemedView>

        {/* 通知デモセクション */}
        <ThemedView style={styles.notificationSection}>
          <ThemedText type="subtitle">通知デモ</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.centerText}>
            ボタンを押すと3秒後に通知が届きます
          </ThemedText>
          <Pressable
            onPress={handleSendNotification}
            disabled={isSending}
            style={({ pressed }) => [styles.notificationButton, pressed && styles.pressed]}>
            <ThemedView type="backgroundElement" style={styles.notificationButtonInner}>
              <ThemedText type="link">
                {isSending ? 'セット中...' : '3秒後に通知を送る'}
              </ThemedText>
            </ThemedView>
          </Pressable>
        </ThemedView>

        {/* Push Token 表示セクション */}
        <ThemedView style={styles.notificationSection}>
          <ThemedText type="subtitle">Push Token</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.centerText}>
            これがこの端末の「住所」です。{'\n'}サーバーに渡すことで通知を送れます。
          </ThemedText>
          {pushToken ? (
            <Pressable
              onPress={() => {
                Clipboard.setString(pushToken);
                Alert.alert('コピーしました！', 'サーバーに貼り付けて使ってください');
              }}
              style={({ pressed }) => [styles.notificationButton, pressed && styles.pressed]}>
              <ThemedView type="backgroundElement" style={styles.tokenBox}>
                <ThemedText type="small" style={styles.tokenText}>{pushToken}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">タップでコピー</ThemedText>
              </ThemedView>
            </Pressable>
          ) : (
            <ThemedText themeColor="textSecondary">取得中...</ThemedText>
          )}
        </ThemedView>

        <ThemedView style={styles.sectionsWrapper}>
          <Collapsible title="File-based routing">
            <ThemedText type="small">
              This app has two screens: <ThemedText type="code">src/app/index.tsx</ThemedText> and{' '}
              <ThemedText type="code">src/app/explore.tsx</ThemedText>
            </ThemedText>
            <ThemedText type="small">
              The layout file in <ThemedText type="code">src/app/_layout.tsx</ThemedText> sets up
              the tab navigator.
            </ThemedText>
            <ExternalLink href="https://docs.expo.dev/router/introduction">
              <ThemedText type="linkPrimary">Learn more</ThemedText>
            </ExternalLink>
          </Collapsible>

          <Collapsible title="Android, iOS, and web support">
            <ThemedView type="backgroundElement" style={styles.collapsibleContent}>
              <ThemedText type="small">
                You can open this project on Android, iOS, and the web. To open the web version,
                press <ThemedText type="smallBold">w</ThemedText> in the terminal running this
                project.
              </ThemedText>
              <Image
                source={require('@/assets/images/tutorial-web.png')}
                style={styles.imageTutorial}
              />
            </ThemedView>
          </Collapsible>

          <Collapsible title="Images">
            <ThemedText type="small">
              For static images, you can use the <ThemedText type="code">@2x</ThemedText> and{' '}
              <ThemedText type="code">@3x</ThemedText> suffixes to provide files for different
              screen densities.
            </ThemedText>
            <Image source={require('@/assets/images/react-logo.png')} style={styles.imageReact} />
            <ExternalLink href="https://reactnative.dev/docs/images">
              <ThemedText type="linkPrimary">Learn more</ThemedText>
            </ExternalLink>
          </Collapsible>

          <Collapsible title="Light and dark mode components">
            <ThemedText type="small">
              This template has light and dark mode support. The{' '}
              <ThemedText type="code">useColorScheme()</ThemedText> hook lets you inspect what the
              user&apos;s current color scheme is, and so you can adjust UI colors accordingly.
            </ThemedText>
            <ExternalLink href="https://docs.expo.dev/develop/user-interface/color-themes/">
              <ThemedText type="linkPrimary">Learn more</ThemedText>
            </ExternalLink>
          </Collapsible>

          <Collapsible title="Animations">
            <ThemedText type="small">
              This template includes an example of an animated component. The{' '}
              <ThemedText type="code">src/components/ui/collapsible.tsx</ThemedText> component uses
              the powerful <ThemedText type="code">react-native-reanimated</ThemedText> library to
              animate opening this hint.
            </ThemedText>
          </Collapsible>
        </ThemedView>
        {Platform.OS === 'web' && <WebBadge />}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  container: {
    maxWidth: MaxContentWidth,
    flexGrow: 1,
  },
  titleContainer: {
    gap: Spacing.three,
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.six,
  },
  centerText: {
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  linkButton: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
    justifyContent: 'center',
    gap: Spacing.one,
    alignItems: 'center',
  },
  notificationSection: {
    gap: Spacing.three,
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
  },
  notificationButton: {
    width: '100%',
  },
  notificationButtonInner: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: 'center',
  },
  tokenBox: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
    gap: Spacing.one,
    alignItems: 'center',
  },
  tokenText: {
    textAlign: 'center',
  },
  sectionsWrapper: {
    gap: Spacing.five,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
  collapsibleContent: {
    alignItems: 'center',
  },
  imageTutorial: {
    width: '100%',
    aspectRatio: 296 / 171,
    borderRadius: Spacing.three,
    marginTop: Spacing.two,
  },
  imageReact: {
    width: 100,
    height: 100,
    alignSelf: 'center',
  },
});
