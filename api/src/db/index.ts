import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export const createDb = (d1: D1Database, debug = false) => {
	return drizzle(d1, {
		schema,
		logger: debug,
	});
};
