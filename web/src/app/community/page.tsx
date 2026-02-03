"use client";
import { useState } from "react";
import FriendListItem from "@/app/components/friends/FriendListItem";
import FriendsPanel from "@/app/components/friends/FriendsPanel";
import PartyBox from "@/app/components/party/PartyBox";
import UserProfileModal from "@/app/components/modals/UserProfileModal";
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import { dummyFriends } from "@/lib/dummyData";

export default function Home() {
	const [isPanelOpen, setIsPanelOpen] = useState(false);
	const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
	const [selectedFriend, setSelectedFriend] = useState<{ name: string; userId: string; friendSince: string } | null>(null);
	const [isJoinedParty, setIsJoinedParty] = useState(false); // パーティー参加状態
	
	const handleAvatarClick = (friend: typeof dummyFriends[0]) => {
		setSelectedFriend({
			name: friend.name,
			userId: `${friend.name.toLowerCase().replace(/\s+/g, '_')}_id`,
			friendSince: "2026/01/26",
		});
		setIsProfileModalOpen(true);
	};

	return (
		<div className="min-h-screen bg-base pb-20">
			{/* ヘッダー */}
			<h2 className="text-2xl text-center text-text pt-6 pb-4">コミュニティ</h2>
			
			{/* パーティーボックス */}
			<PartyBox onJoinParty={() => setIsJoinedParty(true)} />

			{/* フレンドセクション */}
			<div className="px-4">
				<h3 className="text-lg text-text pb-[2%] font-medium border-b-1 border-placeholder">フレンド</h3>
				
				{/* フレンドリスト */}
				<div className="space-y-0">
					{dummyFriends.map((friend) => (
						<FriendListItem
							key={friend.id}
							id={friend.id}
							name={friend.name}
							message={friend.message}
							time={friend.time}
							unread={friend.unread}
							onAvatarClick={() => handleAvatarClick(friend)}
							isInParty={isJoinedParty}
						/>
					))}
				</div>
			</div>

			{/* フローティングアクションボタン */}
			<button 
				onClick={() => setIsPanelOpen(true)}
				className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-primary shadow-lg flex items-center justify-center hover:scale-110 transition-transform text-text2"
			>
				<div className="relative">
					<ManageAccountsIcon sx={{ fontSize: 50, color: 'text2' }} />
				</div>
			</button>

			{/* フレンドパネル */}
			<FriendsPanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} />

			{/* プロフィールモーダル */}
			{selectedFriend && (
				<UserProfileModal
					isOpen={isProfileModalOpen}
					onClose={() => setIsProfileModalOpen(false)}
					userName={selectedFriend.name}
					userId={selectedFriend.userId}
					friendSince={selectedFriend.friendSince}
				/>
			)}
		</div>
	);  
}
