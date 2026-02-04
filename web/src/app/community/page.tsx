"use client";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import { useEffect, useState } from "react";
import FriendListItem from "@/components/friends/FriendListItem";
import FriendsPanel from "@/components/friends/FriendsPanel";
import UserProfileModal from "@/components/modals/UserProfileModal";
import PartyBox from "@/components/party/PartyBox";

import { client } from "@/lib/hono-client";

type Friend = {
	id: string;
	name: string | null;
	displayName: string | null;
	image: string | null;
	status: string;
};

type Channel = {
	id: number;
	name: string;
	type: "dm" | "party";
	firstUserId: string | null;
	secondUserId: string | null;
	partyId: number | null;
	unreadCount: number;
	latestMessage: {
		content: string;
		createdAt: string;
	} | null;
};

export default function Home() {
	const [isPanelOpen, setIsPanelOpen] = useState(false);
	const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
	const [selectedFriend, setSelectedFriend] = useState<{
		name: string;
		userId: string;
		friendSince: string;
	} | null>(null);
	const [isJoinedParty, setIsJoinedParty] = useState(false); // パーティー参加状態
	const [friends, setFriends] = useState<Friend[]>([]);
	const [channels, setChannels] = useState<Channel[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [friendsRes, userRes, channelsRes] = await Promise.all([
					client.api.friends.$get(),
					client.api.auth.me.$get(),
					client.api.chat.channels.$get(),
				]);

				if (friendsRes.ok) {
					const data = await friendsRes.json();
					setFriends(data);
				}

				if (userRes.ok) {
					const userData = await userRes.json();
					if ("user" in userData) {
						setIsJoinedParty(!!userData.user.partyId);
					}
				}

				if (channelsRes.ok) {
					const data = await channelsRes.json();
					setChannels(data as Channel[]);
				}
			} catch (error) {
				console.error("Failed to fetch community data:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	const handleAvatarClick = (friend: Friend) => {
		setSelectedFriend({
			name: friend.displayName || friend.name || "Unknown",
			userId: friend.id,
			friendSince: "2026/01/26", // 本来は API から取得したい
		});
		setIsProfileModalOpen(true);
	};

	// チャンネルの割り当て
	const partyChannel = channels.find((c) => c.type === "party");

	return (
		<div className="min-h-screen bg-base pb-20">
			{/* ヘッダー */}
			<h2 className="text-2xl text-center text-text pt-6 pb-4">コミュニティ</h2>

			{/* パーティーボックス */}
			<PartyBox
				isJoined={isJoinedParty}
				onJoinParty={() => setIsJoinedParty(true)}
				unreadCount={partyChannel?.unreadCount || 0}
			/>

			{/* フレンドセクション */}
			<div className="px-4">
				<h3 className="text-lg text-text pb-[2%] font-medium border-b border-placeholder">
					フレンド
				</h3>

				{/* フレンドリスト */}
				<div className="space-y-0">
					{loading ? (
						<p className="text-center py-4 text-placeholder">読み込み中...</p>
					) : friends.length === 0 ? (
						<p className="text-center py-4 text-placeholder">
							フレンドがいません
						</p>
					) : (
						friends.map((friend) => {
							const dmChannel = channels.find(
								(c) =>
									c.type === "dm" &&
									(c.firstUserId === friend.id || c.secondUserId === friend.id),
							);

							const latestMessage = dmChannel?.latestMessage;
							let timeStr = "";
							if (latestMessage) {
								const date = new Date(latestMessage.createdAt);
								timeStr = `${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")}`;
							}

							return (
								<FriendListItem
									key={friend.id}
									id={friend.id}
									name={friend.displayName || friend.name || "Unknown"}
									message={latestMessage?.content || "チャットを始めましょう"}
									time={timeStr}
									unread={dmChannel?.unreadCount || 0}
									onAvatarClick={() => handleAvatarClick(friend)}
									isInParty={isJoinedParty}
								/>
							);
						})
					)}
				</div>
			</div>

			{/* フローティングアクションボタン */}
			<button
				onClick={() => setIsPanelOpen(true)}
				className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-primary shadow-lg flex items-center justify-center hover:scale-110 transition-transform text-text2"
			>
				<div className="relative">
					<ManageAccountsIcon sx={{ fontSize: 50, color: "text2" }} />
				</div>
			</button>

			{/* フレンドパネル */}
			<FriendsPanel
				isOpen={isPanelOpen}
				onClose={() => setIsPanelOpen(false)}
			/>

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
