"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CloseIcon from "@mui/icons-material/Close";

interface AddFriendModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export default function AddFriendModal({ isOpen, onClose }: AddFriendModalProps) {
	const [username, setUsername] = useState("");
	const [isFocused, setIsFocused] = useState(false);

	const text = "フレンドのユーザー名";

	const randomValues = useMemo(() => {
		return text.split("").map(() => ({
			y: Math.random() * -60 - 20, // eslint-disable-line
			x: Math.random() * 40 - 20, // eslint-disable-line
			rotate: Math.random() * 360 - 180, // eslint-disable-line
			scale: Math.random() * 0.6, // eslint-disable-line
		}));
	}, [text]);

	const handleSubmit = () => {
		if (username.trim()) {
			console.log("Send friend request to:", username);
			// ここでAPIを呼び出す
			setUsername("");
			onClose();
		}
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
						className="fixed top-5/11 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-base rounded-3xl z-[70] w-[90%] max-w-md p-6"
						initial={{ scale: 0.9, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						exit={{ scale: 0.9, opacity: 0 }}
						transition={{ type: "spring", stiffness: 300, damping: 30 }}
						onClick={(e) => e.stopPropagation()}
					>
						{/* ヘッダー */}
						<div className="flex items-center justify-between">
							<h3 className="text-xl absolute left-1/2 -translate-x-1/2 text-text">フレンドを追加</h3>
							<button
								onClick={onClose}
								className="p-1 hover:bg-gray/30 rounded-full transition-colors pl-[90%]"
							>
								<CloseIcon sx={{ fontSize: 28, color: "var(--color-text)" }} />
							</button>
						</div>

						{/* フォーム */}
						<div className="space-y-6">
							{/* 入力フィールド */}
							<div className="py-[10%] mt-[10%]">
								<div className="relative w-[58%] mx-auto">
									<input
										type="text"
										value={username}
										onChange={(e) => setUsername(e.target.value)}
										onFocus={() => setIsFocused(true)}
										onBlur={() => !username && setIsFocused(false)}
										className="w-full py-[2%] border-b-1 border-placeholder focus:outline-none focus:border-secondary transition-colors text-center text-text bg-transparent"
									/>

									<AnimatePresence>
										{!isFocused && !username && (
											<motion.div
												className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex pointer-events-none"
												initial="visible"
												animate="visible"
												exit="hidden"
												variants={{
													visible: {
														opacity: 1,
													},
													hidden: {
														opacity: 0,
														transition: {
															staggerChildren: 0.03,
															when: "afterChildren",
														},
													},
												}}
											>
												{text.split("").map((char, i) => (
													<motion.span
														key={i}
														className="text-placeholder"
														variants={{
															visible: {
																y: 0,
																rotate: 0,
																scale: 1,
																opacity: 1,
															},
															hidden: {
																y: randomValues[i].y,
																x: randomValues[i].x,
																rotate: randomValues[i].rotate,
																scale: randomValues[i].scale,
																opacity: 0,
																filter: "blur(6px)",
															},
														}}
														transition={{
															duration: 0.5,
															ease: "anticipate",
														}}
													>
														{char}
													</motion.span>
												))}
											</motion.div>
										)}
									</AnimatePresence>
								</div>
								<p className="text-sm mt-[2%] text-placeholder text-center">
									ユーザー名を入力してください
								</p>
							</div>

							{/* 申請ボタン */}
							<button
								onClick={handleSubmit}
								disabled={!username.trim()}
								className="w-full bg-primary text-text2 py-3 rounded-full font-bold transition-opacity shadow-lg disabled:cursor-not-allowed"
							>
								申請する
							</button>
						</div>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
}
