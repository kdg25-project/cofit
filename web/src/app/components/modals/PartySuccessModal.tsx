"use client";
import { motion, AnimatePresence } from "framer-motion";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

interface PartySuccessModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export default function PartySuccessModal({ isOpen, onClose }: PartySuccessModalProps) {
	const handleViewParty = () => {
		console.log("View party");
		// ここでパーティー画面に遷移
		onClose();
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					{/* 背景オーバーレイ */}
					<motion.div
						className="fixed inset-0 bg-black/30 z-[60]"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={onClose}
					/>

					{/* モーダル */}
					<motion.div
						className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-base rounded-3xl z-[70] w-[90%] max-w-md p-8"
						initial={{ scale: 0.9, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						exit={{ scale: 0.9, opacity: 0 }}
						transition={{ type: "spring", stiffness: 300, damping: 30 }}
						onClick={(e) => e.stopPropagation()}
					>
						{/* 閉じるボタン */}
						<button
							onClick={onClose}
							className="absolute top-4 right-4 p-1 hover:bg-gray/30 rounded-full transition-colors"
						>
							<CloseIcon sx={{ fontSize: 28, color: "var(--color-placeholder)" }} />
						</button>

						{/* コンテンツ */}
						<div className="flex flex-col items-center text-center space-y-6">
							{/* チェックアイコン */}
							<div className="rounded-full bg-secondary flex items-center justify-center">
								<CheckCircleIcon sx={{ fontSize: 60, color: "var(--color-base)" }} />
							</div>

							{/* メッセージ */}
							<div className="space-y-2">
								<h3 className="text-xl font-bold text-text">
									パーティーに参加できました！
								</h3>
								<p className="text-base text-placeholder">
									みんなと一緒に頑張ろう！
								</p>
							</div>

							{/* パーティーを見るボタン */}
							<button
								onClick={handleViewParty}
								className="w-[65%] bg-secondary text-text2 py-3 mb-[10%] px-8 rounded-full font-bold hover:opacity-90 transition-opacity"
							>
								パーティーを見る
							</button>
						</div>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
}
