# プッシュ通知 実装ロードマップ

## 目標
Androidエミュレーター + Node.jsサーバーでプッシュ通知の送受信を体験する

---

## Step 1: Firebase プロジェクト作成
- [x] Firebase Console でプロジェクト新規作成
- [x] Android アプリを登録（パッケージ名: com.anonymous.myapp）
- [x] `google-services.json` をダウンロード
- [x] `my-app/` 直下に配置

## Step 2: app.json に Firebase 設定を追加
- [x] `android.googleServicesFile` を指定
- [x] `expo-notifications` プラグイン設定を確認

## Step 3: 開発ビルドをエミュレーターで起動
- [x] Google Play 入りエミュレーターを起動確認
- [x] `npx expo run:android` を実行
- [x] エミュレーターにアプリがインストールされることを確認

## Step 4: アプリ側 - Push Token 取得＆表示
- [x] `src/utils/notifications.ts` にトークン取得処理を追加
- [x] 画面にトークンを表示（コピーしやすいように）
- [x] サーバーへ自動送信する処理を追加

## Step 5: Node.js サーバー作成
- [x] `server/` フォルダを新規作成
- [x] `package.json` を初期化
- [x] `index.js` に Express サーバーを実装
  - `POST /register` → トークン保存
  - `POST /send` → Expo Push API 経由で通知送信
- [x] `node index.js` でサーバー起動

## Step 6: FCM V1 認証情報の登録
- [x] `eas build:configure` で `eas.json` を生成
- [x] Firebase Console → サービスアカウント → 秘密鍵（JSON）を発行・ダウンロード
- [x] `eas credentials` → Android → Google Service Account → FCM V1 にアップロード
  - Client Email: `firebase-adminsdk-fbsvc@stellar-benefit-290506.iam.gserviceaccount.com`
  - Private Key ID: `94da8c54f580ea9656551d10d0f8e5e1117aa14b`
- [x] デスクトップの秘密鍵JSONを削除（セキュリティのため）

## Step 7: 動作確認 ✅ 完了（2026-05-19）
- [x] エミュレーターでアプリを起動 → トークン取得を確認
- [x] サーバーを起動（`node index.js`）→ トークン登録ログを確認
- [x] `POST /send` で通知を送信
- [x] エミュレーターに通知が届くことを確認 🎉
- [x] PowerShell の日本語文字化け問題を解決（UTF-8 バイト変換で対応）

## 🎉 プッシュ通知の実装、完全完了！
