import { sql } from "drizzle-orm";
import {
	type AnySQLiteColumn,
	customType,
	integer,
	sqliteTable,
	text,
} from "drizzle-orm/sqlite-core";

const datetime = customType<{ data: Date; driverData: string }>({
	dataType() {
		return "text";
	},
	fromDriver(value: string) {
		return new Date(value);
	},
	toDriver(value: Date) {
		return value.toISOString().replace("T", " ").split(".")[0];
	},
});

export const user = sqliteTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull().unique(),
	displayName: text("display_name"),
	email: text("email").notNull().unique(),
	emailVerified: integer("emailVerified", { mode: "boolean" }).notNull(),
	image: text("image"),
	partyId: integer("party_id").references((): AnySQLiteColumn => party.id),
	createdAt: datetime("createdAt").notNull().default(sql`CURRENT_TIMESTAMP`),
	updatedAt: datetime("updatedAt")
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`)
		.$onUpdate(() => new Date()),
});

export const party = sqliteTable("party", {
	id: integer("id").primaryKey(),
	ownerId: text("owner_id")
		.notNull()
		.references((): AnySQLiteColumn => user.id),
	name: text("name").notNull(),
	image: text("image"), // URL
	inviteCode: text("invite_code").notNull().unique(),
	createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
	updatedAt: datetime("updated_at")
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`)
		.$onUpdate(() => new Date()),
});

export const session = sqliteTable("session", {
	id: text("id").primaryKey(),
	expiresAt: datetime("expiresAt").notNull(),
	token: text("token").notNull().unique(),
	createdAt: datetime("createdAt").notNull().default(sql`CURRENT_TIMESTAMP`),
	updatedAt: datetime("updatedAt")
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`)
		.$onUpdate(() => new Date()),
	ipAddress: text("ipAddress"),
	userAgent: text("userAgent"),
	userId: text("userId")
		.notNull()
		.references(() => user.id),
});

export const account = sqliteTable("account", {
	id: text("id").primaryKey(),
	accountId: text("accountId").notNull(),
	providerId: text("providerId").notNull(),
	userId: text("userId")
		.notNull()
		.references(() => user.id),
	accessToken: text("accessToken"),
	refreshToken: text("refreshToken"),
	idToken: text("idToken"),
	accessTokenExpiresAt: datetime("accessTokenExpiresAt"),
	refreshTokenExpiresAt: datetime("refreshTokenExpiresAt"),
	scope: text("scope"),
	password: text("password"),
	createdAt: datetime("createdAt").notNull().default(sql`CURRENT_TIMESTAMP`),
	updatedAt: datetime("updatedAt")
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`)
		.$onUpdate(() => new Date()),
});

export const verification = sqliteTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: datetime("expiresAt").notNull(),
	createdAt: datetime("createdAt").notNull().default(sql`CURRENT_TIMESTAMP`),
	updatedAt: datetime("updatedAt")
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`)
		.$onUpdate(() => new Date()),
});
