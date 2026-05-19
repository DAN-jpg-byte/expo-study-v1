# 引き継ぎドキュメント #1

作成日: 2026-05-18（最終更新: 2026-05-19）

---

## プロジェクト概要

React Native（Expo）の学習用アプリ。初心者ユーザーが通知機能を中心に、プロの手順でアプリ開発を体験することを目的としている。

| 項目 | 値 |
|------|-----|
| 作業ディレクトリ | `C:\dev\react-native\expo-study-v1\my-app` |
| OS | Windows 11 |
| Expo SDK | 55 |
| フレームワーク | Expo Router（ファイルベースルーティング） |
| Expo アカウント | `dannnndannnn` |
| EAS プロジェクト | `@dannnndannnn/my-app` |
| EAS プロジェクト ID | `ca01ed88-94d6-4424-a908-6a61aedadf8a` |

---

## Phase 1：ローカル通知デモ ✅ 完了

ボタンを押したら3秒後にローカル通知が届くデモ。

### 実装ファイル

| ファイル | 内容 |
|---------|------|
| `src/utils/notifications.ts` | 通知ユーティリティ |
| `src/app/explore.tsx` | デモUI |
| `app.json` | `expo-notifications` プラグイン設定済み |

### `notifications.ts` の主な関数

```typescript
setupNotifications()        // 権限リクエスト＋Androidチャンネル設定
getExpoPushToken()          // Expo Push Token を取得
scheduleLocalNotification() // 指定秒数後にローカル通知をスケジュール
```

---

## Phase 2：プッシュ通知の実装 ✅ 完全完了（2026-05-19）

### 全体アーキテクチャ

```
[アプリ（Androidエミュレーター Pixel_9）]
    ↓ ① Expo Push Token を取得してサーバーに送信（✅ 動作確認済み）

[Node.js サーバー（PC上 server/index.js）]
    ↓ ② トークンを受け取って保存（✅ 動作確認済み）
    ↓ ③ POST /send で通知を命令（✅ 動作確認済み）

[Expo Push Service]
    ↓ ④ Firebase(FCM) 経由でAndroidに届ける（⚠️ FCM認証が未設定）

[エミュレーターに通知が届く] ← ここだけ未達成
```

### Firebase 設定情報

| 項目 | 値 |
|------|-----|
| Firebase プロジェクト ID | `stellar-benefit-290506` |
| Android パッケージ名 | `com.anonymous.myapp` |
| アプリのニックネーム | `React Native Test App` |
| `google-services.json` | `my-app/google-services.json` に配置済み |

### ステップ進捗

- [x] Step 1: Firebase プロジェクト作成・`google-services.json` を配置
- [x] Step 2: `app.json` に `android.googleServicesFile` を追加
- [x] Step 3: `npx expo run:android` でエミュレーター（Pixel_9）に開発ビルド起動
- [x] Step 3.5: `eas init` で EAS プロジェクト作成・projectId を `app.json` に追加
- [x] Step 4: `getExpoPushToken()` 実装・explore.tsx にToken表示UI追加・トークン取得確認
- [x] Step 5: Node.js サーバー作成（`server/index.js`）・トークン登録確認
- [x] **Step 6: FCM v1 認証情報の登録 ✅ 完了（2026-05-19）**
- [x] **Step 7: 動作確認 ✅ 完了（2026-05-19）**

### Step 6 でやったこと

1. `eas build:configure` → `eas.json` を生成（`my-app/eas.json`）
2. Firebase Console → プロジェクトの設定 → サービスアカウント → 秘密鍵（JSON）を発行
3. `eas credentials` → Android → development → Google Service Account → FCM V1 にアップロード
   - 登録済み Client Email: `firebase-adminsdk-fbsvc@stellar-benefit-290506.iam.gserviceaccount.com`
   - Private Key ID: `94da8c54f580ea9656551d10d0f8e5e1117aa14b`
4. 秘密鍵 JSON はデスクトップに置いてアップロード後に削除

---

## 🎉 プロジェクト完成！

プッシュ通知の送受信がエンドツーエンドで動作することを確認済み。

### 動作確認済みの内容
- アプリ起動 → Expo Push Token 取得 → サーバーへ自動登録
- サーバーから `POST /send` → Expo Push API → FCM V1 → エミュレーターに通知が届く
- 日本語テキストの通知も正常に届く（PowerShell の UTF-8 変換対応済み）

---

## 次回作業時の起動手順

### ① エミュレーター起動
Android Studio → Pixel_9（Google Play入り）を起動

### ② アプリ起動（ターミナル1）
```powershell
cd C:\dev\react-native\expo-study-v1\my-app
npx expo run:android
```

### ③ サーバー起動（ターミナル2）
```powershell
cd C:\dev\react-native\expo-study-v1\server
node index.js
```

### ④ 通知送信テスト（ターミナル3）
```powershell
# 日本語を使う場合は必ず UTF-8 バイト変換を使うこと
$body = [System.Text.Encoding]::UTF8.GetBytes('{"title":"テスト通知","body":"サーバーから届きました！"}')
Invoke-RestMethod -Uri "http://localhost:3000/send" -Method POST -ContentType "application/json; charset=utf-8" -Body $body
```

---

## 作業時の起動手順

### ① エミュレーター起動
Android Studio → Pixel_9（Google Play入り）を起動

### ② アプリ起動（ターミナル1）
```powershell
cd C:\dev\react-native\expo-study-v1\my-app
npx expo run:android
```

### ③ サーバー起動（ターミナル2）
```powershell
cd C:\dev\react-native\expo-study-v1\server
node index.js
```

### ④ 通知送信テスト（ターミナル3）
```powershell
$body = '{"title":"test","body":"hello from server"}'
Invoke-RestMethod -Uri "http://localhost:3000/send" -Method POST -ContentType "application/json" -Body $body
```

---

## ファイル構成

```
TEST_APP_2026_05_16/
├── my-app/                        # Expo アプリ本体
│   ├── src/
│   │   ├── app/
│   │   │   └── explore.tsx        # Push Token 表示UI・通知デモボタン
│   │   └── utils/
│   │       └── notifications.ts   # 通知ユーティリティ関数
│   ├── google-services.json       # Firebase 設定ファイル
│   └── app.json                   # Expo 設定（projectId・googleServicesFile 追加済み）
├── server/
│   ├── index.js                   # Node.js サーバー（Express）
│   └── package.json
└── docs/
    ├── handoff_1.md               # このファイル
    ├── spec_push_notifications.md
    └── roadmap_push_notifications.md
```

---

## 重要な技術メモ

- **Expo SDK 49以降、Expo GoはiOSプッシュ通知に非対応**。`expo run:android` を使うこと
- **Androidエミュレーターから PC の localhost へは `10.0.2.2` でアクセス**（`localhost` は不可）
- **`gradlew clean` は使わない**。`.cxx` キャッシュが古いと失敗する。`android/` フォルダごと削除して再生成するほうが確実
- **`google-services.json` を追加後は必ず `android/` を削除してフルビルドする**こと

## ユーザー情報

- React Native / Expo 初心者（学習目的）
- Windows 11 環境・iPhone実機あり・Androidエミュレーター（Pixel_9）あり
- 会話はすべて日本語、コメントは日本語、変数名・関数名は英語
