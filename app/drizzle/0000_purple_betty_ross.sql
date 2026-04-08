CREATE TABLE `data_migration` (
	`id` text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`modelVersion` integer NOT NULL,
	`payload` text NOT NULL
);
