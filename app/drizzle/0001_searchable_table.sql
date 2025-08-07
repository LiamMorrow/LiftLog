-- Custom SQL migration file, put your code below! --
-- Create FTS virtual table for exercise search
CREATE VIRTUAL TABLE exercise_fts USING fts5 (exerciseName);

-- Populate the FTS table with existing exercise data
INSERT INTO
    exercise_fts (rowid, exerciseName)
SELECT
    id,
    exerciseName
FROM
    exercise;

-- Rebuild the FTS index to ensure it's properly created
INSERT INTO
    exercise_fts (exercise_fts)
VALUES
    ('rebuild');

-- Create triggers to keep FTS table in sync with exercise table
CREATE TRIGGER exercise_fts_insert
AFTER INSERT ON exercise
BEGIN
INSERT INTO
    exercise_fts (rowid, exerciseName)
VALUES
    (new.id, new.exerciseName);

END;

CREATE TRIGGER exercise_fts_delete
AFTER DELETE ON exercise
BEGIN
INSERT INTO
    exercise_fts (exercise_fts, rowid, exerciseName)
VALUES
    ('delete', old.id, old.exerciseName);

END;

CREATE TRIGGER exercise_fts_update
AFTER
UPDATE ON exercise
BEGIN
INSERT INTO
    exercise_fts (exercise_fts, rowid, exerciseName)
VALUES
    ('delete', old.id, old.exerciseName);

INSERT INTO
    exercise_fts (rowid, exerciseName)
VALUES
    (new.id, new.exerciseName);

END;
