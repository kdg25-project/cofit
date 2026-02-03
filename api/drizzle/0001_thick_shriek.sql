PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_account` (
	`id` text PRIMARY KEY NOT NULL,
	`accountId` text NOT NULL,
	`providerId` text NOT NULL,
	`userId` text NOT NULL,
	`accessToken` text,
	`refreshToken` text,
	`idToken` text,
	`accessTokenExpiresAt` text,
	`refreshTokenExpiresAt` text,
	`scope` text,
	`password` text,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_account`("id", "accountId", "providerId", "userId", "accessToken", "refreshToken", "idToken", "accessTokenExpiresAt", "refreshTokenExpiresAt", "scope", "password", "createdAt", "updatedAt") SELECT "id", "accountId", "providerId", "userId", "accessToken", "refreshToken", "idToken", "accessTokenExpiresAt", "refreshTokenExpiresAt", "scope", "password", "createdAt", "updatedAt" FROM `account`;--> statement-breakpoint
DROP TABLE `account`;--> statement-breakpoint
ALTER TABLE `__new_account` RENAME TO `account`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_party` (
	`id` integer PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`name` text NOT NULL,
	`image` text,
	`invite_code` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_party`("id", "owner_id", "name", "image", "invite_code", "created_at", "updated_at") SELECT "id", "owner_id", "name", "image", "invite_code", "created_at", "updated_at" FROM `party`;--> statement-breakpoint
DROP TABLE `party`;--> statement-breakpoint
ALTER TABLE `__new_party` RENAME TO `party`;--> statement-breakpoint
CREATE UNIQUE INDEX `party_invite_code_unique` ON `party` (`invite_code`);--> statement-breakpoint
CREATE TABLE `__new_session` (
	`id` text PRIMARY KEY NOT NULL,
	`expiresAt` text NOT NULL,
	`token` text NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`ipAddress` text,
	`userAgent` text,
	`userId` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_session`("id", "expiresAt", "token", "createdAt", "updatedAt", "ipAddress", "userAgent", "userId") SELECT "id", "expiresAt", "token", "createdAt", "updatedAt", "ipAddress", "userAgent", "userId" FROM `session`;--> statement-breakpoint
DROP TABLE `session`;--> statement-breakpoint
ALTER TABLE `__new_session` RENAME TO `session`;--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE TABLE `__new_user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`display_name` text,
	`email` text NOT NULL,
	`emailVerified` integer DEFAULT false NOT NULL,
	`image` text,
	`party_id` integer,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`party_id`) REFERENCES `party`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_user`("id", "name", "display_name", "email", "emailVerified", "image", "party_id", "createdAt", "updatedAt") SELECT "id", "name", "display_name", "email", "emailVerified", "image", "party_id", "createdAt", "updatedAt" FROM `user`;--> statement-breakpoint
DROP TABLE `user`;--> statement-breakpoint
ALTER TABLE `__new_user` RENAME TO `user`;--> statement-breakpoint
CREATE UNIQUE INDEX `user_name_unique` ON `user` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `__new_verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expiresAt` text NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_verification`("id", "identifier", "value", "expiresAt", "createdAt", "updatedAt") SELECT "id", "identifier", "value", "expiresAt", "createdAt", "updatedAt" FROM `verification`;--> statement-breakpoint
DROP TABLE `verification`;--> statement-breakpoint
ALTER TABLE `__new_verification` RENAME TO `verification`;--> statement-breakpoint
CREATE TABLE `__new_badge` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`url` text,
	`description` text NOT NULL,
	`how_to_get` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_badge`("id", "name", "url", "description", "how_to_get", "created_at", "updated_at") SELECT "id", "name", "url", "description", "how_to_get", "created_at", "updated_at" FROM `badge`;--> statement-breakpoint
DROP TABLE `badge`;--> statement-breakpoint
ALTER TABLE `__new_badge` RENAME TO `badge`;--> statement-breakpoint
CREATE TABLE `__new_user_badge` (
	`user_id` text NOT NULL,
	`badge_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`user_id`, `badge_id`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`badge_id`) REFERENCES `badge`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_user_badge`("user_id", "badge_id", "created_at", "updated_at") SELECT "user_id", "badge_id", "created_at", "updated_at" FROM `user_badge`;--> statement-breakpoint
DROP TABLE `user_badge`;--> statement-breakpoint
ALTER TABLE `__new_user_badge` RENAME TO `user_badge`;--> statement-breakpoint
CREATE TABLE `__new_channel` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`type` text NOT NULL,
	`first_user_id` text NOT NULL,
	`second_user_id` text NOT NULL,
	`party_id` integer,
	FOREIGN KEY (`first_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`second_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`party_id`) REFERENCES `party`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_channel`("id", "name", "created_at", "updated_at", "type", "first_user_id", "second_user_id", "party_id") SELECT "id", "name", "created_at", "updated_at", "type", "first_user_id", "second_user_id", "party_id" FROM `channel`;--> statement-breakpoint
