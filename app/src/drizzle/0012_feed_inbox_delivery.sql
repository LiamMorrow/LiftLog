CREATE TABLE `feed_inbox_queue` (
	`messageId` text PRIMARY KEY NOT NULL,
	`sentAtMs` integer NOT NULL,
	`payload` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `feed_inbox_seen` (
	`messageId` text PRIMARY KEY NOT NULL,
	`seenAtMs` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `feed_outbox` (
	`seq` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`messageId` text NOT NULL,
	`recipientId` text NOT NULL,
	`type` text NOT NULL,
	`encryptedMessage` text NOT NULL,
	`createdAtMs` integer NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`nextAttemptAtMs` integer NOT NULL
);
