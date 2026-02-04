"use client";
import { useEffect, useState } from "react";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatInput from "@/components/chat/ChatInput";
import MessageList from "@/components/chat/MessageList";
import { client } from "@/lib/hono-client";
import { ApiMessage, ChatMessage } from "@/types/chat";

export default function PartyPage() {
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [channelId, setChannelId] = useState<number | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const initPartyChat = async () => {
			try {
				setLoading(true);
				setError(null);
				// 自分の所属しているパーティーのチャンネルを探す
				const channelsRes = await client.api.chat.channels.$get();
				if (channelsRes.ok) {
					const channels = await channelsRes.json();
					const partyChannel = channels.find((ch) => ch.type === "party");

					if (partyChannel) {
						setChannelId(partyChannel.id);

						// メッセージ履歴を取得
						const messagesRes = await client.api.chat.channels[
							":id"
						].messages.$get({
							param: { id: partyChannel.id.toString() },
						});

						if (messagesRes.ok) {
							const messagesData = await messagesRes.json();
							// messagesData is ApiMessage[]
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
								param: { id: partyChannel.id.toString() },
							});
						} else {
							setError("メッセージの取得に失敗しました");
						}
					} else {
						setError(
							"所属しているパーティーが見つかりません。先にパーティーに参加してください。",
						);
					}
				} else {
					setError("チャンネル情報の取得に失敗しました");
				}
			} catch (error) {
				console.error("Failed to initialize party chat:", error);
				setError("チャットの初期化中にエラーが発生しました");
			} finally {
				setLoading(false);
			}
		};

		initPartyChat();
	}, []);

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
			<ChatHeader title="パーティー" icon="party" />
			<div className="flex-1 flex flex-col bg-base rounded-t-3xl mt-2">
				{loading ? (
					<div className="flex-1 flex items-center justify-center">
						<p className="text-placeholder">チャットを読み込み中...</p>
					</div>
				) : error ? (
					<div className="flex-1 flex items-center justify-center p-6 text-center">
						<p className="text-notification font-medium">{error}</p>
					</div>
				) : (
					<MessageList messages={messages} />
				)}
			</div>
			<ChatInput onSend={handleSend} />
		</div>
	);
}
