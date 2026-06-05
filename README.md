# 🌀 Cofit

### 仲間と繋がる、汗を流す。習慣化を支えるソーシャルフィットネスWebアプリ

---

## 🚀 プロダクト概要

**Cofit** は、友人やコミュニティ（パーティー）と協力してフィットネス目標を達成し、健康的な運動習慣を身につけるためのソーシャルフィットネスWebアプリケーションです。

単に運動記録をつけるだけでなく、**スマートフォンの内蔵センサーと連動して運動回数を自動カウントする機能**や、獲得した実績バッジを**インタラクティブな3Dモデルで鑑賞できる機能**など、ユーザーのモチベーションを引き出すためのリッチなUX（ユーザーエクスペリエンス）を搭載しています。

本プロジェクトは、フロントエンドとバックエンドの境界を越えて、最新の Web テクノロジー（Next.js 16, Cloudflare Workers, Three.js, Web Sensor API）をフルに活用して構築されています。

---

## 🛠️ 技術スタック

本リポジトリは、モノレポ構成を採用しています。

### フロントエンド (`web/`)
- **Framework**: Next.js 16 (App Router)
- **UI / Styling**: React 19 + TailwindCSS v4 + Material UI
- **3D Rendering**: Three.js / [@react-three/fiber](https://github.com/pmndrs/react-three-fiber) / [@react-three/drei](https://github.com/pmndrs/drei)
- **Animation**: Framer Motion
- **Authentication Client**: Better Auth Client

### バックエンド (`api/`)
- **Runtime**: Cloudflare Workers
- **Framework**: Hono (Ultra-lightweight Web Framework)
- **Database**: Cloudflare D1 (Serverless Distributed SQLite)
- **ORM**: Drizzle ORM
- **Authentication**: Better Auth (Session-based)
- **Object Storage**: Cloudflare R2 (バッジ3Dモデルや画像アセット用)

---

## 🌟 技術

### 1. 📱 Web標準の加速度センサーを用いた運動自動計測アルゴリズム
スマートフォンの加速度センサー（`DeviceMotionEvent`）の生データを高度に処理し、スクワットや腹筋の回数を高精度に自動カウントするアルゴリズムを自作しています（`useExerciseCounter.ts`）。
- **ノイズ除去**: ローパスフィルタ（LPF、$\alpha=0.2$）を適用し、端末の細かな手ブレやノイズを除去。
- **重力補正**: 3軸加速度ベクトルのノルムを合成し、重力加速度（9.8 m/s²）を減算することで、純粋な運動による加速度のみを抽出。
- **物理シミュレーションによる位置の推定**: 加速度を時間積分して速度（Velocity）を求め、さらに速度を積分して位置（Depth）をリアルタイムに推定。
- **状態遷移モデル（FSM）**: 運動のフェーズを `STANDING（直立）` → `DESCENDING（下降）` → `BOTTOM（最下点）` → `ASCENDING（上昇）` の4つの状態に分け、閾値判定と物理的な深さを組み合わせることで、「正しいフォームで行われた運動」のみを識別してカウントします。

### 2. 🎨 React Three Fiber（R3F）によるインタラクティブな3Dバッジシステム
ユーザーが獲得した実績バッジは、2Dの静止画ではなく、リアルタイムに3Dレンダリングされます（[BadgeCard.tsx](file:///Users/tah/Documents/vantan/event/techjam/cofit/web/src/components/badge/BadgeCard.tsx)）。
- GLTF形式の3Dモデルを動的に読み込み、ふわふわと浮遊するアニメーション（`Float`）を適用。
- モーダル画面内では `OrbitControls` を実装し、ユーザーがマウスやタッチ操作で3Dバッジを**自由な角度から回転・ズームして鑑賞できるリッチなUI/UX**を提供しています。
- 環境光、スポットライト、ポイントライト、ディレクショナルライトを組み合わせ、さらに質感のある影表現（`ContactShadows`）を施すことで、ブラウザ上とは思えない高級感のあるビジュアルを実現しています。

### 3. ⚡ Hono RPC による End-to-End の型安全なAPI設計
バックエンド（Hono）とフロントエンド（Next.js）間で、APIスキーマをシームレスに共有しています（[hono-client.ts](file:///Users/tah/Documents/vantan/event/techjam/cofit/web/src/lib/hono-client.ts)）。
- HonoのRPC機能（`AppType`）を活用することで、APIのエンドポイントパス、リクエストボディ、クエリパラメータ、レスポンスの型定義が**フロントエンド側で100%自動補完**されます。
- これにより、仕様変更時の不整合をコンパイル時点で検出し、型安全で壊れにくい堅牢なフルスタック開発を実現しています。

### 4. 🚀 Cloudflare エコシステムを活用したサーバーレス & エッジネイティブ構成
バックエンドは Cloudflare Workers 上でエッジ起動するため、ミリ秒未満のコールドスタートとグローバル規模での超高速な応答性を実現しています。
- **Cloudflare D1**: SQLデータベースとしてネイティブな分散型SQLiteを使用し、Drizzle ORMを組み合わせて型安全なデータベースアクセスと高速なクエリレスポンスを実現。
- **Cloudflare Cron Triggers**: 定時ジョブ（Scheduled Events）として、毎日自動で新しいグローバルミッションを生成する仕組みを Workers 内に組み込み、サーバー運用のコストを最小限に抑えています。

---

## 📂 リポジトリ構成

```text
cofit/
├── api/                  # バックエンド (Cloudflare Workers)
│   ├── src/
│   │   ├── db/          # データベース接続、Drizzleテーブルスキーマ定義
│   │   ├── lib/         # Better Auth 設定などの共通ロジック
│   │   ├── routes/      # Hono API 各種ルーティング（ミッション、チャット、フレンド等）
│   │   └── index.ts     # エントリーポイント、定期ジョブ定義
│   ├── wrangler.jsonc    # Cloudflare Workers 設定ファイル
│   └── package.json
│
├── web/                  # フロントエンド (Next.js 16 + React 19)
│   ├── src/
│   │   ├── app/         # App Router（主要画面: 計測画面、プロフィール、バッジ一覧）
│   │   ├── components/  # 再利用コンポーネント (3Dバッジレンダラー、カレンダー等)
│   │   ├── hooks/       # 加速度センサー処理、カウントロジック等のカスタムフック
│   │   └── lib/         # HonoクライアントやAuthクライアントの設定
│   └── package.json
│
└── package.json         # ルート（Bun Workspaces 設定、一括フォーマットなど）
```

---

## 💿 開発環境のセットアップ

### 前提条件
- [Bun](https://bun.sh/) がインストールされていること

### 1. 依存関係のインストール
プロジェクトのルートディレクトリで以下を実行します。モノレポ全体のパッケージが一括でインストールされます。
```bash
bun install
```

### 2. 環境変数の設定
`api/.env.example` および `web/.env.example` を参考に、それぞれのディレクトリに `.env` ファイルを作成してください。

### 3. ローカル開発サーバーの起動

#### バックエンド (API) の起動
```bash
cd api
bun run dev
```

#### フロントエンド (Web) の起動
```bash
cd web
bun run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) にアクセスします。
※運動の自動カウント機能（加速度センサー）をテストする際は、同一Wi-Fi環境内のスマートフォンなどの実機ブラウザからアクセスするか、ブラウザの開発者ツールでセンサーのシミュレーションを行う必要があります。

---

## 🏆 コア機能一覧

1. **ミッション & アクティビティ計測**: 加速度センサーを用いた回数自動計測（スクワット・腹筋・腕立て伏せに対応）。
2. **パーティー（コミュニティ）機能**: 招待コードを用いて友人とパーティーを結成し、共同でミッション（目標回数）の達成を目指す。
3. **DM & チャンネルチャット**: パーティーメンバーやフレンドとリアルタイムにコミュニケーションが取れるチャット機能。
4. **フレンドシステム**: 他のユーザーを検索・フレンド申請し、お互いのアクティビティを刺激し合うソーシャル機能。
5. **3D実績バッジ獲得システム**: 特定の目標を達成するとバッジが付与され、獲得バッジはリッチな3Dビューアで回転・拡大しながら鑑賞可能。
