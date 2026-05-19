# このプロジェクトで学んだこと・作った流れ

> 「初心者がどんな順番でプッシュ通知アプリを作ったか」を丸ごと記録したドキュメントです。
> 忘れてしまったときに、ここを上から読むだけで全体像と手順を思い出せるように書いています。

---

## 📦 このプロジェクトで作ったもの

**「サーバーからスマホに通知を送れるアプリ」** です。

具体的には：
- Android エミュレーター（仮想スマホ）でアプリを起動する
- PC 上で動く Node.js サーバーから「通知を送れ！」と命令する
- エミュレーターに通知が届く 🔔

---

## 🗺️ 全体の仕組み（完成イメージ）

```
[Androidエミュレーター（仮想スマホ）]
    ① アプリが起動すると、Expo Push Token（通知の宛先）を取得する
    ② そのトークンをサーバーに自動で送信する

          ↕ (インターネット通信)

[Node.js サーバー（自分の PC 上で動いている）]
    ③ トークンを受け取って保存する
    ④ 「通知を送れ！」というコマンドを受け取ったら Expo に依頼する

          ↕ (インターネット通信)

[Expo Push API（Expo 社のサーバー）]
    ⑤ Firebase（Google）経由でエミュレーターに通知を転送する

          ↕ (インターネット通信)

[Androidエミュレーター（仮想スマホ）]
    ⑥ 通知が届く！🔔
```

### ポイント：なぜ「Expo」と「Firebase」の両方が出てくるの？

| 役割 | 担当 |
|------|------|
| 通知の「送り方」のルール（API） | **Expo Push API**（Expo 社が提供） |
| Android に通知を実際に届ける仕組み | **Firebase（FCM）**（Google が提供） |

Expo が間に入ってくれるおかげで、開発者は Firebase を直接操作しなくて済む。
ただし裏側では Firebase が動いているので、その認証設定は必要。

---

## 📁 フォルダ構成

```
expo-study-v1/              ← プロジェクト全体の親フォルダ（ここが git のルート）
├── my-app/                 ← Expo アプリ本体
│   ├── src/
│   │   ├── app/
│   │   │   └── explore.tsx         ← 通知デモの画面
│   │   └── utils/
│   │       └── notifications.ts    ← 通知関連の処理をまとめた関数集
│   ├── google-services.json        ← Firebase の認証ファイル（Android 用）
│   └── app.json                    ← Expo の設定ファイル
├── server/
│   └── index.js                    ← Node.js サーバー（通知を送る命令を出す）
└── docs/                           ← このドキュメントたちが入っているフォルダ
```

---

## 🏁 Phase 1：ローカル通知を作る

### 目標

**「ボタンを押したら 3 秒後に通知が届く」** というデモを作る。
サーバーもインターネットも不要。スマホ単体で完結する通知。

### ローカル通知とは？

アプリ自身が自分に送る通知のこと。
タイマーアプリの「時間になりました！」や、リマインダーアプリの通知がこの仕組み。

---

### Step 1：パッケージをインストールする

```powershell
cd my-app
npx expo install expo-notifications
```

**「パッケージ」** とは、他の人が作った便利な機能のセット。
`expo-notifications` をインストールすることで、通知を扱うための関数が使えるようになる。

---

### Step 2：`app.json` に設定を追加する

`app.json` はアプリ全体の設定ファイル。
通知機能を使いますよ、という宣言を追加する。

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/images/icon.png",
          "color": "#ffffff"
        }
      ]
    ]
  }
}
```

---

### Step 3：通知ユーティリティを作る

`src/utils/notifications.ts` を新規作成。
通知に関係する処理をここに集める。

```typescript
// 通知の権限をリクエストして、Androidのチャンネルを設定する関数
export async function setupNotifications() { ... }

