CREATE TABLE `feed_reaction` (
	`id` text PRIMARY KEY NOT NULL,
	`payload` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `feed_sent_reaction` (
	`id` text PRIMARY KEY NOT NULL,
	`payload` text NOT NULL
);
