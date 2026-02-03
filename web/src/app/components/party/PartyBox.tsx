"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import GroupsIcon from "@mui/icons-material/Groups";
import PartyJoinCodeModal from "../modals/PartyJoinCodeModal";
import PartySuccessModal from "../modals/PartySuccessModal";

interface PartyBoxProps {
	onJoinParty?: () => void; // パーティー参加時のコールバック
}

export default function PartyBox({ onJoinParty }: PartyBoxProps) {
	const router = useRouter();
	const [isJoinCodeModalOpen, setIsJoinCodeModalOpen] = useState(false);
	const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
	const [isJoinedParty, setIsJoinedParty] = useState(false); // パーティー参加状態
	const unreadCount = 24; // 未読数（実際はAPIから取得）

	const handleJoinSuccess = () => {
		setIsJoinedParty(true); // パーティーに参加
		setIsSuccessModalOpen(true);
		onJoinParty?.(); // 親コンポーネントに通知
	};

	const handleBoxClick = () => {
		// パーティー参加済みの場合のみチャット画面に遷移
		if (isJoinedParty) {
			router.push("/community/party");
		}
	};

	return (
		<>
			{/* パーティーボックス */}
			<div className="mx-4 mb-6">
				<div 
					onClick={handleBoxClick}
					className={`flex bg-text2 items-center justify-between border border-text rounded-3xl p-4 shadow-sm transition-all ${
						isJoinedParty ? "cursor-pointer hover:bg-gray/10" : ""
					}`}
				>
					<div className="flex items-center gap-3">
						<GroupsIcon sx={{ fontSize: 40, color: "#1E293B" }} />
						<p className="text-lg text-text font-medium">パーティー</p>
					</div>
					
					{/* 参加前：ボタン表示 */}
					{!isJoinedParty && (
						<button
							onClick={(e) => {
								e.stopPropagation(); // 親のクリックイベントを防ぐ
								setIsJoinCodeModalOpen(true);
							}}
							className="bg-primary text-text2 px-8 py-2.5 rounded-full font-bold hover:opacity-90 transition-opacity"
						>
							参加する
						</button>
					)}
					
					{/* 参加後：未読バッジ表示（ボタンがあった位置） */}
					{isJoinedParty && unreadCount > 0 && (
						<div className="w-7 h-7 rounded-full bg-notification flex items-center justify-center">
							<span className="text-text2 text-xs font-bold">{unreadCount}</span>
						</div>
					)}
				</div>
			</div>

			{/* モーダル */}
			<PartyJoinCodeModal
				isOpen={isJoinCodeModalOpen}
				onClose={() => setIsJoinCodeModalOpen(false)}
				onSuccess={handleJoinSuccess}
			/>
			<PartySuccessModal
				isOpen={isSuccessModalOpen}
				onClose={() => setIsSuccessModalOpen(false)}
			/>
		</>
	);
}
