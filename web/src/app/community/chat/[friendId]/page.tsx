"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatInput from "@/components/chat/ChatInput";
import MessageList from "@/components/chat/MessageList";
import UserProfileModal from "@/components/modals/UserProfileModal";
import { client } from "@/lib/hono-client";

import { ApiMessage, ChatMessage } from "@/types/chat";

export default function ChatPage() {
	const params = useParams();
	const friendId = params.friendId as string;
	const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [channelId, setChannelId] = useState<number | null>(null);
	const [friendName, setFriendName] = useState("Loading...");

	useEffect(() => {
		const initChat = async () => {
			try {
				// DM チャンネルを取得または作成
				const channelRes = await client.api.chat.dm[":userId"].$post({
					param: { userId: friendId },
				});

				if (channelRes.ok) {
					const channelData = await channelRes.json();
					setChannelId(channelData.id);

					// メッセージ履歴を取得
					const messagesRes = await client.api.chat.channels[
						":id"
					].messages.$get({
						param: { id: channelData.id.toString() },
					});

					if (messagesRes.ok) {
						const messagesData = await messagesRes.json();
						setMessages(
							(messagesData as ApiMessage[]).map((msg) => ({
								...msg,
								isToday:
									new Date(msg.createdAt).toDateString() ===
									new Date().toDateString(),
							})),
						);

						// 既読にする
						await client.api.chat.channels[":id"].read.$post({
							param: { id: channelData.id.toString() },
						});
					}
				}

				// フレンド情報を取得
				const userRes = await client.api.user[":id"].$get({
					param: { id: friendId },
				});
				if (userRes.ok) {
					const userData = await userRes.json();
					setFriendName(userData.displayName || userData.name || "Unknown");
				}
			} catch (error) {
				console.error("Failed to initialize chat:", error);
			}
		};

		initChat();
	}, [friendId]);

	const handleSend = async (content: string) => {
		if (!channelId) return;

		try {
			const res = await client.api.chat.channels[":id"].messages.$post({
				param: { id: channelId.toString() },
				json: { content },
			});

			if (res.ok) {
				const newMessage = await res.json();
				setMessages((prev) => [
					...prev,
					{
						...newMessage,
						userName: "自分", // 仮
						displayName: "自分",
						isToday: true,
					},
				]);
			}
		} catch (error) {
			console.error("Failed to send message:", error);
		}
	};

	return (
		<div className="min-h-screen bg-primary flex flex-col">
			<ChatHeader
				title={friendName}
				icon="user"
				onTitleClick={() => setIsProfileModalOpen(true)}
			/>
			<MessageList
				messages={messages}
				onAvatarClick={() => setIsProfileModalOpen(true)}
			/>
			<ChatInput onSend={handleSend} />

			{/* プロフィールモーダル */}
			<UserProfileModal
				isOpen={isProfileModalOpen}
				onClose={() => setIsProfileModalOpen(false)}
				userName={friendName}
				userId={friendId}
				friendSince="2026/01/26"
			/>
		</div>
	);
}
