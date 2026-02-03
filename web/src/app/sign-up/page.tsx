"use client";

import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useState } from "react";
import GoogleLogin from "@/components/GoogleLoginButton";
import { authClient } from "@/lib/auth-client";

export default function SignUp() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const handleSignUp = () => {
		if (password !== confirmPassword) {
			alert("パスワードが一致しません。");
			return;
		}

		authClient.signUp.email({
			email,
			password,
			callbackURL: "/sign-up/onboarding",
			name: Math.random().toString(36).slice(2),
			displayName: Math.random().toString(36).slice(2),
			partyId: 0,
		});
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-base md:bg-gray-100/50">
			<div className="flex flex-col items-center w-full h-screen md:h-auto md:max-w-[440px] md:min-h-[750px] md:rounded-[48px] md:shadow-2xl bg-base justify-between overflow-hidden">
				<div className="py-12 md:py-16 flex items-center justify-center w-full">
					<img src="/logo.svg" alt="logo" className="w-40 h-auto" />
				</div>
				<div className="bg-primary flex-1 w-full rounded-tl-[100px] flex flex-col items-center px-8 py-10">
					<h1 className="text-base font-semibold text-[24px] mb-8">新規登録</h1>
					<div className="w-full space-y-6">
						<div>
							<p className="text-sm font-medium text-[16px] text-base mb-2">
								メールアドレス
							</p>
							<input
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="demo@example.com"
								className="w-full h-[55px] rounded-xl border-none bg-white p-4 text-placeholder shadow-[0_4px_12px_rgba(0,0,0,0.1)] focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
							/>
						</div>
						<div>
							<p className="text-sm font-medium text-[16px] text-base mb-2">
								パスワード
							</p>
							<div className="relative">
								<input
									type={showPassword ? "text" : "password"}
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder="パスワード"
									className="w-full h-[55px] rounded-xl border-none bg-white p-4 pr-12 text-placeholder shadow-[0_4px_12px_rgba(0,0,0,0.1)] focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
								/>
								<button
									type="button"
									onClick={() => setShowPassword((prev) => !prev)}
									className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
									aria-label="パスワードを表示"
								>
									{showPassword ? (
										<VisibilityOffIcon className="h-6 w-6" />
									) : (
										<RemoveRedEyeIcon className="h-6 w-6" />
									)}
								</button>
							</div>
						</div>
						<div>
							<p className="text-sm font-medium text-[16px] text-base mb-2">
								パスワード確認
							</p>
							<div className="relative">
								<input
									type={showConfirmPassword ? "text" : "password"}
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									placeholder="パスワード確認"
									className="w-full h-[55px] rounded-xl border-none bg-white p-4 pr-12 text-placeholder shadow-[0_4px_12px_rgba(0,0,0,0.1)] focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
								/>
								<button
									type="button"
									onClick={() => setShowConfirmPassword((prev) => !prev)}
									className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
									aria-label="確認用パスワードを表示"
								>
									{showConfirmPassword ? (
										<VisibilityOffIcon className="h-6 w-6" />
									) : (
										<RemoveRedEyeIcon className="h-6 w-6" />
									)}
								</button>
							</div>
						</div>
						<button
							onClick={handleSignUp}
							className="mt-4 py-[10px] bg-[#1E293B] hover:bg-[#0F172A] text-white flex items-center justify-center rounded-full w-full h-[55px] shadow-[0_8px_16px_rgba(0,0,0,0.2)] transition-all active:scale-[0.98] font-bold"
						>
							新規登録
						</button>
					</div>

					<div className="my-8 w-full flex items-center justify-center">
						<div className="border-t border-placeholder/30 flex-1"></div>
						<p className="mx-4 text-white/80 text-sm font-medium">または</p>
						<div className="border-t border-placeholder/30 flex-1"></div>
					</div>

					<div className="w-full flex justify-center">
						<GoogleLogin />
					</div>

					<a
						href="/login"
						className="text-sm font-medium text-[16px] text-base mt-auto pt-10 hover:underline transition-all"
					>
						ログインの方はこちら
					</a>
				</div>
			</div>
		</div>
	);
}
