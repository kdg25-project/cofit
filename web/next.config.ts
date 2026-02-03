import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "img-cofit.kdgn.tech",
			},
		],
	},
};

export default nextConfig;
