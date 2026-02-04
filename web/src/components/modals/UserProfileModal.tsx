"use client";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CloseIcon from "@mui/icons-material/Close";
import { AnimatePresence, motion } from "framer-motion";

interface UserProfileModalProps {
	isOpen: boolean;
	onClose: () => void;
	userName: string;
	userId: string;
	friendSince: string;
}

export default function UserProfileModal({
	isOpen,
	onClose,
	userName,
	userId,
	friendSince,
}: UserProfileModalProps) {
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
							<CloseIcon style={{ fontSize: 28, color: "var(--color-text)" }} />
						</button>

						{/* プロフィール内容 */}
						<div className="flex flex-col items-center text-center space-y-6 pt-4">
							<div className="flex flex-row items-center justify-center gap-4 sm:gap-6 md:gap-8 lg:gap-12">
								{/* アバター */}
								<div className="flex items-center justify-center">
									<AccountCircleIcon
										style={{ fontSize: 80, color: "var(--color-text)" }}
									/>
								</div>

								{/* ユーザー情報 */}
								<div className="space-y-3">
									<h3 className="text-2xl font-bold text-text">{userName}</h3>
									<p className="text-text">{userId}</p>
								</div>
							</div>
							{/* フレンド日付 */}
							<div className="pt-2">
								<p className="text-sm text-placeholder">
									フレンドになった日・{friendSince}
								</p>
							</div>
						</div>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
}