// 指定した秒数後にローカル通知を送る関数
export async function scheduleLocalNotification(seconds: number) { ... }
```

**「ユーティリティ（utility）」** = 便利な道具箱のこと。
よく使う処理をひとつのファイルにまとめておくと、どこからでも呼び出せる。

---

### Step 4：画面にボタンを追加する

`src/app/explore.tsx` にボタンを置いて、押すと `scheduleLocalNotification(3)` を呼び出す。

---

### ハマりポイント：通知の「権限リクエスト」が必要

スマホは、アプリが勝手に通知を送ることを許可していない。
**ユーザーに「通知を許可しますか？」と聞いて、OKをもらう必要がある。**

```typescript
const { status } = await Notifications.requestPermissionsAsync();
if (status !== 'granted') {
  alert('通知の権限がありません');
  return;
}
```

---

## 🚀 Phase 2：プッシュ通知を作る

### 目標

**「サーバーから任意のタイミングで通知を届ける」** 仕組みを作る。
これが「本物のアプリ」の通知の仕組みと同じもの。

---

### Step 1：Firebase プロジェクトを作る

Android のプッシュ通知は **Google の Firebase（FCM: Firebase Cloud Messaging）** という仕組みを使う。
まず Firebase Console（ウェブサイト）でプロジェクトを作る必要がある。

**やること：**
1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 新しいプロジェクトを作成
3. Android アプリを登録（パッケージ名: `com.anonymous.myapp`）
4. `google-services.json` をダウンロードして `my-app/` フォルダに配置

**`google-services.json` とは？**
アプリと Firebase プロジェクトをつなぐ「合い言葉」のようなファイル。
これがないと Firebase と通信できない。

---

### Step 2：`app.json` に Firebase の設定を追加する

```json
{
  "expo": {
    "android": {
      "googleServicesFile": "./google-services.json"
    }
  }
}
```

**重要：`google-services.json` を置く前にビルドしてはいけない！**
順番を間違えると Firebase が初期化されず通知が届かない。
詳細は `tips_expo_push_notifications.md` の「Tips #2」を参照。

---

### Step 3：開発ビルドをエミュレーターで起動する

```powershell
cd my-app
npx expo run:android
```

**「Expo Go」ではなく「開発ビルド」を使う理由：**
Expo Go は Expo 社が作った汎用アプリで、SDK 49 以降はプッシュ通知に対応していない。
`npx expo run:android` は自分専用のアプリをビルドして起動するので、通知機能が使える。

このコマンドを実行すると：
1. Android 向けのネイティブコードが生成される（`android/` フォルダが作られる）
2. エミュレーターにアプリがインストールされる
3. アプリが起動する

**初回は 5〜10 分かかる**ことがある（2回目以降は速い）。

---

### Step 4：EAS の設定と Push Token を取得する

**「EAS（Expo Application Services）」とは？**
Expo が提供するクラウドサービス。ビルドや通知の管理を助けてくれる。

Expo Push Token を取得するには EAS のプロジェクト ID が必要。

```powershell
# EAS CLI（コマンドラインツール）をインストール
npm install -g eas-cli

# EAS プロジェクトを初期化（app.json に projectId が自動追加される）
eas init
```

**アプリ側のコード（`notifications.ts` に追加）：**

```typescript
// Expo Push Token を取得する関数
export async function getExpoPushToken(): Promise<string> {
  const { data: token } = await Notifications.getExpoPushTokenAsync({
    projectId: Constants.expoConfig?.extra?.eas?.projectId,
  });
  return token;
}
```

**「Expo Push Token」とは？**
`ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]` という形の文字列。
スマホへの「住所」のようなもの。この住所に向けて通知を送ると届く。

---

### Step 5：Node.js サーバーを作る

```
server/
└── index.js    ← これを新規作成
```

**サーバーの役割：**
- アプリから Push Token を受け取って保存する
- 「通知を送れ！」という命令を受けたら Expo Push API に依頼する

```javascript
// POST /register → アプリからトークンを受け取って保存する
app.post('/register', (req, res) => { ... });

