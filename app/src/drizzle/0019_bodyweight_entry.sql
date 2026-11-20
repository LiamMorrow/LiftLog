CREATE TABLE `bodyweight_entry` (
	`id` text PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`value` text NOT NULL,
	`unit` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `bodyweight_entry_date` ON `bodyweight_entry` (`date`);