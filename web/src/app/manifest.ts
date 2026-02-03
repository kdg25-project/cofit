import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "CoFit",
		short_name: "CoFit",
		description: "ひとりじゃ続かない運動を、みんなで。",
		start_url: "/",
		display: "standalone",
		background_color: "#ffffff",
		theme_color: "#000000",
		icons: [
			{
				sizes: "192x192",
				src: "icon192_rounded.png",
				type: "image/png",
			},
			{
				sizes: "512x512",
				src: "icon512_rounded.png",
				type: "image/png",
			},
		],
	};
}
