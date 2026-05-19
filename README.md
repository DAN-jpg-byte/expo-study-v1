# expo-study-v1

Expo + Node.js でプッシュ通知の仕組みを学ぶサンプルアプリです。

ボタンを押したら届くローカル通知から、サーバーから任意のタイミングで届くプッシュ通知まで、エンドツーエンドで実装しています。

---

## 仕組み

```
[Androidエミュレーター]          [PC上のサーバー]
  アプリ起動
    ↓ Push Token を取得
    ↓ Token をサーバーに送信  →  Token を保存
                                  POST /send を受信
    通知が届く ←←←←←←←←←←  Expo Push API に依頼
```

---

## 機能

- **ローカル通知**：ボタンを押すと3秒後に通知が届く
- **プッシュ通知**：Node.js サーバーから任意のタイミングで通知を送信できる

---

## 技術スタック

| 項目 | 技術 |
|------|------|
| アプリ | React Native + Expo SDK 55 |
| ルーティング | Expo Router |
| 通知 | expo-notifications |
| サーバー | Node.js + Express |
| 通知サービス | Expo Push API |
| Android 通知基盤 | Firebase Cloud Messaging (FCM v1) |

---

## フォルダ構成

```
expo-study-v1/
├── my-app/    # Expo アプリ本体
├── server/    # Node.js サーバー（通知送信）
└── docs/      # 学習メモ・ドキュメント
```

詳細なセットアップ手順は [`my-app/README.md`](./my-app/README.md) を参照してください。

---

## ドキュメント

| ファイル | 内容 |
|---------|------|
| `docs/project_learning_journey.md` | このプロジェクトの全体的な学習の流れ |
| `docs/tips_expo_push_notifications.md` | ハマりポイントと解決策まとめ |
| `docs/handoff_1.md` | 実装の引き継ぎドキュメント |
