# Expo プッシュ通知 実装メモ（ハマりポイント集）

次回スムーズに進めるための注意書き。実際に詰まった経験をもとにまとめています。

---

## 1. Expo Go ではプッシュ通知は届かない（SDK 49以降）

**❌ ダメ**
```
expo start → Expo Go でスキャン
```

**✅ 正解**
```
npx expo run:android   ← 開発ビルドを使う
```

> Expo SDK 49 以降、Expo Go は iOS のプッシュ通知に非対応になった。
> Android は Expo Go でも動くが、開発ビルドを使うほうが本番に近く学習になる。

---

## 2. google-services.json は android/ 生成「前」に置く

**順番が大事！**

```
① google-services.json を my-app/ に置く
② app.json に android.googleServicesFile を追加
③ npx expo run:android（初回ビルド）
```

**❌ やりがちなミス**
```
① npx expo run:android（先にビルドしてしまう）
② 後から google-services.json を追加
→ Firebase が初期化されないエラーが出る
```

**後から追加した場合の修正方法：**
```powershell
# android/ フォルダを丸ごと削除して再生成
Remove-Item -Recurse -Force android
npx expo run:android
```

> `gradlew clean` は CMake キャッシュが原因で失敗することがある。
> `android/` フォルダごと削除するほうが確実。

---

## 3. Push Token 取得には EAS プロジェクト ID が必要

`getExpoPushTokenAsync()` は `projectId` がないと動かない。

**手順：**
```powershell
# 1. eas-cli をグローバルインストール（初回のみ）
npm install -g eas-cli

# 2. EAS プロジェクトを初期化（app.json に projectId が自動追加される）
eas init
```

> `npx eas init` はパッケージがないと動かない。`npm install -g eas-cli` してから `eas init`（npx なし）で実行すること。

---

## 4. EAS 設定後は必ず再ビルドする

`eas init` で `app.json` に `projectId` が追加されても、
**すでに起動中のアプリには反映されない。**

```powershell
# Metro を Ctrl+C で止めてから
npx expo run:android   ← フルビルドし直す
```

> `r`（リロード）だけでは不十分。ネイティブの設定変更はビルドし直しが必要。

---

## 5. FCM v1 認証情報の登録が必要（Google の仕様変更）

Expo Push API 経由で Android に通知を届けるには、
FCM の「サービスアカウントキー」を EAS に登録する必要がある。

**手順：**

**① Firebase Console で秘密鍵を発行**
1. Firebase Console → 歯車マーク → プロジェクトの設定
2. 「サービスアカウント」タブ
3. 「新しい秘密鍵の生成」→ JSON ファイルをダウンロード

**② EAS に登録**
```powershell
cd my-app
eas credentials
# → Android → Add/Update FCM V1 service account key → JSONファイルのパスを入力
```

> 2024年6月以降、Google は FCM レガシー API（サーバーキー）を廃止した。
> 現在は FCM v1（サービスアカウント）が必須。

---

## 6. Androidエミュレーターから PC の localhost へのアクセス

エミュレーターの中から PC 上のサーバーに接続するには特別な IP が必要。

| 接続先 | アドレス |
|--------|---------|
| PC の localhost | `10.0.2.2` |
| 同じ LAN の PC | PC の IP アドレス（例: `192.168.1.12`） |

**❌ ダメ**
```
http://localhost:3000
```

**✅ 正解**
```
http://10.0.2.2:3000
```

---

## 7. PowerShell でコマンドが失敗するとき

パラメーターとその値の間にスペースが必要。コピー貼り付け時にスペースが消えることがある。

**❌ エラーになる**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/send"-Method POST-Body'...'
```

**✅ 変数に分けると確実**
```powershell
$body = '{"title":"test","body":"hello"}'
Invoke-RestMethod -Uri "http://localhost:3000/send" -Method POST -ContentType "application/json" -Body $body
```

---

## 8. 「Push Token 取得失敗」と出ているのにトークンは画面に表示される謎

### 症状

Metro のログにこんな警告が出る：

```
WARN  Push Token 取得失敗: [TypeError: Network request failed]
```

でも、アプリの画面を見ると Push Token はちゃんと表示されている。

「え、失敗してるのに表示されてる？どっちが本当？」と混乱しやすい。

---

### 原因

`explore.tsx` の `useEffect` の中で、**2つの処理がひとつの `try-catch` でまとめて囲まれている**ことが原因。

```typescript
try {
  // ① Expo Push Token を取得（← これは成功している）
  const token = await getExpoPushToken();
  setPushToken(token);  // ← 画面への表示もここで成功している

  // ② サーバーにトークンを登録（← サーバーが起動していないので失敗）
  await fetch('http://10.0.2.2:3000/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
} catch (e) {
  // ①②どちらで失敗してもここに来る
  // エラーメッセージは「Push Token 取得失敗」だが、
  // 実際には②のサーバー登録が失敗しているだけ
  console.warn('Push Token 取得失敗:', e);
}
```

つまり：
- **トークンの取得（①）は成功** → 画面に表示される
- **サーバーへの登録（②）が失敗** → catch に落ちて「Push Token 取得失敗」と表示される

エラーメッセージが「Push Token 取得失敗」なので①が原因に見えるが、実際は②のサーバー登録が失敗しているだけ。

---

### 解決方法

**サーバーを起動するだけで解決する。**

```powershell
cd C:\dev\react-native\expo-study-v1\server
node index.js
```

サーバーが起動したら、Metro のターミナルで `r` を押してアプリをリロードする。

サーバーのログに以下が表示されれば成功：

```
✅ トークン登録: ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxxxx]
```

---

### なぜこのエラーが出るのか（仕組みの話）

Android エミュレーターの中から PC 上のサーバーにアクセスするには `10.0.2.2:3000` という特殊なアドレスを使う（[Tips #6](#6-androidエミュレーターから-pc-の-localhost-へのアクセス) 参照）。

サーバーが起動していない状態でこのアドレスに接続しようとすると、接続先が存在しないので `TypeError: Network request failed` が発生する。

---

### 再発防止のためのコード改善案

将来的に混乱しないよう、`try-catch` をトークン取得とサーバー登録で分けると原因が一目でわかるようになる：

```typescript
// ① トークン取得（失敗したら致命的）
let token: string;
try {
  token = await getExpoPushToken();
  setPushToken(token);
} catch (e) {
  console.warn('Push Token 取得失敗（Expoサーバーへの接続エラーの可能性）:', e);
  return;
}

