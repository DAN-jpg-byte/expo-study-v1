# WindowsでReact Nativeアプリ開発ガイド

## 環境概要

- **PC**: Windows（スペック十分）
- **実機**: iPhone
- **Android実機**: なし → エミュレーターで代替

---

## 開発ツール構成

| ツール | 用途 |
|---|---|
| Claude Code | コーディング・機能追加 |
| Expo + React Native | アプリ開発フレームワーク |
| Expo Go | iPhoneでの動作確認 |
| Android Studio エミュレーター | Android動作確認（実機不要） |
| EAS Build | iOS/Android両方のクラウドビルド |

---

## iOSとAndroid両対応できる理由

WindowsだけでiOS/Android両対応アプリを開発・公開できる。

- **iOSビルド** → EAS Build（クラウド）がAppleサーバー上でビルドしてくれる
- **Androidビルド** → EAS Build or Android Studio
- **macOSは不要**

---

## Expo Goについて

| できること | できないこと |
|---|---|
| 開発中のプレビュー | App Storeへの公開 |
| iOSで動作確認 | Google Playへの公開 |
| Androidで動作確認 | 独自のネイティブコード追加 |
| カメラ・通知など標準機能 | |

**→ まずExpo Goで開発し、公開時にEAS Buildを使う流れがおすすめ**

---

## Android実機がない場合

**Android Studioのエミュレーターで代替可能（無料）**

実機レンタルが必要になるケース：
- カメラ・GPS・加速度センサーなど特殊ハードウェアを使う機能
- ストア公開前の最終確認
- パフォーマンスの細かいチェック

**→ まずエミュレーターで開発し、公開直前に必要なら実機確認を検討**

---

## アプリ公開後のアップデート

```
Claude Codeで機能追加・修正
        ↓
Expo Goで動作確認
        ↓
EAS Buildでビルド
        ↓
App Store / Google Playに審査提出
        ↓
ユーザーのスマホに自動更新
```

### 審査時間の目安

| ストア | 審査時間 |
|---|---|
| Google Play | 数時間〜1日程度 |
| App Store | 1〜3日程度 |

### Expo Updates（審査なしで即反映）

UIの文言変更・バグ修正・軽微な機能追加はExpo Updatesを使えば審査不要で即反映可能。

---

## App Store公開に必要なもの

| 目的 | 必要なもの |
|---|---|
| 実機テスト（自分のiPhone） | 無料アカウントでOK |
| TestFlightでテスト配布 | Apple Developer（年$99） |
| App Storeに公開 | Apple Developer（年$99） |

---

## 審査について

**シンプルなアプリでも審査は通過できる。むしろシンプルな方が通りやすい。**

審査で重要なのは：
- ちゃんと動くか
- 説明通りの機能か
- 個人情報の扱いが適切か
- 違反コンテンツがないか

審査が通りやすいシンプルなアプリ例：
- メモ帳アプリ
- 家計簿アプリ
- タスク管理アプリ
- タイマーアプリ
- 日記アプリ

---

## 環境構築の手順

1. Node.js のインストール
2. Android Studio のインストール
3. `npm install -g expo-cli`
4. `npm install -g @anthropic-ai/claude-code`
5. `npx create-expo-app my-app`
6. `claude` で開発スタート

---

## Claude Codeの使い方イメージ

```bash
# プロジェクトフォルダでClaude Codeを起動
cd my-app
claude
```

あとは会話するだけ：
- 「ログイン画面を作って」
- 「このエラーを直して」
- 「ボタンを押したら次の画面に遷移するようにして」
