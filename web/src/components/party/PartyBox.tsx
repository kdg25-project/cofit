"use client";
import GroupsIcon from "@mui/icons-material/Groups";
import { useRouter } from "next/navigation";
import { useState } from "react";
import PartyJoinCodeModal from "../modals/PartyJoinCodeModal";
import PartySuccessModal from "../modals/PartySuccessModal";

interface PartyBoxProps {
	isJoined: boolean; // パーティー参加状態を外部から受け取る
	onJoinParty?: () => void; // パーティー参加時のコールバック
	unreadCount?: number; // 未読数を外部から受け取る
}

export default function PartyBox({
	isJoined,
	onJoinParty,
	unreadCount = 0,
}: PartyBoxProps) {
	const router = useRouter();
	const [isJoinCodeModalOpen, setIsJoinCodeModalOpen] = useState(false);
	const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

	const handleJoinSuccess = () => {
		setIsSuccessModalOpen(true);
		onJoinParty?.(); // 親コンポーネントに通知
	};

	const handleBoxClick = () => {
		// パーティー参加済みの場合のみチャット画面に遷移
		if (isJoined) {
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
						isJoined ? "cursor-pointer hover:bg-gray/10" : ""
					}`}
				>
					<div className="flex items-center gap-3">
						<GroupsIcon sx={{ fontSize: 40, color: "#1E293B" }} />
						<p className="text-lg text-text font-medium">パーティー</p>
					</div>

					{/* 参加前：ボタン表示 */}
					{!isJoined && (
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
					{isJoined && unreadCount > 0 && (
						<div className="w-7 h-7 rounded-full bg-notification flex items-center justify-center">
							<span className="text-text2 text-xs font-bold">
								{unreadCount}
							</span>
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
