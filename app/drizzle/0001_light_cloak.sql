CREATE TABLE `program` (
	`id` text PRIMARY KEY NOT NULL,
	`modelVersion` integer NOT NULL,
	`active` integer NOT NULL,
	`payload` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `single_active_program` ON `program` (`active`) WHERE "program"."active" = 1;
