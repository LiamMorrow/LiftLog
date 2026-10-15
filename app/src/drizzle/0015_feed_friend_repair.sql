CREATE TABLE `feed_friend_repair` (
	`friendId` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`firstNoticedAtMs` integer NOT NULL,
	`lastSentAtMs` integer,
	`attempts` integer DEFAULT 0 NOT NULL,
	`awaitingReply` integer DEFAULT false NOT NULL
);
