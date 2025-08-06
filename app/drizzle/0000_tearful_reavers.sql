CREATE TABLE `exercise` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`isBuiltIn` integer NOT NULL,
	`name` text NOT NULL,
	`force` text,
	`level` text NOT NULL,
	`mechanic` text,
	`equipment` text NOT NULL,
	`primaryMuscles` text NOT NULL,
	`secondaryMuscles` text NOT NULL,
	`instructions` text NOT NULL,
	`category` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `migration_version` (
	`builtInExerciseListVersion` integer NOT NULL
);
