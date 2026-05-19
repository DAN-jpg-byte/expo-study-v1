# ローカル通知デモ 実装ロードマップ

## 目標
ボタンを押したら3秒後にローカル通知が届くデモを作る

## Step 1: パッケージ追加 + app.json設定
- [x] expo-notifications をインストール
- [x] app.json に通知プラグインを追加

## Step 2: 通知ユーティリティ作成
- [x] src/utils/notifications.ts を新規作成
  - 権限リクエスト関数
  - Androidチャンネル設定
  - 3秒後に通知を送る関数

## Step 3: デモ画面に実装
- [x] src/app/explore.tsx にボタンを追加
  - 通知権限リクエスト（画面起動時）
  - 「3秒後に通知を送る」ボタン