// ② サーバー登録（失敗してもトークン表示は続ける）
try {
  await fetch('http://10.0.2.2:3000/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
} catch (e) {
  console.warn('サーバーへのトークン登録失敗（サーバーが起動していない可能性）:', e);
}
```

こうすると：
- トークン取得に失敗 → 「Push Token 取得失敗」
- サーバー登録に失敗 → 「サーバーへのトークン登録失敗」

と、エラーの原因がすぐわかるようになる。

---

## 9. PowerShell で日本語を含む通知を送ると文字化けする

### 症状

以下のコマンドで通知を送ると、エミュレーターに届いた通知のタイトルや本文が文字化けして読めない。

```powershell
# ❌ 文字化けする
$body = '{"title":"テスト通知","body":"サーバーから届きました！"}'
Invoke-RestMethod -Uri "http://localhost:3000/send" -Method POST -ContentType "application/json" -Body $body
```

---

### 原因

PowerShell 5.1（Windows のデフォルト）は文字列を **UTF-16 LE** で扱う。

`Invoke-RestMethod` に文字列をそのまま渡すと、内部で UTF-16 のまま送信されてしまい、JSON を受け取るサーバー側（Node.js）が UTF-8 として解釈しようとするため、日本語が壊れる。

---

### 解決方法

送信前に **UTF-8 のバイト列に変換**してから渡す。

```powershell
# ✅ 日本語が正しく届く
$body = [System.Text.Encoding]::UTF8.GetBytes('{"title":"テスト通知","body":"サーバーから届きました！"}')
Invoke-RestMethod -Uri "http://localhost:3000/send" -Method POST -ContentType "application/json; charset=utf-8" -Body $body
```

ポイントは2つ：
1. `[System.Text.Encoding]::UTF8.GetBytes(...)` で文字列をバイト列に変換する
2. `-ContentType` に `; charset=utf-8` を明示する

---

### なぜこれで動くのか

| | 文字列のまま渡す | バイト列に変換して渡す |
|---|---|---|
| 送信データ | UTF-16 LE（PowerShell の内部形式） | UTF-8（Web の標準形式） |
| サーバー側の解釈 | UTF-8 として読もうとして壊れる | UTF-8 として正しく読める |
| 日本語 | 文字化け ❌ | 正常 ✅ |

これは PowerShell 固有の落とし穴で、`curl` や Postman では起きない。Windows 環境で日本語を含む API テストをする際は常にこの変換が必要。

---

### 英語だと文字化けしない理由

ASCII 文字（英数字・記号）は UTF-8 と UTF-16 で同じバイト列になるため、英語だけなら文字化けしない。

```powershell
# 英語なら文字化けしない（でも習慣的に UTF-8 変換を使ったほうが安全）
$body = '{"title":"Test","body":"Hello from server!"}'
Invoke-RestMethod -Uri "http://localhost:3000/send" -Method POST -ContentType "application/json" -Body $body
```

---

## 10. プロジェクトフォルダをリネーム・移動したときのビルドエラー

### 症状

フォルダ名を変更した後に `npx expo run:android` を実行すると、こんなエラーが出る：

```
Configuring project ':react-native-reanimated' without an existing directory is not allowed.
The configured projectDirectory 'C:\dev\react-native\【旧フォルダ名】\...' does not exist
```

### 原因

`android/` フォルダ内のビルドファイルに、**生成時の絶対パスがハードコードされている**。
フォルダ名が変わると古いパスと一致しなくなりビルドが失敗する。

### 解決方法

`android/` フォルダを丸ごと削除して再生成するだけで直る。

```powershell
# my-app/ フォルダ内で実行
Remove-Item -Recurse -Force android
npx expo run:android
```

`android/` は `npx expo run:android` を実行するたびに自動生成されるので、**削除しても問題ない**。

### あわせて確認すること

ドキュメントやコード内に旧フォルダ名のパスが残っていないか grep で確認する：

```powershell
# プロジェクトルートで実行（node_modules は除外）
Get-ChildItem -Recurse -Exclude node_modules | Select-String "旧フォルダ名"
```

---

## 全体の正しい手順（チェックリスト）

```
□ Firebase プロジェクト作成
□ google-services.json を my-app/ に配置
□ app.json に android.googleServicesFile を追加  ← ビルド前に必ず！
□ npm install -g eas-cli
□ eas init（Expo アカウントが必要）
□ npx expo run:android（フルビルド）
□ Firebase Console → サービスアカウント → 秘密鍵を発行
□ eas build:configure（eas.json を生成）
□ eas credentials で FCM V1 サービスアカウントキーを登録
□ アプリ起動 → Push Token 取得確認
□ サーバー起動（node index.js）
□ POST /send で通知送信（日本語はUTF-8変換を忘れずに）→ エミュレーターに届く！
```
