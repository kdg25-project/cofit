"use client";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useState } from "react";
import GoogleLogin from "@/components/GoogleLoginButton";
import { authClient } from "@/lib/auth-client";

export default function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);

	return (
		<div className="min-h-screen flex items-center justify-center bg-base md:bg-gray-100/50">
			<div className="flex flex-col items-center w-full h-screen md:h-auto md:max-w-[440px] md:min-h-[750px] md:rounded-[48px] md:shadow-2xl bg-base justify-between overflow-hidden">
				<div className="py-12 md:py-16 flex items-center justify-center w-full">
					<img src="/logo.svg" alt="logo" className="w-40 h-auto" />
				</div>
				<div className="bg-primary flex-1 w-full rounded-tl-[100px] flex flex-col items-center px-8 py-10">
					<h1 className="text-base font-semibold text-xl mb-8">ログイン</h1>
					<div className="w-full space-y-7">
						<div>
							<p className="font-medium text-[16px] text-base mb-2">
								メールアドレス
							</p>
							<input
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="メールアドレス"
								className="w-full h-[55px] rounded-xl border-none bg-white p-4 text-text shadow-[0_4px_12px_rgba(0,0,0,0.1)] placeholder:text-placeholder focus:ring-2 focus:ring-text outline-none transition-all"
							/>
						</div>
						<div>
							<p className="font-medium text-[16px] text-base mb-2">
								パスワード
							</p>
							<div className="relative">
								<input
									type={showPassword ? "text" : "password"}
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder="パスワード"
									className="w-full h-[55px] rounded-xl border-none bg-text2 p-4 pr-12 text-text shadow-[0_4px_12px_rgba(0,0,0,0.1)] placeholder:text-placeholder focus:ring-2 focus:ring-text outline-none transition-all"
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-4 top-1/2 -translate-y-1/2 text-placeholder"
								>
									{showPassword ? (
										<VisibilityOffIcon className="h-6 w-6" />
									) : (
										<RemoveRedEyeIcon className="h-6 w-6" />
									)}
								</button>
							</div>
						</div>
						<button
							onClick={() =>
								authClient.signIn.email({
									email,
									password,
									callbackURL: "/",
									rememberMe: true,
								})
							}
							className="mt-6 py-[10px] bg-text hover:bg-text text-text2 flex items-center justify-center rounded-full w-full h-[55px] shadow-[0_8px_16px_rgba(0,0,0,0.2)]"
						>
							ログイン
						</button>
					</div>

					<div className="my-8 w-full flex items-center justify-center">
						<div className="border-t border-placeholder flex-1"></div>
						<p className="mx-4 text-text text-sm font-medium">または</p>
						<div className="border-t border-placeholder flex-1"></div>
					</div>

					<div className="w-full flex justify-center">
						<GoogleLogin />
					</div>

					<a
						href="/sign-up"
						className="text-sm font-medium text-text2 mt-auto pt-10 hover:underline transition-all"
					>
						新規登録はこちら
					</a>
				</div>
			</div>
		</div>
	);
}
