import { ChatMessage } from "@/types/chat";

export default function MessageItem({
	message,
	onAvatarClick,
}: {
	message: ChatMessage;
	onAvatarClick?: () => void;
}) {
	const displayName = message.displayName || message.userName || "Unknown";
	const timeText = new Date(message.createdAt).toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
	});

	return (
		<div className="mb-4">
			<div className="flex items-start gap-3">
				{/* アバター */}
				<div
					onClick={onAvatarClick}
					className="flex-shrink-0 w-10 h-10 rounded-full bg-text flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-secondary transition-all"
				>
					<span className="text-text2 text-xs font-medium">
						{displayName.charAt(0)}
					</span>
				</div>

				{/* メッセージコンテンツ */}
				<div className="flex-1">
					<div className="flex items-baseline gap-2 mb-1">
						<span className="text-sm font-medium text-text">{displayName}</span>
						<span className="text-xs text-placeholder">{timeText}</span>
					</div>
					<p className="text-sm text-text whitespace-pre-line">
						{message.content}
					</p>
				</div>
			</div>
		</div>
	);
}
