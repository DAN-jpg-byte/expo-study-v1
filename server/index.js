const express = require('express');
const { Expo } = require('expo-server-sdk');

const app = express();
const expo = new Expo();

app.use(express.json());

// トークンをメモリに一時保存（学習用なのでシンプルに配列で管理）
const tokens = [];

// POST /register → アプリからトークンを受け取って保存する
app.post('/register', (req, res) => {
  const { token } = req.body;

  if (!token || !Expo.isExpoPushToken(token)) {
    return res.status(400).json({ error: '無効なトークンです' });
  }

  if (!tokens.includes(token)) {
    tokens.push(token);
    console.log(`✅ トークン登録: ${token}`);
  } else {
    console.log(`ℹ️  トークンは既に登録済みです`);
  }

  res.json({ success: true, tokenCount: tokens.length });
});

// POST /send → 登録済みの全端末に通知を送る
app.post('/send', async (req, res) => {
  const { title, body } = req.body;

  if (tokens.length === 0) {
    return res.status(400).json({ error: 'トークンが1件も登録されていません。先にアプリを起動してください。' });
  }

  // Expo Push API に渡すメッセージを作成
  const messages = tokens.map((token) => ({
    to: token,
    title: title || 'テスト通知 🔔',
    body: body || 'サーバーから送りました！',
  }));

  // 大量送信に備えてチャンク分割（今回は1件だけだが、本番と同じ書き方）
  const chunks = expo.chunkPushNotifications(messages);
  const results = [];

  for (const chunk of chunks) {
    const receipts = await expo.sendPushNotificationsAsync(chunk);
    results.push(...receipts);
  }

  console.log(`📨 通知を送信しました（${tokens.length}台）`);
  res.json({ success: true, results });
});

// サーバー起動
app.listen(3000, () => {
  console.log('');
  console.log('🚀 サーバー起動しました: http://localhost:3000');
  console.log('');
  console.log('使い方:');
  console.log('  POST /register  → アプリからトークンを登録');
  console.log('  POST /send      → 全端末に通知を送信');
  console.log('');
});
