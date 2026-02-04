"use client";

import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import GroupsIcon from "@mui/icons-material/Groups";
import LoginIcon from "@mui/icons-material/Login";
import PersonIcon from "@mui/icons-material/Person";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { client } from "@/lib/hono-client";

type Step = "profile" | "choice" | "create" | "join";

export default function Onboarding() {
	const router = useRouter();
	const [step, setStep] = useState<Step>("profile");
	const [name, setName] = useState("");
	const [image, setImage] = useState<File | null>(null);
	const [partyName, setPartyName] = useState("");
	const [inviteCode, setInviteCode] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleProfileSubmit = async () => {
		setIsLoading(true);
		try {
			let imageUrl = "";
			if (image) {
				const uploadRes = await client.api.upload.$post({
					form: { file: image },
				});
				if (uploadRes.ok) {
					const data = (await uploadRes.json()) as { url: string };
					imageUrl = data.url;
				}
			}

			const res = await client.api.auth.me.$patch({
				json: {
					name: name,
					displayName: name,
					image: imageUrl,
				},
			});

			if (res.ok) {
				setStep("choice");
			} else {
				alert("プロフィールの更新に失敗しました");
			}
		} catch (e) {
			console.error(e);
		} finally {
			setIsLoading(false);
		}
	};

	const handleCreateParty = async () => {
		setIsLoading(true);
		try {
			const res = await client.api.party.$post({
				json: { name: partyName },
			});
			if (res.ok) {
				router.push("/");
			} else {
				alert("パーティーの作成に失敗しました");
			}
		} catch (e) {
			console.error(e);
		} finally {
			setIsLoading(false);
		}
	};

	const handleJoinParty = async () => {
		setIsLoading(true);
		try {
			const res = await client.api.party.join.$post({
				json: { inviteCode: inviteCode },
			});
			if (res.ok) {
				router.push("/");
			} else {
				alert("招待コードが無効です");
			}
		} catch (e) {
			console.error(e);
		} finally {
			setIsLoading(false);
		}
	};

	const goBack = () => {
		if (step === "choice") setStep("profile");
		else if (step === "create" || step === "join") setStep("choice");
		else router.push("/login");
	};

	return (
		<div className="min-h-screen w-full flex items-center justify-center bg-base">
			<div className="flex flex-col items-center w-full max-w-[440px] min-h-screen md:min-h-[800px] md:h-auto bg-base md:shadow-2xl md:rounded-[48px] ">
				{/* Header */}
				<div className="flex items-center w-full px-8 pt-12 pb-6 relative">
					<button
						onClick={goBack}
						className="p-2 hover:bg-black/5 rounded-full transition-colors"
					>
						<ArrowBackIcon />
					</button>
					<h1 className="flex-1 text-center text-[24px] font-bold">
						{step === "profile" ? "プロフィール設定" : "パーティー設定"}
					</h1>
				</div>

				<div className="w-full flex-1 bg-primary rounded-t-[100px] mt-12 px-8 py-10 flex flex-col items-center">
					{step === "profile" && (
						<>
							<div className="relative -top-[65px]">
								<label
									htmlFor="image"
									className="rounded-full flex justify-center items-center w-[130px] h-[130px] bg-placeholder text-white cursor-pointer shadow-lg "
								>
									{image ? (
										<img
											src={URL.createObjectURL(image)}
											alt="Preview"
											className="w-full h-full object-cover"
										/>
									) : (
										<PersonIcon sx={{ fontSize: 80 }} />
									)}
								</label>
								<label
									htmlFor="image"
									className="absolute bottom-0 right-0 rounded-full flex justify-center items-center w-[36px] h-[36px] bg-white text-black cursor-pointer shadow-md"
								>
									<EditIcon sx={{ fontSize: 20 }} />
								</label>
							</div>
							<input
								id="image"
								type="file"
								onChange={(e) => setImage(e.target.files?.[0] || null)}
								className="hidden"
							/>

							<div className="w-full space-y-2 mb-10">
								<p className="text-sm font-semibold text-base">
									ユーザー名
									<span className="text-white/60 ml-2">半角英数字のみ</span>
								</p>
								<input
									type="text"
									value={name}
									onChange={(e) => setName(e.target.value)}
									placeholder="ユーザー名"
									className="w-full h-[55px] rounded-xl border-none bg-white p-4 shadow-md outline-none"
								/>
							</div>

							<button
								disabled={!name || isLoading}
								onClick={handleProfileSubmit}
								className="w-full h-[55px] bg-[#1E293B] text-white rounded-full font-bold shadow-lg active:scale-95 transition-all disabled:opacity-50"
							>
								{isLoading ? "処理中..." : "次へ進む"}
							</button>
						</>
					)}

					{step === "choice" && (
						<div className="w-full space-y-6 pt-10">
							<p className="text-center font-medium mb-8">
								パーティーに参加して、仲間と協力しよう！
							</p>
							<button
								onClick={() => setStep("create")}
								className="w-full p-6 bg-white rounded-2xl shadow-md flex items-center space-x-4 hover:bg-gray-50 transition-colors"
							>
								<div className="bg-secondary/20 p-3 rounded-full text-secondary">
									<AddIcon />
								</div>
								<div className="text-left">
									<p className="font-bold">新しくパーティーを作る</p>
									<p className="text-sm text-placeholder">
										あなたがリーダーになって作成します
									</p>
								</div>
							</button>

							<button
								onClick={() => setStep("join")}
								className="w-full p-6 bg-white rounded-2xl shadow-md flex items-center space-x-4 hover:bg-gray-50 transition-colors"
							>
								<div className="bg-base/20 p-3 rounded-full text-base">
									<LoginIcon />
								</div>
								<div className="text-left">
									<p className="font-bold">招待コードで参加する</p>
									<p className="text-sm text-placeholder">
										既存のパーティーに合流します
									</p>
								</div>
							</button>

							<button
								onClick={() => router.push("/")}
								className="w-full text-center text-sm font-medium pt-4 text-white/80 hover:underline"
							>
								あとで設定する
							</button>
						</div>
					)}

					{step === "create" && (
						<div className="w-full pt-10 space-y-8">
							<div className="flex flex-col items-center">
								<div className="bg-secondary/20 p-6 rounded-full text-secondary mb-4">
									<GroupsIcon sx={{ fontSize: 60 }} />
								</div>
								<p className="font-bold text-xl">パーティーを作成</p>
							</div>

							<div className="space-y-2">
								<p className="text-sm font-semibold text-base">パーティー名</p>
								<input
									type="text"
									value={partyName}
									onChange={(e) => setPartyName(e.target.value)}
									placeholder="例: チーム・ダイエット"
									className="w-full h-[55px] rounded-xl border-none bg-white p-4 shadow-md outline-none"
								/>
							</div>

							<button
								disabled={!partyName || isLoading}
								onClick={handleCreateParty}
								className="w-full h-[55px] bg-[#1E293B] text-white rounded-full font-bold shadow-lg active:scale-95 transition-all disabled:opacity-50"
							>
								{isLoading ? "作成中..." : "パーティーを作成する"}
							</button>
						</div>
					)}

					{step === "join" && (
						<div className="w-full pt-10 space-y-8">
							<div className="flex flex-col items-center">
								<div className="bg-base/20 p-6 rounded-full text-base mb-4">
									<LoginIcon sx={{ fontSize: 60 }} />
								</div>
								<p className="font-bold text-xl">パーティーに参加</p>
							</div>

							<div className="space-y-2">
								<p className="text-sm font-semibold text-base">招待コード</p>
								<input
									type="text"
									value={inviteCode}
									onChange={(e) => setInviteCode(e.target.value)}
									placeholder="6桁のコードを入力"
									className="w-full h-[55px] rounded-xl border-none bg-white p-4 shadow-md outline-none text-center text-2xl tracking-[0.5em] font-mono"
									maxLength={6}
								/>
							</div>

							<button
								disabled={inviteCode.length < 6 || isLoading}
								onClick={handleJoinParty}
								className="w-full h-[55px] bg-[#1E293B] text-white rounded-full font-bold shadow-lg active:scale-95 transition-all disabled:opacity-50"
							>
								{isLoading ? "参加中..." : "パーティーに参加する"}
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