DROP TABLE `channel`;--> statement-breakpoint
ALTER TABLE `__new_channel` RENAME TO `channel`;--> statement-breakpoint
CREATE TABLE `__new_channel_read_status` (
	`user_id` text NOT NULL,
	`channel_id` integer NOT NULL,
	`last_read_at` text NOT NULL,
	PRIMARY KEY(`user_id`, `channel_id`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`channel_id`) REFERENCES `channel`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_channel_read_status`("user_id", "channel_id", "last_read_at") SELECT "user_id", "channel_id", "last_read_at" FROM `channel_read_status`;--> statement-breakpoint
DROP TABLE `channel_read_status`;--> statement-breakpoint
ALTER TABLE `__new_channel_read_status` RENAME TO `channel_read_status`;--> statement-breakpoint
CREATE TABLE `__new_message` (
	`id` integer PRIMARY KEY NOT NULL,
	`channel_id` integer,
	`user_id` text NOT NULL,
	`content` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`channel_id`) REFERENCES `channel`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_message`("id", "channel_id", "user_id", "content", "created_at", "updated_at") SELECT "id", "channel_id", "user_id", "content", "created_at", "updated_at" FROM `message`;--> statement-breakpoint
DROP TABLE `message`;--> statement-breakpoint
ALTER TABLE `__new_message` RENAME TO `message`;--> statement-breakpoint
CREATE TABLE `__new_mission` (
	`id` integer PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`goal_count` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`expired_at` text NOT NULL,
	`type` text NOT NULL,
	`mode` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_mission`("id", "title", "goal_count", "created_at", "updated_at", "expired_at", "type", "mode") SELECT "id", "title", "goal_count", "created_at", "updated_at", "expired_at", "type", "mode" FROM `mission`;--> statement-breakpoint
DROP TABLE `mission`;--> statement-breakpoint
ALTER TABLE `__new_mission` RENAME TO `mission`;--> statement-breakpoint
CREATE TABLE `__new_mission_party` (
	`mission_id` integer NOT NULL,
	`party_id` integer NOT NULL,
	`goal_count` integer NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`mission_id`) REFERENCES `mission`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`party_id`) REFERENCES `party`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_mission_party`("mission_id", "party_id", "goal_count", "count", "created_at", "updated_at") SELECT "mission_id", "party_id", "goal_count", "count", "created_at", "updated_at" FROM `mission_party`;--> statement-breakpoint
DROP TABLE `mission_party`;--> statement-breakpoint
ALTER TABLE `__new_mission_party` RENAME TO `mission_party`;--> statement-breakpoint
CREATE TABLE `__new_friend` (
	`id` integer PRIMARY KEY NOT NULL,
	`requester_id` text NOT NULL,
	`addressee_id` text NOT NULL,
	`status` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`requester_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`addressee_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_friend`("id", "requester_id", "addressee_id", "status", "created_at", "updated_at") SELECT "id", "requester_id", "addressee_id", "status", "created_at", "updated_at" FROM `friend`;--> statement-breakpoint
DROP TABLE `friend`;--> statement-breakpoint
ALTER TABLE `__new_friend` RENAME TO `friend`;--> statement-breakpoint
CREATE TABLE `__new_party_member` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`party_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`party_id`) REFERENCES `party`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_party_member`("id", "user_id", "party_id", "created_at", "updated_at") SELECT "id", "user_id", "party_id", "created_at", "updated_at" FROM `party_member`;--> statement-breakpoint
DROP TABLE `party_member`;--> statement-breakpoint
ALTER TABLE `__new_party_member` RENAME TO `party_member`;--> statement-breakpoint
CREATE TABLE `__new_user_activity` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`activity` text NOT NULL,
	`count` integer NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_user_activity`("id", "user_id", "activity", "count", "start_time", "end_time", "created_at", "updated_at") SELECT "id", "user_id", "activity", "count", "start_time", "end_time", "created_at", "updated_at" FROM `user_activity`;--> statement-breakpoint
DROP TABLE `user_activity`;--> statement-breakpoint
ALTER TABLE `__new_user_activity` RENAME TO `user_activity`;