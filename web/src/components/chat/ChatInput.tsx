"use client";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import SendIcon from "@mui/icons-material/Send";
import { useState } from "react";

interface ChatInputProps {
	onSend: (message: string) => void;
}

export default function ChatInput({ onSend }: ChatInputProps) {
	const [message, setMessage] = useState("");

	const handleSend = () => {
		if (message.trim()) {
			onSend(message);
			setMessage("");
		}
	};

	return (
		<div className="fixed bottom-0 left-0 right-0 bg-base px-4 py-3">
			<div className="flex items-center gap-3">
				{/* 入力フィールド（カメラボタン内蔵） */}
				<div className="relative flex-1">
					{/* カメラボタン */}
					<button className="absolute left-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray/30 rounded-full transition-colors">
						<CameraAltIcon
							sx={{ fontSize: 24, color: "var(--color-placeholder)" }}
						/>
					</button>

					{/* 入力フィールド */}
					<input
						type="text"
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						onKeyPress={(e) => e.key === "Enter" && handleSend()}
						placeholder="メッセージを入力"
						className="w-full pl-12 pr-4 py-2.5 bg-formtext rounded-full focus:outline-none transition-all text-placeholder placeholder:text-placeholder shadow-md"
					/>
				</div>

				{/* 送信ボタン */}
				<button
					onClick={handleSend}
					disabled={!message.trim()}
					className="p-2 rounded-full transition-opacity"
				>
					<SendIcon
						sx={{
							fontSize: 40,
							color: "var(--color-secondary)",
							transform: "rotate(320deg)",
						}}
					/>
				</button>
			</div>
		</div>
	);
}
