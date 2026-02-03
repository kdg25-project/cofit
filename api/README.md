# Cofit API Specification

Cofit アプリケーションのバックエンド API 仕様書です。

## 技術スタック
- **Framework**: [Hono](https://hono.dev/)
- **Runtime**: Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite)
- **ORM**: Drizzle ORM
- **Authentication**: Better Auth

## ビルド情報

- **バージョン**: 0.1.2
- **最終ビルド日時**: 2026/02/04 01:37:04
- **ランタイム**: Cloudflare Workers

## API エンドポイント

### 1. User API (`/api/user`)
ユーザー情報の取得と更新。
- `GET /me`: 自身のプロフィール、所属パーティ、最近のアクティビティ、フレンド数、獲得バッジを取得。
- `PATCH /me`: プロフィールの更新（表示名、画像）。
- `GET /:id`: 他ユーザーの公開プロフィールと獲得バッジを取得。

### 2. Party API (`/api/parties`)
グループ（パーティ）の管理。招待コード制。
- `POST /`: パーティの新規作成。自動的に 6 文字の招待コードが生成されます。
- `GET /:id`: パーティの基本情報とメンバーリストを取得。
- `PATCH /:id`: パーティ情報の更新（オーナーのみ）。
- `POST /join`: 招待コードを使用してパーティに参加。
- `POST /:id/leave`: パーティから脱退（オーナーは不可）。

### 3. Mission & Activity API (`/api/missions`)
運動の記録とミッション（目標）の管理。
- `GET /`: 所属するパーティの現在有効なミッションと進捗一覧を取得。
- `POST /activities`: アクティビティ（運動）を記録。ミッションの種類（squat, pushup 等）が一致すれば自動的に進捗を加算。
- `GET /activities`: アクティビティ履歴の取得。`range` (7d, 30d, all) や `from`/`to` による期間指定が可能。
- `GET /activities/summary`: 指定された1日の運動ログを「XX:XX - XX:XX に何を何回したか」という形式で構造化して取得。

### 4. Chat API (`/api/chat`)
DM およびパーティチャット。
- `GET /channels`: アクセス可能な全チャンネル（パーティ、フレンドとの DM）の最新メッセージと未読数を取得。
- `GET /channels/:id/messages`: 特定チャンネルのメッセージ履歴を取得。
- `POST /channels/:id/messages`: メッセージの送信。

### 5. Friend API (`/api/friends`)
ソーシャル機能。
- `GET /`: 承認済みフレンド一覧。
- `GET /requests`: 受信/送信したフレンド申請一覧。
- `POST /requests`: フレンド申請の送信。
- `PATCH /requests/:id`: フレンド申請への回答（accepted / rejected）。
- `DELETE /:id`: フレンドの解除。

### 6. Badge API (`/api/badges`)
実績（バッジ）システム。
- `GET /`: 全バッジ一覧取得。ログイン時は獲得済みフラグ (`isEarned`) が含まれます。
- `GET /me`: 自身が獲得したバッジの詳細一覧。
- `GET /:id`: バッジの詳細情報。

## 特殊仕様

### 定時ジョブ (Scheduled Events)
Cloudflare Workers の Scheduled Events を使用して、毎日 0 時に以下の処理を行います。
- 新しいデイリー/ウィークリーミッションの生成。
- 期限切れミッションの整理。

### ミッションの動的紐付け
各パーティのミッションは、そのパーティが `GET /api/missions` を叩いたタイミングで最新のグローバルミッションからコピー（紐付け）されます。これにより、アクティブでないパーティに不要なデータを生成することなく効率的に管理されます。
