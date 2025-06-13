# SwitchBot Monitor - Electron Version

SwitchBotの状態をmacOSメニューバーで監視するElectronアプリです。

## 機能

- 🌡️ メニューバーに温度と湿度を表示
- 📱 右クリックでデバイス一覧と詳細情報を表示
- 🔄 自動的にデータを5分間隔で更新
- 🔧 初回起動時にAPI認証情報を簡単設定

## 使用方法

### 1. 依存関係のインストール
```bash
npm install
```

### 2. アプリの起動
```bash
npm start
```

### 3. API認証情報の設定
初回起動時に設定画面が表示されます。

**SwitchBotアプリでAPIトークンを取得する方法：**
1. SwitchBotアプリを開く
2. 右下の「Profile」をタップ
3. 「設定」をタップ
4. 「アプリバージョン」を10回タップ
5. 「開発者向けオプション」が表示される
6. 「トークンを取得」をタップ

### 4. 使用開始
- メニューバーに温度と湿度が表示されます（例：🌡️ 23.5°C 60% 💧）
- 右クリックでデバイス一覧と詳細情報を確認できます

## 技術仕様

- **Electron**: クロスプラットフォーム対応
- **SwitchBot API v1.1**: HMAC-SHA256認証
- **自動更新**: 5分間隔でデータ取得
- **セキュア**: API認証情報は暗号化して保存

## ファイル構成

```
switchbot-monitor/
├── main.js              # メインプロセス
├── src/
│   ├── switchbot-api.js  # SwitchBot API ラッパー
│   └── setup.html        # 認証設定画面
├── assets/
│   └── icon.png          # メニューバーアイコン
└── package.json
```

## 開発コマンド

- `npm start` - アプリ起動
- `npm run dev` - 開発モード起動

アプリが正常に起動し、メニューバーに表示されます！