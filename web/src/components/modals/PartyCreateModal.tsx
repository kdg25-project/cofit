"use client";
import CloseIcon from "@mui/icons-material/Close";
import GroupsIcon from "@mui/icons-material/Groups";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { client } from "@/lib/hono-client";

interface PartyCreateModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess: (inviteCode?: string) => void;
}

export default function PartyCreateModal({
	isOpen,
	onClose,
	onSuccess,
}: PartyCreateModalProps) {
	const [name, setName] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async () => {
		if (name.trim()) {
			setIsLoading(true);
			try {
				const res = await client.api.party.$post({
					json: { name: name },
				});

				if (res.ok) {
					const data = await res.json();
					setName("");
					onClose();
					onSuccess(data.inviteCode);
				} else {
					const data = (await res.json()) as { error?: string };
					alert(`作成に失敗しました: ${data.error || "不明なエラー"}`);
				}
			} catch (error) {
				console.error("Failed to create party:", error);
				alert("通信エラーが発生しました");
			} finally {
				setIsLoading(false);
			}
		}
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					<motion.div
						className="fixed inset-0 bg-black/30 z-60"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={onClose}
					/>

					<motion.div
						className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-base rounded-3xl z-70 w-[90%] max-w-md p-6"
						initial={{ scale: 0.9, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						exit={{ scale: 0.9, opacity: 0 }}
						transition={{ type: "spring", stiffness: 300, damping: 30 }}
						onClick={(e) => e.stopPropagation()}
					>
						<div className="flex items-center justify-between mb-8">
							<h3 className="text-xl absolute left-1/2 -translate-x-1/2 text-text">
								パーティーを作成
							</h3>
							<button
								onClick={onClose}
								className="p-1 hover:bg-gray/30 rounded-full transition-colors pl-[90%]"
							>
								<CloseIcon sx={{ fontSize: 28, color: "var(--color-text)" }} />
							</button>
						</div>

						<div className="space-y-6">
							<div className="flex flex-col items-center py-4">
								<div className="bg-secondary/20 p-4 rounded-full text-secondary mb-4">
									<GroupsIcon sx={{ fontSize: 60 }} />
								</div>
								<input
									type="text"
									value={name}
									onChange={(e) => setName(e.target.value)}
									placeholder="パーティー名を入力"
									className="w-[80%] py-2 border-b border-placeholder focus:outline-none focus:border-secondary text-center text-text"
								/>
							</div>

							<button
								onClick={handleSubmit}
								disabled={!name.trim() || isLoading}
								className="w-full bg-secondary text-text2 py-3 rounded-full font-bold transition-opacity shadow-lg disabled:cursor-not-allowed"
							>
								{isLoading ? "作成中..." : "作成する"}
							</button>
						</div>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
}
