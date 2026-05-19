# プッシュ通知 仕様書

## 目的
プッシュ通知の仕組みを学習する。サーバーから任意のタイミングで通知を送れるようにする。

## テスト環境
- Android エミュレーター（Google Play 入り）
- Expo Go ではなく `expo run:android`（開発ビルド）で動作確認

## 全体の流れ

```
[アプリ（Android エミュレーター）]
    ↓ ① Expo Push Token を取得
    ↓ ② トークンをサーバーに送信

[Node.js サーバー（PC上で起動）]
    ↓ ③ トークンを保存
    ↓ ④ 「送れ！」と命令

[Expo Push Service（Expoのサーバー）]
    ↓ ⑤ Firebase(FCM) 経由でAndroidに届ける

[アプリに通知が届く！]
```

## 作るもの

### アプリ側（my-app）
- 起動時に Expo Push Token を取得
- 画面にトークンを表示（確認用）
- トークンをサーバーへ自動送信

### サーバー側（server/ フォルダに新規作成）
- Node.js + Express
- `POST /register` → トークンを受け取って保存
- `POST /send` → 全端末に通知を送信

### Firebase 設定
- Androidプッシュ通知には FCM（Firebase）が必須
- Firebase プロジェクトを作成して `google-services.json` を取得

## 使用技術
| 項目 | 技術 |
|------|------|
| アプリ | React Native + Expo (expo-notifications) |
| サーバー | Node.js + Express |
| 通知サービス | Expo Push API |
| Android通知基盤 | Firebase Cloud Messaging (FCM) |