// POST /send → 登録済みの全端末に通知を送る
app.post('/send', async (req, res) => { ... });
```

**サーバーの起動：**

```powershell
cd server
node index.js
# → 🚀 サーバー起動しました: http://localhost:3000
```

**エミュレーターからサーバーへの接続に注意：**
エミュレーター（仮想スマホ）の中からは `localhost` が自分自身（エミュレーター）を指してしまう。
PC 上のサーバーにアクセスするには特別なアドレスを使う。

```
❌ http://localhost:3000     （エミュレーター自身を指してしまう）
✅ http://10.0.2.2:3000      （Android エミュレーターから PC の localhost を指す特殊アドレス）
```

---

### Step 6：FCM v1 認証情報を EAS に登録する

Expo Push API が Firebase（FCM）を使って通知を届けるには、**サービスアカウントキー** が必要。
これは「Expo が Firebase を操作する許可証」のようなもの。

**手順：**

1. Firebase Console → 歯車アイコン → プロジェクトの設定 → 「サービスアカウント」タブ
2. 「新しい秘密鍵の生成」→ JSON ファイルをダウンロード
3. 以下のコマンドで EAS に登録

```powershell
cd my-app
eas build:configure    # eas.json を生成
eas credentials        # → Android → FCM V1 → JSON ファイルのパスを入力
```

4. JSON ファイルはアップロード後すぐに削除（セキュリティのため）

**なぜ「v1」なのか？**
Google が 2024 年 6 月に旧方式（レガシー API）を廃止した。
現在は FCM v1（サービスアカウント方式）が必須。

---

### Step 7：動作確認

**ターミナルを 3 つ開いて以下の順で実行：**

**ターミナル① アプリ起動**
```powershell
cd C:\dev\react-native\expo-study-v1\my-app
npx expo run:android
```

**ターミナル② サーバー起動**
```powershell
cd C:\dev\react-native\expo-study-v1\server
node index.js
```
→ アプリがトークンを自動送信するので、ログに `✅ トークン登録: ExponentPushToken[...]` と出れば成功。

**ターミナル③ 通知を送信**
```powershell
# 日本語を含む場合は UTF-8 変換が必要
$body = [System.Text.Encoding]::UTF8.GetBytes('{"title":"テスト通知","body":"サーバーから届きました！"}')
Invoke-RestMethod -Uri "http://localhost:3000/send" -Method POST -ContentType "application/json; charset=utf-8" -Body $body
```

エミュレーターに通知が届けば 🎉 完成！

---

## 🗂️ 作ったファイルまとめ

| ファイル | 役割 |
|---------|------|
| `my-app/src/utils/notifications.ts` | 権限リクエスト・Token 取得・通知スケジュール |
| `my-app/src/app/explore.tsx` | 通知デモの画面（ボタン・Token 表示） |
| `my-app/app.json` | Firebase 設定・EAS projectId を追加 |
| `my-app/google-services.json` | Firebase の認証ファイル（Android 用） |
| `server/index.js` | Node.js サーバー（Token 保存・通知送信） |

---

## 🔑 この学習で身についた知識

| 学んだこと | 内容 |
|-----------|------|
| ローカル通知 | アプリ自身が自分にスケジュールで通知を送る仕組み |
| プッシュ通知の流れ | アプリ → サーバー → Expo API → FCM → 端末 の全経路 |
| Expo Push Token | 端末への「住所」。これがないと通知を届けられない |
| Firebase / FCM | Google の通知インフラ。Android 通知には必須 |
| EAS | Expo のクラウドサービス。認証情報の管理に使用 |
| モノレポ構成 | アプリとサーバーを 1 つのリポジトリで管理する設計 |
| エミュレーターの特殊 IP | `10.0.2.2` = エミュレーターから見た PC の localhost |
| PowerShell の UTF-8 問題 | 日本語送信時はバイト列変換が必要 |

---

## ❓ よくある疑問

**Q. Expo Go じゃダメなの？**
A. SDK 49 以降、Expo Go はプッシュ通知に非対応。`npx expo run:android` で開発ビルドを使う。

**Q. サーバーを止めたらトークンは消える？**
A. 消える。`server/index.js` はメモリ（配列）にトークンを保存しているため、サーバーを再起動するとリセットされる。本番では DB に保存する。

**Q. iPhone（iOS）でも同じように動く？**
A. 基本的な流れは同じだが、iOS は Apple の APNs（Apple Push Notification service）が必要。また実機ビルドには Apple Developer Program（有料）への加入が必要。

**Q. フォルダをリネームしたらビルドが壊れた**
A. `android/` フォルダに古いパスがハードコードされているのが原因。削除して再ビルドすれば直る。詳細は `tips_expo_push_notifications.md` の「Tips #10」を参照。
