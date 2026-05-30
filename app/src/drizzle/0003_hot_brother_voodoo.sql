CREATE TABLE `feed_follow_request` (
	`id` text PRIMARY KEY NOT NULL,
	`modelVersion` integer NOT NULL,
	`payload` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `feed_followed_user` (
	`id` text PRIMARY KEY NOT NULL,
	`modelVersion` integer NOT NULL,
	`payload` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `feed_follower_user` (
	`id` text PRIMARY KEY NOT NULL,
	`modelVersion` integer NOT NULL,
	`payload` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `feed_identity` (
	`id` integer PRIMARY KEY NOT NULL,
	`modelVersion` integer NOT NULL,
	`payload` text NOT NULL,
	CONSTRAINT "single_feed_identity" CHECK(id = 0)
);
--> statement-breakpoint
CREATE TABLE `feed_items` (
	`id` text PRIMARY KEY NOT NULL,
	`modelVersion` integer NOT NULL,
	`payload` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `feed_revoked_follow_secrets` (
	`secret` text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE `feed_unpublished_sessions` (
	`sessionId` text PRIMARY KEY NOT NULL
);
