import { Message } from "@/lib/dummyData";
import MessageItem from "./MessageItem";

interface MessageListProps {
	messages: Message[];
	onAvatarClick?: () => void;
}

export default function MessageList({ messages, onAvatarClick }: MessageListProps) {
	const todayIndex = messages.findIndex((msg) => msg.isToday);

	return (
		<div className="flex-1 bg-base rounded-t-3xl px-4 pt-6 pb-24 overflow-y-auto">
			{/* 今日より前のメッセージ */}
			{messages
				.filter((msg) => !msg.isToday)
				.map((msg) => (
					<MessageItem key={msg.id} message={msg} onAvatarClick={onAvatarClick} />
				))}

			{/* 今日のセパレーター */}
			{todayIndex !== -1 && (
				<div className="flex items-center gap-4 my-6">
					<div className="flex-1 h-px bg-gray" />
					<span className="text-sm text-placeholder">今日</span>
					<div className="flex-1 h-px bg-gray" />
				</div>
			)}

			{/* 今日のメッセージ */}
			{messages
				.filter((msg) => msg.isToday)
				.map((msg) => (
					<MessageItem key={msg.id} message={msg} onAvatarClick={onAvatarClick} />
				))}
		</div>
	);
}
