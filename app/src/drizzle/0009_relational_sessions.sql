ALTER TABLE `session` RENAME TO `session_legacy`;--> statement-breakpoint
DROP INDEX `single_active_session`;--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`notes` text NOT NULL,
	`date` text NOT NULL,
	`active` integer DEFAULT false NOT NULL,
	`bodyweightValue` text,
	`bodyweightUnit` text
);--> statement-breakpoint
CREATE UNIQUE INDEX `single_active_session` ON `session` (`active`) WHERE "session"."active" = 1;--> statement-breakpoint
CREATE INDEX `session_date` ON `session` (`date`);--> statement-breakpoint
CREATE TABLE `recorded_exercise` (
	`sessionId` text NOT NULL,
	`ord` integer NOT NULL,
	`type` text NOT NULL,
	`notes` text,
	`movementKey` text NOT NULL,
	`progressionKey` text NOT NULL,
	`name` text NOT NULL,
	`blueprintNotes` text NOT NULL,
	`link` text NOT NULL,
	`restMinMs` integer,
	`restMaxMs` integer,
	`restFailureMs` integer,
	`supersetWithNext` integer,
	`resistance` text,
	`plannedSets` text,
	`progression` text,
	PRIMARY KEY(`sessionId`, `ord`),
	FOREIGN KEY (`sessionId`) REFERENCES `session`(`id`) ON UPDATE no action ON DELETE cascade
);--> statement-breakpoint
CREATE INDEX `recorded_exercise_movement_key` ON `recorded_exercise` (`movementKey`);--> statement-breakpoint
CREATE INDEX `recorded_exercise_progression_key` ON `recorded_exercise` (`progressionKey`);--> statement-breakpoint
CREATE TABLE `weighted_set` (
	`sessionId` text NOT NULL,
	`exerciseOrd` integer NOT NULL,
	`ord` integer NOT NULL,
	`targetMin` integer NOT NULL,
	`targetMax` integer NOT NULL,
	`weightValue` text NOT NULL,
	`weightUnit` text NOT NULL,
	`repsCompleted` integer,
	`completedAt` text,
	`completedAtMs` integer,
	PRIMARY KEY(`sessionId`, `exerciseOrd`, `ord`),
	FOREIGN KEY (`sessionId`,`exerciseOrd`) REFERENCES `recorded_exercise`(`sessionId`,`ord`) ON UPDATE no action ON DELETE cascade
);--> statement-breakpoint
CREATE TABLE `cardio_set` (
	`sessionId` text NOT NULL,
	`exerciseOrd` integer NOT NULL,
	`ord` integer NOT NULL,
	`targetType` text NOT NULL,
	`targetDurationMs` integer,
	`targetDistanceValue` text,
	`targetDistanceUnit` text,
	`trackDuration` integer NOT NULL,
	`trackDistance` integer NOT NULL,
	`trackResistance` integer NOT NULL,
	`trackIncline` integer NOT NULL,
	`trackWeight` integer NOT NULL,
	`trackSteps` integer NOT NULL,
	`restMinMs` integer,
	`restMaxMs` integer,
	`restFailureMs` integer,
	`completedAt` text,
	`completedAtMs` integer,
	`durationMs` integer,
	`distanceValue` text,
	`distanceUnit` text,
	`resistance` text,
	`incline` text,
	`weightValue` text,
	`weightUnit` text,
	`steps` integer,
	PRIMARY KEY(`sessionId`, `exerciseOrd`, `ord`),
	FOREIGN KEY (`sessionId`,`exerciseOrd`) REFERENCES `recorded_exercise`(`sessionId`,`ord`) ON UPDATE no action ON DELETE cascade
);
