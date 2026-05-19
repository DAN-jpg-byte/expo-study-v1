# expo-study-v1

Expo + Node.js でプッシュ通知の仕組みを学ぶサンプルアプリです。

ボタンを押したら届くローカル通知から、サーバーから任意のタイミングで届くプッシュ通知まで、エンドツーエンドで実装しています。

---

## 画面イメージ

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
├── my-app/                         # Expo アプリ本体
│   ├── src/
│   │   ├── app/
│   │   │   └── explore.tsx         # 通知デモ画面
│   │   └── utils/
│   │       └── notifications.ts    # 通知ユーティリティ
│   ├── app.json                    # Expo 設定
│   └── eas.json                    # EAS ビルド設定
├── server/
│   └── index.js                    # Node.js サーバー
└── docs/                           # 学習メモ・ドキュメント
```

---

## セットアップ

### 必要なもの

- Node.js
- Android Studio（エミュレーター用）
- Expo アカウント
- Firebase プロジェクト（プッシュ通知を使う場合）

### 手順

**① パッケージのインストール**

```powershell
cd my-app
npm install

cd ../server
npm install
```

**② Firebase の設定（プッシュ通知を使う場合）**

1. [Firebase Console](https://console.firebase.google.com/) でプロジェクトを作成
2. Android アプリを登録（パッケージ名: `com.anonymous.myapp`）
3. `google-services.json` をダウンロードして `my-app/` に配置
4. EAS に FCM v1 の認証情報を登録

```powershell
cd my-app
eas credentials
```

**③ アプリを起動**

```powershell
cd my-app
npx expo run:android
```

**④ サーバーを起動**

```powershell
cd server
node index.js
```

**⑤ 通知を送信**

```powershell
$body = [System.Text.Encoding]::UTF8.GetBytes('{"title":"テスト通知","body":"届きました！"}')
Invoke-RestMethod -Uri "http://localhost:3000/send" -Method POST -ContentType "application/json; charset=utf-8" -Body $body
```

---

## ドキュメント

| ファイル | 内容 |
|---------|------|
| `docs/project_learning_journey.md` | このプロジェクトの全体的な学習の流れ |
| `docs/tips_expo_push_notifications.md` | ハマりポイントと解決策まとめ |
| `docs/spec_push_notifications.md` | プッシュ通知の仕様書 |
| `docs/handoff_1.md` | 実装の引き継ぎドキュメント |
