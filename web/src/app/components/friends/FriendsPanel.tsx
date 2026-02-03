"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import FriendRequestModal from "../modals/FriendRequestModal";
import AddFriendModal from "../modals/AddFriendModal";

interface FriendsPanelProps {
	isOpen: boolean;
	onClose: () => void;
}

// フレンド一覧のダミーデータ
const friendsList = [
	{ id: 1, name: "飯田　陸" },
	{ id: 2, name: "飯田　陸" },
	{ id: 3, name: "飯田　陸" },
	{ id: 4, name: "飯田　陸" },
	{ id: 5, name: "飯田　陸" },
];

export default function FriendsPanel({ isOpen, onClose }: FriendsPanelProps) {
	const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
	const [isAddFriendModalOpen, setIsAddFriendModalOpen] = useState(false);

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

					{/* スライドパネル */}
					<motion.div
						className="fixed top-0 right-0 h-full w-full bg-base z-50 overflow-y-auto pb-20"
						initial={{ x: "100%" }}
						animate={{ x: 0 }}
						exit={{ x: "100%" }}
						transition={{ type: "spring", stiffness: 300, damping: 30 }}
					>
						{/* ヘッダー */}
						<div className="flex items-center justify-between px-4 pt-6 pb-4">
							<button
								onClick={onClose}
								className="p-2 hover:bg-gray-100 rounded-full transition-colors"
							>
								<ArrowBackIcon sx={{ fontSize: 28, color: "#1E293B" }} />
							</button>
							<h2 className="text-2xl text-center text-text flex-1">フレンド</h2>
							<div className="w-10" /> {/* スペーサー */}
						</div>

						{/* フレンド追加ボタン */}
						<div className="px-4 mb-4">
							<button 
								onClick={() => setIsAddFriendModalOpen(true)}
								className="w-full flex items-center gap-3 bg-text2 border border-text rounded-2xl p-4 hover:bg-gray-50 transition-colors"
							>
								<PersonAddIcon sx={{ fontSize: 28, color: "#1E293B" }} />
								<span className="text-lg text-text font-medium">
									フレンド追加
								</span>
							</button>
						</div>

						{/* フレンド申請リストボタン */}
						<div className="px-4 mb-6">
							<button 
								onClick={() => setIsRequestModalOpen(true)}
								className="w-full flex items-center gap-3 bg-text2 border border-text rounded-2xl p-4 hover:bg-gray-50 transition-colors"
							>
								<PersonAddIcon sx={{ fontSize: 28, color: "#1E293B" }} />
								<span className="text-lg text-text font-medium">
									フレンド申請リスト
								</span>
							</button>
						</div>

						{/* フレンド一覧 */}
						<div className="px-4">
							<h3 className="text-base text-text mb-3 font-medium">
								フレンド一覧
							</h3>
							<div className="space-y-0">
								{friendsList.map((friend) => (
									<div
										key={friend.id}
										className="flex items-center gap-3 py-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
									>
										{/* アバター */}
										<div className="flex-shrink-0 w-12 h-12 rounded-full bg-text flex items-center justify-center">
											<span className="text-text2 text-sm font-medium">
												{friend.name.charAt(0)}
											</span>
										</div>

										{/* 名前 */}
										<div className="flex-1">
											<h4 className="text-base font-medium text-text">
												{friend.name}
											</h4>
										</div>
									</div>
								))}
							</div>
						</div>

						{/* モーダル */}
						<FriendRequestModal 
							isOpen={isRequestModalOpen} 
							onClose={() => setIsRequestModalOpen(false)} 
						/>
						<AddFriendModal 
							isOpen={isAddFriendModalOpen} 
							onClose={() => setIsAddFriendModalOpen(false)} 
						/>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
}
