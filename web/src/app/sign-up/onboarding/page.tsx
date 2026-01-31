"use client";

import { hc } from "hono/client";
import { useState } from "react";
import type { AppType } from "@/../../api/src";

const client = hc<AppType>("http://localhost:8787");

export default function Onboarding() {
	const [name, setName] = useState("");
	const [image, setImage] = useState("");

	return (
		<div>
			<h1>Onboarding</h1>
			<p>Name</p>
			<input
				type="text"
				value={name}
				onChange={(e) => setName(e.target.value)}
			/>
			<p>Image</p>
			<input
				type="text"
				value={image}
				onChange={(e) => setImage(e.target.value)}
			/>
			<button
				onClick={async () => {
					const res = await client.api.auth.me.$patch({
						json: {
							name: name,
							displayName: name,
							image: image,
						},
					});
					if (res.ok) {
						alert("Profile updated!");
					} else {
						alert("Failed to update profile");
					}
				}}
			>
				Update Profile
			</button>
		</div>
	);
}
