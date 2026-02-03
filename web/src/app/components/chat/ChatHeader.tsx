import { useRouter } from "next/navigation";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GroupsIcon from "@mui/icons-material/Groups";

interface ChatHeaderProps {
	title: string;
	icon?: "user" | "party";
	onTitleClick?: () => void;
}

export default function ChatHeader({ title, icon = "user", onTitleClick }: ChatHeaderProps) {
	const router = useRouter();

	return (
		<div className="bg-primary px-4 pt-6 pb-4 flex items-center gap-3">
			<button
				onClick={() => router.back()}
				className="p-2 hover:bg-primary rounded-full transition-colors"
			>
				<ArrowBackIcon sx={{ fontSize: 40, color: "var(--color-text)" }} />
			</button>

			{/* タイトル情報 */}
			<div 
				onClick={onTitleClick}
				className={`flex items-center gap-3 flex-1 ml-[10%] ${onTitleClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
			>
				{icon === "party" ? (
					<GroupsIcon sx={{ fontSize: 40, color: "var(--color-text)" }} />
				) : (
					<div className="w-12 h-12 rounded-full bg-text flex items-center justify-center">
						<span className="text-text2 text-sm font-medium">{title.charAt(0)}</span>
					</div>
				)}
				<h1 className="text-mg font-medium text-text">{title}</h1>
			</div>
		</div>
	);
}
