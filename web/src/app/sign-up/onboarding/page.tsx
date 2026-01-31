"use client";

import { hc } from "hono/client";
import { useState } from "react";
import type { AppType } from "@/../../api/src";
import { uploadFileToR2 } from "@/lib/r2";

const client = hc<AppType>("http://localhost:8787");

export default function Onboarding() {
	const [name, setName] = useState("");
	const [image, setImage] = useState<File | null>(null);

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
				type="file"
				onChange={(e) => setImage(e.target.files?.[0] || null)}
			/>
			<button
				onClick={async () => {
					let imageUrl = "";
					if (image) {
						try {
							imageUrl = await uploadFileToR2(image);
						} catch (e) {
							console.error("Upload failed", e);
							alert("Failed to upload image");
							return;
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
