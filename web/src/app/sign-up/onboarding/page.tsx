"use client";

import { useState } from "react";
import { client } from "@/lib/hono-client";

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
							const uploadRes = await client.api.upload.$post({
								form: {
									file: image,
								},
							});
							if (uploadRes.ok) {
								const data = (await uploadRes.json()) as
									| { url: string }
									| { error: string };
								if ("url" in data) {
									imageUrl = data.url;
								}
							} else {
								throw new Error("Upload failed");
							}
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
