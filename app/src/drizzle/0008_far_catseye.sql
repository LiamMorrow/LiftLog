CREATE TABLE `backend_assignment` (
	`feature` text PRIMARY KEY NOT NULL,
	`backendId` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `backend_header` (
	`backendId` text NOT NULL,
	`name` text NOT NULL,
	`value` text NOT NULL,
	PRIMARY KEY(`backendId`, `name`),
	FOREIGN KEY (`backendId`) REFERENCES `backend`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `backend` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`url` text NOT NULL,
	`kind` text NOT NULL
);
