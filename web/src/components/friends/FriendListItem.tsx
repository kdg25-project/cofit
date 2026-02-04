import { useRouter } from "next/navigation";

interface FriendListItemProps {
	id: string;
	name: string;
	message: string;
	time: string;
	unread: number;
	onAvatarClick?: () => void;
	isInParty?: boolean; // パーティー参加状態
}

export default function FriendListItem({
	id,
	name,
	message,
	time,
	unread,
	onAvatarClick,
	isInParty = false,
}: FriendListItemProps) {
	const router = useRouter();

	const handleClick = () => {
		router.push(`/community/chat/${id}`);
	};

	const handleAvatarClick = (e: React.MouseEvent) => {
		e.stopPropagation(); // メッセージクリックイベントを防ぐ
		onAvatarClick?.();
	};

	return (
		<div
			onClick={handleClick}
			className="flex items-center gap-3 py-4 border-b border-gray hover:bg-gray/20 cursor-pointer transition-colors"
		>
			{/* アバター */}
			<div
				onClick={handleAvatarClick}
				className="relative shrink-0 w-12 h-12 rounded-full bg-text flex items-center justify-center hover:ring-2 hover:ring-secondary transition-all"
			>
				<span className="text-text2 text-sm font-medium">{name.charAt(0)}</span>

				{/* 未読バッジ（パーティー参加時のみアバター上に表示） */}
				{isInParty && unread > 0 && (
					<div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-notification flex items-center justify-center">
						<span className="text-text2 text-xs font-bold">{unread}</span>
					</div>
				)}
			</div>

			{/* メッセージ情報 */}
			<div className="flex-1 min-w-0">
				<div className="flex items-center justify-between mb-1">
					<h4 className="font-medium text-text truncate">{name}</h4>
					<span className="text-xs text-placeholder">{time}</span>
				</div>
				<p className="text-sm text-placeholder truncate">{message}</p>
			</div>

			{/* 未読バッジ（通常時は右端に表示） */}
			{!isInParty && unread > 0 && (
				<div className="shrink-0 w-6 h-6 rounded-full bg-notification flex items-center justify-center">
					<span className="text-text2 text-xs font-bold">{unread}</span>
				</div>
			)}
		</div>
	);
}
