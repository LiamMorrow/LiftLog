CREATE TABLE `feed_pending_user` (
    `id` text PRIMARY KEY NOT NULL,
    `payload` text NOT NULL
);--> statement-breakpoint

INSERT INTO feed_pending_user (id, payload)
SELECT id, payload FROM feed_followed_user
WHERE json_extract(payload, '$.type') = 'PendingFeedUser';--> statement-breakpoint

DELETE FROM feed_followed_user
WHERE json_extract(payload, '$.type') = 'PendingFeedUser';
