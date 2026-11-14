-- CrediFit multi-college workflow extension.
-- Run this AFTER the first migration that created:
-- colleges, college_programmes, application_college_preferences,
-- and applications.selected_college_preference_id.

-- Each evaluator assignment must belong to one college preference.
SET @has_college_preference_id = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'evaluator_assignments'
    AND COLUMN_NAME = 'college_preference_id'
);
SET @sql = IF(
  @has_college_preference_id = 0,
  'ALTER TABLE evaluator_assignments ADD COLUMN college_preference_id BIGINT UNSIGNED NULL AFTER is_active',
  'SELECT "evaluator_assignments.college_preference_id already exists" AS migration_note'
);
PREPARE migration_stmt FROM @sql;
EXECUTE migration_stmt;
DEALLOCATE PREPARE migration_stmt;

-- MySQL unique indexes permit multiple NULL values. A generated scope key makes
-- old applications (NULL preference) and new college-specific assignments unique.
SET @has_preference_scope = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'evaluator_assignments'
    AND COLUMN_NAME = 'college_preference_scope_id'
);
SET @sql = IF(
  @has_preference_scope = 0,
  'ALTER TABLE evaluator_assignments ADD COLUMN college_preference_scope_id BIGINT UNSIGNED GENERATED ALWAYS AS (COALESCE(college_preference_id, 0)) STORED',
  'SELECT "evaluator_assignments.college_preference_scope_id already exists" AS migration_note'
);
PREPARE migration_stmt FROM @sql;
EXECUTE migration_stmt;
DEALLOCATE PREPARE migration_stmt;

-- Replace the previous application/evaluator unique key with one scoped by preference.
SET @has_old_assignment_index = (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'evaluator_assignments'
    AND INDEX_NAME = 'uq_evaluator_assignment'
);
SET @sql = IF(
  @has_old_assignment_index > 0,
  'ALTER TABLE evaluator_assignments DROP INDEX uq_evaluator_assignment',
  'SELECT "Legacy evaluator assignment index already removed" AS migration_note'
);
PREPARE migration_stmt FROM @sql;
EXECUTE migration_stmt;
DEALLOCATE PREPARE migration_stmt;

SET @has_new_assignment_index = (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'evaluator_assignments'
    AND INDEX_NAME = 'uq_evaluator_assignment_preference'
);
SET @sql = IF(
  @has_new_assignment_index = 0,
  'CREATE UNIQUE INDEX uq_evaluator_assignment_preference ON evaluator_assignments (application_id, college_preference_scope_id, evaluator_user_id)',
  'SELECT "Preference-scoped evaluator assignment index already exists" AS migration_note'
);
PREPARE migration_stmt FROM @sql;
EXECUTE migration_stmt;
DEALLOCATE PREPARE migration_stmt;

-- Link evaluator assignments to the matching applicant college choice.
SET @has_assignment_preference_fk = (
  SELECT COUNT(*)
  FROM information_schema.TABLE_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'evaluator_assignments'
    AND CONSTRAINT_NAME = 'fk_assignment_college_preference'
    AND CONSTRAINT_TYPE = 'FOREIGN KEY'
);
SET @sql = IF(
  @has_assignment_preference_fk = 0,
  'ALTER TABLE evaluator_assignments ADD CONSTRAINT fk_assignment_college_preference FOREIGN KEY (college_preference_id) REFERENCES application_college_preferences(id) ON DELETE SET NULL',
  'SELECT "Evaluator assignment preference foreign key already exists" AS migration_note'
);
PREPARE migration_stmt FROM @sql;
EXECUTE migration_stmt;
DEALLOCATE PREPARE migration_stmt;

-- Link the application to its currently selected preference.
SET @has_selected_preference_fk = (
  SELECT COUNT(*)
  FROM information_schema.TABLE_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'applications'
    AND CONSTRAINT_NAME = 'fk_applications_selected_college_preference'
    AND CONSTRAINT_TYPE = 'FOREIGN KEY'
);
SET @sql = IF(
  @has_selected_preference_fk = 0,
  'ALTER TABLE applications ADD CONSTRAINT fk_applications_selected_college_preference FOREIGN KEY (selected_college_preference_id) REFERENCES application_college_preferences(id) ON DELETE SET NULL',
  'SELECT "Application selected preference foreign key already exists" AS migration_note'
);
PREPARE migration_stmt FROM @sql;
EXECUTE migration_stmt;
DEALLOCATE PREPARE migration_stmt;

SELECT 'CrediFit multi-college workflow migration completed.' AS migration_status;
