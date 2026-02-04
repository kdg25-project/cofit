"use client";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { client } from "@/lib/hono-client";

type Friend = {
	id: string;
	name: string | null;
	displayName: string | null;
	image: string | null;
	status: string;
};

export default function FriendsPage() {
	const router = useRouter();
	const [friends, setFriends] = useState<Friend[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchFriends = async () => {
			try {
				const res = await client.api.friends.$get();
				if (res.ok) {
					const data = await res.json();
					setFriends(data);
				}
			} catch (error) {
				console.error("Failed to fetch friends:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchFriends();
	}, []);

	return (
		<motion.div
			className="min-h-screen bg-base pb-20"
			initial={{ x: "100%" }}
			animate={{ x: 0 }}
			exit={{ x: "100%" }}
			transition={{ type: "spring", stiffness: 300, damping: 30 }}
		>
			{/* ヘッダー */}
			<div className="flex items-center justify-between px-4 pt-6 pb-4">
				<button
					onClick={() => router.back()}
					className="p-2 hover:bg-gray-100 rounded-full transition-colors"
				>
					<ArrowBackIcon sx={{ fontSize: 28, color: "#1E293B" }} />
				</button>
				<h2 className="text-2xl text-center text-text flex-1">フレンド</h2>
				<div className="w-10" /> {/* スペーサー */}
			</div>

			{/* フレンド追加ボタン */}
			<div className="px-4 mb-4">
				<button className="w-full flex items-center gap-3 bg-text2 border border-text rounded-2xl p-4 hover:bg-gray-50 transition-colors">
					<PersonAddIcon sx={{ fontSize: 28, color: "#1E293B" }} />
					<span className="text-lg text-text font-medium">フレンド追加</span>
				</button>
			</div>

			{/* フレンド申請リストボタン */}
			<div className="px-4 mb-6">
				<button className="w-full flex items-center gap-3 bg-text2 border border-text rounded-2xl p-4 hover:bg-gray-50 transition-colors">
					<PersonAddIcon sx={{ fontSize: 28, color: "#1E293B" }} />
					<span className="text-lg text-text font-medium">
						フレンド申請リスト
					</span>
				</button>
			</div>

			{/* フレンド一覧 */}
			<div className="px-4">
				<h3 className="font-medium text-text mb-3">フレンド一覧</h3>
				<div className="space-y-0">
					{loading ? (
						<p className="text-center py-4 text-placeholder">読み込み中...</p>
					) : friends.length === 0 ? (
						<p className="text-center py-4 text-placeholder">
							フレンドがいません
						</p>
					) : (
						friends.map((friend) => (
							<div
								key={friend.id}
								onClick={() => router.push(`/community/chat/${friend.id}`)}
								className="flex items-center gap-3 py-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
							>
								{/* アバター */}
								<div className="shrink-0 w-12 h-12 rounded-full bg-text flex items-center justify-center">
									<span className="text-text2 text-sm font-medium">
										{(friend.displayName || friend.name || "?").charAt(0)}
									</span>
								</div>

								{/* 名前 */}
								<div className="flex-1">
									<h4 className="font-medium text-text">
										{friend.displayName || friend.name || "Unknown"}
									</h4>
								</div>
							</div>
						))
					)}
				</div>
			</div>
		</motion.div>
	);
}
