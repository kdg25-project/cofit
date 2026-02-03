"use client";
import { useState } from "react";
import ChatHeader from "@/app/components/chat/ChatHeader";
import ChatInput from "@/app/components/chat/ChatInput";
import MessageList from "@/app/components/chat/MessageList";
import UserProfileModal from "@/app/components/modals/UserProfileModal";
import { dummyMessages } from "@/lib/dummyData";

export default function ChatPage() {
	const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

	const handleSend = (message: string) => {
		console.log("Send message:", message);
		// ここでAPIを呼び出す
	};

	return (
		<div className="min-h-screen bg-primary flex flex-col">
			<ChatHeader 
				title="飯田　陸" 
				icon="user" 
				onTitleClick={() => setIsProfileModalOpen(true)} 
			/>
			<MessageList 
				messages={dummyMessages} 
				onAvatarClick={() => setIsProfileModalOpen(true)} 
			/>
			<ChatInput onSend={handleSend} />

			{/* プロフィールモーダル */}
			<UserProfileModal
				isOpen={isProfileModalOpen}
				onClose={() => setIsProfileModalOpen(false)}
				userName="飯田　陸"
				userId="iida_rikudayo"
				friendSince="2026/01/26"
			/>
		</div>
	);
}
