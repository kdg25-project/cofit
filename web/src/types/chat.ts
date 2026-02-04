import type { InferResponseType } from "hono";
import { client } from "@/lib/hono-client";

type MessagesResponse = InferResponseType<
	(typeof client.api.chat.channels)[":id"]["messages"]["$get"]
>;

export type ApiMessage = Extract<MessagesResponse, unknown[]>[number];

export type ChatMessage = ApiMessage & {
	isToday: boolean;
};
