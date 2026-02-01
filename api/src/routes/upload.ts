import { Buffer } from "node:buffer";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Hono } from "hono";
import type { Bindings } from "../types";

const uploadRoute = new Hono<{ Bindings: Bindings }>().post("/", async (c) => {
	const formData = await c.req.parseBody();
	const file = formData.file as File;
	const folder = (formData.folder as string) || "images";

	if (!file) {
		return c.json({ error: "No file uploaded" }, 400);
	}

	try {
		const s3Client = new S3Client({
			region: "auto",
			endpoint: `https://${c.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
			credentials: {
				accessKeyId: c.env.R2_ACCESS_KEY_ID,
				secretAccessKey: c.env.R2_SECRET_ACCESS_KEY,
			},
		});

		const buffer = Buffer.from(await file.arrayBuffer());
		const filename = `${folder}/${crypto.randomUUID()}-${file.name}`;

		await s3Client.send(
			new PutObjectCommand({
				Bucket: c.env.R2_BUCKET_NAME!,
				Key: filename,
				Body: buffer,
				ContentType: file.type,
			}),
		);

		const imageUrl = `${c.env.R2_PUBLIC_URL}/${filename}`;
		return c.json({ url: imageUrl });
	} catch (error) {
		console.error("Upload error:", error);
		return c.json({ error: "Failed to upload file" }, 500);
	}
});

export default uploadRoute;
