"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function SignUp() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	return (
		<div>
			<h1>Sign Up</h1>
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
					authClient.signUp.email({
						email,
						password,
						callbackURL: "/",
						name: Math.random().toString(36).slice(2),
					})
				}
			>
				Sign Up
			</button>
		</div>
	);
}
