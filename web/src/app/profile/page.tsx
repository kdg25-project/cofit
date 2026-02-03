"use client";

import EditRoundedIcon from "@mui/icons-material/EditRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { authClient } from "@/lib/auth-client";
import { client } from "@/lib/hono-client";

const USERNAME_RE = /^[A-Za-z0-9]*$/;

export default function ProfilePage() {
	const router = useRouter();
	const session = authClient.useSession();
	const [displayName, setDisplayName] = useState("");
	const [userName, setUserName] = useState("");
	const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
	const [avatarFile, setAvatarFile] = useState<File | null>(null);
	const [isSaving, setIsSaving] = useState(false);

	const fileInputRef = useRef<HTMLInputElement | null>(null);

	useEffect(() => {
		if (!session.data?.user) return;

		setDisplayName(session.data.user.displayName ?? "");
		setUserName(session.data.user.name ?? "");

		if (session.data.user.image) {
			setAvatarPreview(session.data.user.image);
		}
	}, [session.data]);

	useEffect(() => {
		if (!avatarFile) return;
		const url = URL.createObjectURL(avatarFile);
		setAvatarPreview(url);
		return () => URL.revokeObjectURL(url);
	}, [avatarFile]);

	const canSave = useMemo(() => {
		return (
			displayName.trim().length > 0 &&
			userName.trim().length > 0 &&
			USERNAME_RE.test(userName)
		);
	}, [displayName, userName]);

	const handleSave = async () => {
		if (!canSave || isSaving) return;
		setIsSaving(true);
		try {
			let imageUrl = session.data?.user?.image ?? "";
			if (avatarFile) {
				const uploadRes = await client.api.upload.$post({
					form: {
						file: avatarFile,
					},
				});
				if (!uploadRes.ok) {
					throw new Error("Upload failed");
				}
				const data = (await uploadRes.json()) as { url?: string };
				if (data.url) imageUrl = data.url;
			}

			const res = await client.api.auth.me.$patch({
				json: {
					name: userName,
					displayName,
					image: imageUrl,
				},
			});

			if (!res.ok) {
				throw new Error("Profile update failed");
			}

			router.replace("/");
		} catch (e) {
			console.error(e);
			alert("プロフィールの更新に失敗しました");
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<main className="min-h-dvh bg-base">
			<div className="pt-[env(safe-area-inset-top)]" />
			<div className="mx-auto w-full max-w-[420px] px-6 pb-[calc(120px+env(safe-area-inset-bottom))]">
				<header className="relative flex items-center py-10">
					<button
						type="button"
						onClick={() => router.back()}
						className="h-10 w-10 rounded-full flex items-center justify-center text-text"
						aria-label="戻る"
					>
						<span className="text-[25px] leading-none">←</span>
					</button>
					<h1 className="pointer-events-none absolute inset-0 flex items-center justify-center text-xl text-text">
						プロフィール編集
					</h1>
				</header>

				<section className="flex flex-col items-center">
					<div className="relative">
						<div className="h-[150px] w-[150px] rounded-full border-[1px] border-secondary bg-base shadow-sm flex items-center justify-center">
							<div className="h-[132px] w-[132px] rounded-full overflow-hidden bg-gray flex items-center justify-center">
								{avatarPreview ? (
									<img
										src={avatarPreview}
										alt="プロフィール画像"
										className="h-full w-full object-cover"
									/>
								) : (
									<PersonRoundedIcon sx={{ fontSize: 72 }} />
								)}
							</div>
						</div>
						<button
							type="button"
							onClick={() => fileInputRef.current?.click()}
							className="absolute bottom-2 right-2 h-[30px] w-[30px] rounded-full bg-secondary text-text2 flex items-center justify-center shadow-lg"
							aria-label="画像を変更"
						>
							<EditRoundedIcon sx={{ fontSize: 20, color: "#1e293b" }} />
						</button>
						<input
							ref={fileInputRef}
							type="file"
							accept="image/*"
							className="hidden"
							onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
						/>
					</div>
				</section>
				<form
					className="mt-10 space-y-6"
					onSubmit={(e) => {
						e.preventDefault();
						handleSave();
					}}
				>
					<div className="space-y-2">
						<div className="flex items-baseline gap-3">
							<label className="text-base text-text">表示名</label>
						</div>
						<input
							type="text"
							value={displayName}
							onChange={(e) => setDisplayName(e.target.value)}
							placeholder="表示名を入力"
							className="w-full h-[55px] rounded-xl bg-text2 border border-text px-4 text-[16px] text-text shadow-sm placeholder:text-placeholder focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
						/>
					</div>

					<div className="space-y-2">
						<div className="flex items-baseline gap-3">
							<label className="text-base text-text">ユーザー名</label>
							<span className="text-sm text-placeholder">半角英数字のみ</span>
						</div>
						<input
							type="text"
							value={userName}
							onChange={(e) => {
								const next = e.target.value;
								if (USERNAME_RE.test(next)) setUserName(next);
							}}
							placeholder="ユーザー名を入力"
							inputMode="text"
							className="w-full h-[55px] rounded-xl bg-text2 border border-text px-4 text-[16px] text-text shadow-sm placeholder:text-placeholder focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
						/>
					</div>

					<PrimaryButton type="submit" className="mt-10 w-[350px]">
						保存する
					</PrimaryButton>
				</form>
			</div>
		</main>
	);
}
