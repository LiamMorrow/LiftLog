ALTER TABLE `recorded_exercise` ADD `topWeightKg` real;--> statement-breakpoint
ALTER TABLE `recorded_exercise` ADD `workingWeightKg` real;--> statement-breakpoint
ALTER TABLE `recorded_exercise` ADD `totalReps` integer;--> statement-breakpoint
ALTER TABLE `recorded_exercise` ADD `bestSetReps` integer;--> statement-breakpoint
UPDATE `recorded_exercise` SET
  `topWeightKg` = (
    SELECT max(CASE `recorded_exercise`.`resistance` WHEN 'none' THEN 0 ELSE `weighted_set`.`weightKg` END)
    FROM `weighted_set`
    WHERE `weighted_set`.`sessionId` = `recorded_exercise`.`sessionId`
      AND `weighted_set`.`exerciseOrd` = `recorded_exercise`.`ord`
      AND `weighted_set`.`completedAtMs` IS NOT NULL
      AND `weighted_set`.`repsCompleted` > 0
  ),
  `workingWeightKg` = (
    SELECT min(CASE `recorded_exercise`.`resistance` WHEN 'none' THEN 0 ELSE `weighted_set`.`weightKg` END)
    FROM `weighted_set`
    WHERE `weighted_set`.`sessionId` = `recorded_exercise`.`sessionId`
      AND `weighted_set`.`exerciseOrd` = `recorded_exercise`.`ord`
      AND `weighted_set`.`completedAtMs` IS NOT NULL
      AND `weighted_set`.`repsCompleted` > 0
  ),
  `totalReps` = (
    SELECT sum(`weighted_set`.`repsCompleted`)
    FROM `weighted_set`
    WHERE `weighted_set`.`sessionId` = `recorded_exercise`.`sessionId`
      AND `weighted_set`.`exerciseOrd` = `recorded_exercise`.`ord`
      AND `weighted_set`.`completedAtMs` IS NOT NULL
      AND `weighted_set`.`repsCompleted` > 0
  ),
  `bestSetReps` = (
    SELECT max(`weighted_set`.`repsCompleted`)
    FROM `weighted_set`
    WHERE `weighted_set`.`sessionId` = `recorded_exercise`.`sessionId`
      AND `weighted_set`.`exerciseOrd` = `recorded_exercise`.`ord`
      AND `weighted_set`.`completedAtMs` IS NOT NULL
      AND `weighted_set`.`repsCompleted` > 0
  );
