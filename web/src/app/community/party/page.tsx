"use client";
import ChatHeader from "@/app/components/chat/ChatHeader";
import ChatInput from "@/app/components/chat/ChatInput";
import MessageList from "@/app/components/chat/MessageList";
import { dummyMessages } from "@/lib/dummyData";

export default function PartyPage() {
	const handleSend = (message: string) => {
		console.log("Send message:", message);
		// ここでAPIを呼び出す
	};

	return (
		<div className="min-h-screen bg-primary flex flex-col">
			<ChatHeader title="パーティー" icon="party" />
			<MessageList messages={dummyMessages} />
			<ChatInput onSend={handleSend} />
		</div>
	);
}
