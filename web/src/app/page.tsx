import { authClient } from "@/lib/auth-client";

export default function Home() {
	const session = authClient.useSession();
	return (
		<div>
			{session.data?.user ? (
				<p>Logged in as {session.data.user.email}</p>
			) : (
				<p>Not logged in</p>
			)}
		</div>
	);
}
