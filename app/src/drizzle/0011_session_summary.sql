ALTER TABLE `recorded_exercise` ADD `bestOneRepMaxKg` real;--> statement-breakpoint
ALTER TABLE `session` ADD `volumeKg` real DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `session` ADD `lastCompletedAtMs` integer;--> statement-breakpoint
UPDATE `recorded_exercise` SET `bestOneRepMaxKg` = (
  SELECT max(`effectiveKg` * (1 + `repsCompleted` / 30.0)) FROM `effective_weighted_set`
  WHERE `effective_weighted_set`.`sessionId` = `recorded_exercise`.`sessionId`
    AND `effective_weighted_set`.`exerciseOrd` = `recorded_exercise`.`ord`
    AND `effective_weighted_set`.`resistance` <> 'none'
    AND `effective_weighted_set`.`repsCompleted` > 0
    AND `effective_weighted_set`.`completedAtMs` IS NOT NULL
);--> statement-breakpoint
UPDATE `session` SET
  `volumeKg` = coalesce((
    SELECT sum(`effectiveKg` * `repsCompleted`) FROM `effective_weighted_set`
    WHERE `effective_weighted_set`.`sessionId` = `session`.`id` AND `effective_weighted_set`.`completedAtMs` IS NOT NULL
  ), 0),
  `lastCompletedAtMs` = (
    SELECT max(`completedAtMs`) FROM (
      SELECT `completedAtMs` FROM `weighted_set` WHERE `weighted_set`.`sessionId` = `session`.`id`
      UNION ALL
      SELECT `completedAtMs` FROM `cardio_set` WHERE `cardio_set`.`sessionId` = `session`.`id`
    )
  );
