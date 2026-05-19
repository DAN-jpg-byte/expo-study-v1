import { useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';

// ボタンを押すたびに変わるお祝いメッセージ
const CELEBRATIONS = [
  '🎊 やったー！すごい！',
  '🚀 天才プログラマー誕生！',
  '💪 最強すぎる！',
  '🌟 スタートアップ界のレジェンド！',
  '🔥 コード、燃えてるぜ！',
  '🦄 伝説のデベロッパー！',
];

export default function HomeScreen() {
  const [pressCount, setPressCount] = useState(0);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  function handlePress() {
    setPressCount((prev) => prev + 1);

    // ボタンを押したときのバウンス + 左右に揺れるアニメーション
    Animated.parallel([
      Animated.sequence([
        Animated.spring(scaleAnim, { toValue: 1.3, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.timing(rotateAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.timing(rotateAnim, { toValue: -1, duration: 150, useNativeDriver: true }),
        Animated.timing(rotateAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]),
    ]).start();
  }

  const buttonLabel = CELEBRATIONS[pressCount % CELEBRATIONS.length];
  const rotate = rotateAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-12deg', '0deg', '12deg'],
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* 上部の花火デコレーション */}
      <Text style={styles.decoEmoji}>🎆</Text>

      {/* メインタイトル */}
      <Text style={styles.mainTitle}>アプリ開発、成功！</Text>
      <Text style={styles.subtitle}>おめでとうございます！🎉</Text>

      {/* 面白いボタン（押すたびにメッセージが変わる） */}
      <Animated.View style={{ transform: [{ scale: scaleAnim }, { rotate }] }}>
        <Pressable style={styles.funButton} onPress={handlePress}>
          <Text style={styles.buttonText}>{buttonLabel}</Text>
        </Pressable>
      </Animated.View>

      {/* 押した回数カウンター */}
      {pressCount > 0 && (
        <Text style={styles.pressCount}>押した回数: {pressCount} 回 🔥</Text>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#7C3AED', // 鮮やかな紫色の背景
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.four,
    paddingHorizontal: Spacing.four,
  },
  decoEmoji: {
    fontSize: 80,
  },
  mainTitle: {
    fontSize: 42,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
  },
  subtitle: {
    fontSize: 20,
    color: '#E9D5FF',
    textAlign: 'center',
  },
  funButton: {
    backgroundColor: '#FBBF24', // 黄金色のボタン
    paddingHorizontal: Spacing.six,
    paddingVertical: Spacing.three,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
  },
  pressCount: {
    fontSize: 16,
    color: '#DDD6FE',
    marginTop: Spacing.two,
  },
});
