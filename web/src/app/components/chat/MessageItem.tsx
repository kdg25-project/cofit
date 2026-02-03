import { Message } from "@/lib/dummyData";

interface MessageItemProps {
	message: Message;
	onAvatarClick?: () => void;
}

export default function MessageItem({ message, onAvatarClick }: MessageItemProps) {
	return (
		<div className="mb-4">
			<div className="flex items-start gap-3">
				{/* アバター */}
				<div 
					onClick={onAvatarClick}
					className="flex-shrink-0 w-10 h-10 rounded-full bg-text flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-secondary transition-all"
				>
					<span className="text-text2 text-xs font-medium">
						{message.userName.charAt(0)}
					</span>
				</div>

				{/* メッセージコンテンツ */}
				<div className="flex-1">
					<div className="flex items-baseline gap-2 mb-1">
						<span className="text-sm font-medium text-text">
							{message.userName}
						</span>
						<span className="text-xs text-placeholder">
							{message.timestamp}
						</span>
					</div>
					<p className="text-sm text-text whitespace-pre-line">
						{message.message}
					</p>
				</div>
			</div>
		</div>
	);
}
