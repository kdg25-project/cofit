import * as fs from "node:fs";
import * as path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "../src/db/schema";

// このスクリプトはローカルのWrangler D1(Miniflare)のDBファイルを直接操作してシードデータを投入します。
// .wrangler ディレクトリ内の最新の sqlite ファイルを探します。

function findD1DbFile() {
	const wranglerDir = path.resolve(
		process.cwd(),
		".wrangler/state/v3/d1/miniflare-D1Database",
	);
	if (!fs.existsSync(wranglerDir)) {
		console.error(
			"Wrangler D1 state directory not found. Please run 'wrangler dev' first.",
		);
		process.exit(1);
	}

	const files = fs
		.readdirSync(wranglerDir, { recursive: true })
		.filter((f): f is string => typeof f === "string" && f.endsWith(".sqlite"));

	if (files.length === 0) {
		console.error("No .sqlite files found in .wrangler directory.");
		process.exit(1);
	}

	// 暫定的に最初に見つかったものを使用
	return path.join(wranglerDir, files[0]);
}

const dbPath = findD1DbFile();
console.log(`Seeding database at: ${dbPath}`);

const sqlite = new Database(dbPath as string);
const db = drizzle(sqlite, { schema });

async function main() {
	console.log("Seeding badges...");
	const badges = [
		{
			id: 1,
			name: "7日間連続達成バッジ",
			image: "https://api.dicebear.com/7.x/icons/svg?seed=streak7",
			modelUrl: "https://r2.cofit.example.com/models/badge_7_streak.glb",
			description: "一週間のトレーニング継続を証明するバッジです。",
			howToGet: "7日間連続で記録を付ける",
		},
		{
			id: 2,
			name: "14日間連続達成バッジ",
			image: "https://api.dicebear.com/7.x/icons/svg?seed=streak14",
			modelUrl: "https://r2.cofit.example.com/models/badge_14_streak.glb",
			description: "二週間のトレーニング継続を証明するバッジです。",
			howToGet: "14日間連続で記録を付ける",
		},
		{
			id: 3,
			name: "30日間連続達成バッジ",
			image: "https://api.dicebear.com/7.x/icons/svg?seed=streak30",
			modelUrl: "https://r2.cofit.example.com/models/badge_30_streak.glb",
			description: "一ヶ月間のトレーニング継続を証明するバッジです。",
			howToGet: "1ヶ月連続で記録を付ける",
		},
		{
			id: 4,
			name: "スクワット100回達成",
			image: "https://api.dicebear.com/7.x/icons/svg?seed=squat100",
			modelUrl: "https://r2.cofit.example.com/models/badge_squat_100.glb",
			description: "通算100回のスクワットを達成しました！",
			howToGet: "スクワットを合計100回達成する",
		},
		{
			id: 5,
			name: "スクワット1000回達成",
			image: "https://api.dicebear.com/7.x/icons/svg?seed=squat1000",
			modelUrl: "https://r2.cofit.example.com/models/badge_squat_1000.glb",
			description: "通算1,000回のスクワットを成し遂げました！",
			howToGet: "スクワットを合計1,000回達成する",
		},
		{
			id: 6,
			name: "スクワット10000回達成",
			image: "https://api.dicebear.com/7.x/icons/svg?seed=squat10000",
			modelUrl: "https://r2.cofit.example.com/models/badge_squat_10000.glb",
			description: "通算10,000回のスクワット。もはや神の領域です。",
			howToGet: "スクワットを合計10,000回達成する",
		},
		{
			id: 7,
			name: "腹筋100回達成",
			image: "https://api.dicebear.com/7.x/icons/svg?seed=abs100",
			modelUrl: "https://r2.cofit.example.com/models/badge_abs_100.glb",
			description: "通算100回の腹筋を達成しました！",
			howToGet: "腹筋を合計100回達成する",
		},
		{
			id: 8,
			name: "腹筋1000回達成",
			image: "https://api.dicebear.com/7.x/icons/svg?seed=abs1000",
			modelUrl: "https://r2.cofit.example.com/models/badge_abs_1000.glb",
			description: "通算1,000回の腹筋を成し遂げました。",
			howToGet: "腹筋を合計1,000回達成する",
		},
		{
			id: 9,
			name: "腹筋10000回達成",
			image: "https://api.dicebear.com/7.x/icons/svg?seed=abs10000",
			modelUrl: "https://r2.cofit.example.com/models/badge_abs_10000.glb",
			description: "通算10,000回の腹筋。究極のシックスパックの持ち主です。",
			howToGet: "腹筋を合計10,000回達成する",
		},
	];

	for (const b of badges) {
		await db.insert(schema.badge).values(b).onConflictDoUpdate({
			target: schema.badge.id,
			set: b,
		});
	}

	console.log("Seeding completed successfully!");
}

main().catch((e) => {
	console.error("Seeding failed:");
	console.error(e);
	process.exit(1);
});
