ALTER TABLE `session` ADD `active` integer DEFAULT false NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `single_active_session` ON `session` (`active`) WHERE "session"."active" = 1;