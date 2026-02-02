"use client";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useState } from "react";
import GoogleLoginButton from "@/app/components/GoogleLoginButton";
import { authClient } from "@/lib/auth-client";

export default function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);

	return (
		<div className="min-h-screen flex items-center justify-center">
			<div className="flex flex-col items-center w-[full] h-[874px] rounded-lg shadow-md bg-base justify-end">
				<div>
					<img src="/logo.svg" alt="logo" />
				</div>
				<div className="bg-primary h-[635px] w-[402px] rounded-tl-[100px] flex flex-col items-center justify-end mt-[10%]">
					<h1 className="text-base font-semibold text-[24px] mt-[10%]">
						ログイン
					</h1>
					<div className="mt-[10%]">
						<p className="text-sm font-medium text-[16px] text-base mb-[5%]">
							メールアドレス
						</p>
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="メールアドレスを入力してください"
							className="w-[350px] h-[48px] rounded-md border bg-white p-2 text-placeholder shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
						/>
					</div>
					<div className="mt-[3%]">
						<p className="text-sm font-medium text-[16px] text-base mb-[5%]">
							パスワード
						</p>
						<div className="relative">
							<input
								type={showPassword ? "text" : "password"}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="パスワードを入力してください"
								className="w-[350px] h-[48px] rounded-md border bg-white p-2 pr-10 text-placeholder shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
							>
								{showPassword ? <VisibilityOff /> : <Visibility />}
							</button>
						</div>
					</div>
					<button
						onClick={() =>
							authClient.signIn.email({ email, password, callbackURL: "/" })
						}
						className="mt-[42px] py-[10px] bg-[#1E293B] px-7 flex items-center justify-center rounded-full w-[350px] h-[50px]  bg- shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
					>
						<span className="text-white">ログイン</span>
					</button>
					<div className=" my-[5%] flex items-center justify-center">
						<div className="border-t border-placeholder w-[95px]"></div>
						<p className="mx-[80px]">または</p>
						<div className="border-t border-placeholder w-[95px]"></div>
					</div>
					<GoogleLoginButton />
					<a
						href="/sign-up"
						className="text-sm font-medium text-[16px] text-base pt-[10%] pb-[5%]"
					>
						新規登録はこちら
					</a>
				</div>
			</div>
		</div>
	);
}
