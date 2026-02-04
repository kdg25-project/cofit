PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_channel` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`type` text NOT NULL,
	`first_user_id` text,
	`second_user_id` text,
	`party_id` integer,
	FOREIGN KEY (`first_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`second_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`party_id`) REFERENCES `party`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_channel`("id", "name", "created_at", "updated_at", "type", "first_user_id", "second_user_id", "party_id") SELECT "id", "name", "created_at", "updated_at", "type", "first_user_id", "second_user_id", "party_id" FROM `channel`;--> statement-breakpoint
DROP TABLE `channel`;--> statement-breakpoint
ALTER TABLE `__new_channel` RENAME TO `channel`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_mission_party` (
	`id` integer PRIMARY KEY NOT NULL,
	`mission_id` integer NOT NULL,
	`party_id` integer NOT NULL,
	`goal_count` integer NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`mission_id`) REFERENCES `mission`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`party_id`) REFERENCES `party`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_mission_party`("id", "mission_id", "party_id", "goal_count", "count", "created_at", "updated_at") SELECT "id", "mission_id", "party_id", "goal_count", "count", "created_at", "updated_at" FROM `mission_party`;--> statement-breakpoint
DROP TABLE `mission_party`;--> statement-breakpoint
ALTER TABLE `__new_mission_party` RENAME TO `mission_party`;