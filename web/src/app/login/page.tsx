"use client";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	return (
		<div>
			<h1>Login</h1>
			<p>Email</p>
			<input
				type="email"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
			/>
			<p>Password</p>
			<input
				type="password"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
			/>
			<button
				onClick={() =>
					authClient.signIn.email({ email, password, callbackURL: "/" })
				}
			>
				Login
			</button>
		</div>
	);
}
