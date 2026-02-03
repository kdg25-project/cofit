"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import PersonIcon from "@mui/icons-material/Person";
import Link from "next/link";
import { useState } from "react";
import { client } from "@/lib/hono-client";

export default function Onboarding() {
	const [name, setName] = useState("");
	const [image, setImage] = useState<File | null>(null);

	return (
		<div className="min-h-screen w-full flex items-center justify-center">
			<div className="flex flex-col items-center w-full min-h-screen rounded-lg shadow-md bg-base">
				<div className="flex items-center justify-center font-semibold text-6 w-full mt-[5%] ml-[10%]">
					<Link rel="stylesheet" href="/login">
						<ArrowBackIcon className="" />
					</Link>
					<p className="w-full  text-center text-[24px]">
						ようこそ<span className="pl-[8%]">Cofitへ</span>
					</p>
				</div>
				<h1 className="mt-[15%] text-[18px]">プロフィールを作ろう</h1>
				<div className="relative bg-primary flex-1 w-full rounded-t-[100px] flex flex-col items-center mt-[40%]">
					<div className="relative -top-[65px]">
						<label
							htmlFor="image"
							className="outline-[1px] outline-secondary outline-offset-10
                rounded-full flex justify-center items-center
                w-[130px] h-[130px]
                bg-placeholder text-white cursor-pointer"
						>
							<div className="rounded-full overflow-hidden w-[100px] h-[100px] flex items-center justify-center">
								<PersonIcon sx={{ fontSize: 150 }} />
							</div>
						</label>
						<label
							htmlFor="image"
							className="absolute bottom-0 right-0
                translate-x-1/4 translate-y-1/4
                rounded-full flex justify-center items-center
                w-[30px] h-[30px]
                bg-base text-black cursor-pointer shadow"
						>
							<EditIcon sx={{ fontSize: 20 }} />
						</label>
					</div>

					<p className="">アイコン</p>
					<input
						id="image"
						type="file"
						onChange={(e) => setImage(e.target.files?.[0] || null)}
						className="hidden"
					/>
					<div className="mt-[15%] w-[90%] h-[55px] shadow-[0_4px_12px_rgba(0,0,0,0.4)">
						<p className="text-sm font-medium text-[16px] text-base mb-[5%]">
							ユーザー名
							<span className="text-[#D9D9D9] ml-[5%]">半角英数字のみ</span>
						</p>
						<input
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="ユーザー名"
							className=" bg-white rounded-md p-2 w-full h-full"
						/>
					</div>
					<button
						className="mt-[20%] py-[10px] bg-[#1E293B] px-7 flex items-center justify-center rounded-full w-[90%] h-[50px] text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] mb-[40%]"
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
						決定する
					</button>
				</div>
			</div>
		</div>
	);
}
