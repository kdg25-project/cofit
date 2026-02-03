"use client";

import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import GoogleLogin from "@/components/GoogleLoginButton";
import { authClient } from "@/lib/auth-client";

export default function SignUp() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [errors, setErrors] = useState({
		email: "",
		password: "",
		confirmPassword: "",
	});

	const validateEmail = (val: string) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!val) return "メールアドレスを入力してください";
		if (!emailRegex.test(val)) return "有効なメールアドレスを入力してください";
		return "";
	};

	const validatePassword = (val: string) => {
		if (!val) return "パスワードを入力してください";
		if (val.length < 8) return "パスワードは8文字以上で入力してください";
		return "";
	};

	const validateConfirmPassword = (val: string, pass: string) => {
		if (!val) return "確認用パスワードを入力してください";
		if (val !== pass) return "パスワードが一致しません";
		return "";
	};

	const handleSignUp = () => {
		const emailError = validateEmail(email);
		const passwordError = validatePassword(password);
		const confirmPasswordError = validateConfirmPassword(
			confirmPassword,
			password,
		);

		if (emailError || passwordError || confirmPasswordError) {
			setErrors({
				email: emailError,
				password: passwordError,
				confirmPassword: confirmPasswordError,
			});
			return;
		}

		authClient.signUp.email(
			{
				email,
				password,
				callbackURL: "/sign-up/onboarding",
				name: Math.random().toString(36).slice(2, 10),
				displayName: Math.random().toString(36).slice(2, 10),
			},
			{
				onSuccess: () => {
					router.push("/sign-up/onboarding");
				},
				onError: (ctx) => {
					console.error("Sign up error:", ctx.error);
					if (ctx.error.status === 422) {
						setErrors((prev) => ({
							...prev,
							email:
								"このメールアドレスは既に登録されているか、入力内容が不正です。",
						}));
					}
				},
			},
		);
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-base md:bg-gray-100/50">
			<div className="flex flex-col items-center w-full h-screen md:h-auto md:max-w-[440px] md:min-h-[750px] md:rounded-[48px] md:shadow-2xl bg-base justify-between">
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
								onChange={(e) => {
									setEmail(e.target.value);
									setErrors((prev) => ({
										...prev,
										email: validateEmail(e.target.value),
									}));
								}}
								placeholder="demo@example.com"
								className={`w-full h-[55px] rounded-xl border-none bg-white p-4 text-placeholder shadow-[0_4px_12px_rgba(0,0,0,0.1)] focus:ring-2 focus:ring-secondary/20 outline-none transition-all ${
									errors.email ? "ring-2 ring-red-500" : ""
								}`}
							/>
							{errors.email && (
								<p className="text-red-500 text-xs mt-1 ml-1">{errors.email}</p>
							)}
						</div>
						<div>
							<p className="text-sm font-medium text-[16px] text-base mb-2">
								パスワード
							</p>
							<div className="relative">
								<input
									type={showPassword ? "text" : "password"}
									value={password}
									onChange={(e) => {
										setPassword(e.target.value);
										setErrors((prev) => ({
											...prev,
											password: validatePassword(e.target.value),
											confirmPassword: validateConfirmPassword(
												confirmPassword,
												e.target.value,
											),
										}));
									}}
									placeholder="パスワード"
									className={`w-full h-[55px] rounded-xl border-none bg-white p-4 pr-12 text-placeholder shadow-[0_4px_12px_rgba(0,0,0,0.1)] focus:ring-2 focus:ring-secondary/20 outline-none transition-all ${
										errors.password ? "ring-2 ring-red-500" : ""
									}`}
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
							{errors.password && (
								<p className="text-red-500 text-xs mt-1 ml-1">
									{errors.password}
								</p>
							)}
						</div>
						<div>
							<p className="text-sm font-medium text-[16px] text-base mb-2">
								パスワード確認
							</p>
							<div className="relative">
								<input
									type={showConfirmPassword ? "text" : "password"}
									value={confirmPassword}
									onChange={(e) => {
										setConfirmPassword(e.target.value);
										setErrors((prev) => ({
											...prev,
											confirmPassword: validateConfirmPassword(
												e.target.value,
												password,
											),
										}));
									}}
									placeholder="パスワード確認"
									className={`w-full h-[55px] rounded-xl border-none bg-white p-4 pr-12 text-placeholder shadow-[0_4px_12px_rgba(0,0,0,0.1)] focus:ring-2 focus:ring-secondary/20 outline-none transition-all ${
										errors.confirmPassword ? "ring-2 ring-red-500" : ""
									}`}
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
							{errors.confirmPassword && (
								<p className="text-red-500 text-xs mt-1 ml-1">
									{errors.confirmPassword}
								</p>
							)}
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

					<Link
						href="/login"
						className="text-sm font-medium text-[16px] text-base mt-auto pt-10 hover:underline transition-all"
					>
						ログインの方はこちら
					</Link>
				</div>
			</div>
		</div>
	);
}
