"use client";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import CloseIcon from "@mui/icons-material/Close";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { client } from "@/lib/hono-client";

interface FriendRequestModalProps {
	isOpen: boolean;
	onClose: () => void;
}

type Request = {
	id: number;
	from: {
		id: string;
		name: string | null;
		displayName: string | null;
		image: string | null;
	};
};

export default function FriendRequestModal({
	isOpen,
	onClose,
}: FriendRequestModalProps) {
	const [requests, setRequests] = useState<Request[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (isOpen) {
			fetchRequests();
		}
	}, [isOpen]);

	const fetchRequests = async () => {
		try {
			const res = await client.api.friends.requests.$get();
			if (res.ok) {
				const data = await res.json();
				setRequests(data);
			}
		} catch (error) {
			console.error("Failed to fetch requests:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleAccept = async (id: number) => {
		try {
			const res = await client.api.friends.requests[":id"].$patch({
				param: { id: id.toString() },
				json: { status: "accepted" },
			});
			if (res.ok) {
				setRequests((prev) => prev.filter((req) => req.id !== id));
			}
		} catch (error) {
			console.error("Failed to accept request:", error);
		}
	};

	const handleReject = async (id: number) => {
		try {
			const res = await client.api.friends.requests[":id"].$patch({
				param: { id: id.toString() },
				json: { status: "rejected" },
			});
			if (res.ok) {
				setRequests((prev) => prev.filter((req) => req.id !== id));
			}
		} catch (error) {
			console.error("Failed to reject request:", error);
		}
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					{/* 背景オーバーレイ */}
					<motion.div
						className="fixed inset-0 bg-black/30 z-40"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={onClose}
					/>

					{/* モーダル */}
					<motion.div
						className="fixed inset-x-0 bottom-0 bg-base rounded-t-3xl z-70 max-h-[60vh] overflow-hidden flex flex-col"
						initial={{ y: "100%" }}
						animate={{ y: 0 }}
						exit={{ y: "100%" }}
						transition={{ type: "spring", stiffness: 300, damping: 30 }}
					>
						{/* ヘッダー */}
						<div className="flex items-center justify-between px-6 py-4 border-b border-gray">
							<h3 className="text-xl font-medium text-text">
								フレンド申請リスト
							</h3>
							<button
								onClick={onClose}
								className="p-1 hover:bg-gray/30 rounded-full transition-colors"
							>
								<CloseIcon sx={{ fontSize: 28, color: "var(--color-text)" }} />
							</button>
						</div>

						{/* 申請リスト */}
						<div className="flex-1 overflow-y-auto px-4 py-4">
							<div className="space-y-0">
								{loading ? (
									<p className="text-center py-4 text-placeholder">
										読み込み中...
									</p>
								) : requests.length === 0 ? (
									<p className="text-center py-4 text-placeholder">
										申請はありません
									</p>
								) : (
									requests.map((request) => (
										<div
											key={request.id}
											className="flex items-center gap-3 py-4 border-b border-gray"
										>
											{/* アバター */}
											<div className="shrink-0 w-12 h-12 rounded-full bg-text flex items-center justify-center">
												<span className="text-text2 text-sm font-medium">
													{(
														request.from.displayName ||
														request.from.name ||
														"?"
													).charAt(0)}
												</span>
											</div>

											{/* 名前 */}
											<div className="flex-1">
												<h4 className="font-medium text-text">
													{request.from.displayName ||
														request.from.name ||
														"Unknown"}
												</h4>
											</div>

											{/* アクションボタン */}
											<div className="flex gap-2">
												{/* 拒否ボタン */}
												<button
													onClick={() => handleReject(request.id)}
													className="w-10 h-10 rounded-full bg-notification flex items-center justify-center hover:opacity-80 transition-opacity"
												>
													<ClearIcon
														sx={{ fontSize: 24, color: "var(--color-text2)" }}
													/>
												</button>

												{/* 承認ボタン */}
												<button
													onClick={() => handleAccept(request.id)}
													className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:opacity-80 transition-opacity"
												>
													<CheckIcon
														sx={{ fontSize: 24, color: "var(--color-text2)" }}
													/>
												</button>
											</div>
										</div>
									))
								)}
							</div>
						</div>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
}
