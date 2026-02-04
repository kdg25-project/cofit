"use client";
import CloseIcon from "@mui/icons-material/Close";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { client } from "@/lib/hono-client";
import PartyCreateModal from "./PartyCreateModal";

interface PartyJoinCodeModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
}

export default function PartyJoinCodeModal({
	isOpen,
	onClose,
	onSuccess,
}: PartyJoinCodeModalProps) {
	const [code, setCode] = useState("");
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

	const handleSubmit = async () => {
		const normalizedCode = code.trim().replace(/\s+/g, "");
		if (normalizedCode) {
			try {
				const res = await client.api.party.join.$post({
					json: { inviteCode: normalizedCode },
				});

				const data = (await res.json()) as { error?: string };
				if (res.ok) {
					setCode("");
					onClose();
					onSuccess(); // 成功モーダルを表示
				} else {
					console.error("Failed to join party:", data);
					const errorMsg = data.error || "不明なエラーが発生しました";
					alert(`参加に失敗しました: ${errorMsg}`);
				}
			} catch (error) {
				console.error("Network error joining party:", error);
				alert("通信エラーが発生しました");
			}
		}
	};

	return (
		<>
			<AnimatePresence>
				{isOpen && (
					<>
						{/* 背景オーバーレイ */}
						<motion.div
							className="fixed inset-0 bg-black/30 z-60"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={onClose}
						/>

						{/* モーダル */}
						<motion.div
							className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-base rounded-3xl z-70 w-[90%] max-w-md p-6"
							initial={{ scale: 0.9, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.9, opacity: 0 }}
							transition={{ type: "spring", stiffness: 300, damping: 30 }}
							onClick={(e) => e.stopPropagation()}
						>
							{/* ヘッダー */}
							<div className="flex items-center justify-between mb-8">
								<h3 className="text-xl absolute left-1/2 -translate-x-1/2 text-text">
									参加コードを入力
								</h3>
								<button
									onClick={onClose}
									className="p-1 hover:bg-gray/30 rounded-full transition-colors pl-[90%]"
								>
									<CloseIcon
										sx={{ fontSize: 28, color: "var(--color-text)" }}
									/>
								</button>
							</div>

							{/* フォーム */}
							<div className="space-y-6">
								{/* コード入力 */}
								<div className="text-center py-[12%]">
									<input
										type="text"
										value={code}
										onChange={(e) => setCode(e.target.value)}
										placeholder="123 456"
										className="w-[57%] py-[2%] border-b border-placeholder focus:outline-none focus:border-secondary focus:placeholder-transparent transition-colors text-center text-text"
										maxLength={7}
									/>
									<p className="text-sm mt-[2%] text-placeholder">
										参加コードを入力してください
									</p>
								</div>

								{/* 参加ボタン */}
								<button
									onClick={handleSubmit}
									disabled={!code.trim()}
									className="w-full bg-primary text-text2 py-3 rounded-full font-bold transition-opacity shadow-lg disabled:cursor-not-allowed"
								>
									参加する
								</button>

								<div className="text-center pt-2">
									<button
										onClick={() => {
											onClose();
											setIsCreateModalOpen(true);
										}}
										className="text-secondary font-medium hover:underline text-sm"
									>
										パーティーを作成しますか？
									</button>
								</div>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>

			<PartyCreateModal
				isOpen={isCreateModalOpen}
				onClose={() => setIsCreateModalOpen(false)}
				onSuccess={() => {
					setIsCreateModalOpen(false);
					onSuccess();
				}}
			/>
		</>
	);
}
