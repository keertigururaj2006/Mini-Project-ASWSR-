SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE TABLE IF NOT EXISTS roles (
  id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code VARCHAR(40) NOT NULL,
  label VARCHAR(80) NOT NULL,
  description VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_roles_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  public_id VARCHAR(24) NOT NULL,
  role_id TINYINT UNSIGNED NOT NULL,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone_country_code VARCHAR(8) NULL DEFAULT '+91',
  phone_number VARCHAR(20) NULL,
  account_status ENUM('ACTIVE','INACTIVE','SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
  email_verified_at DATETIME NULL,
  last_login_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_public_id (public_id),
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_role_status (role_id, account_status),
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS applicant_profiles (
  user_id BIGINT UNSIGNED NOT NULL,
  date_of_birth DATE NULL,
  gender VARCHAR(30) NULL,
  address VARCHAR(255) NULL,
  city VARCHAR(100) NULL,
  state VARCHAR(100) NULL,
  postal_code VARCHAR(20) NULL,
  country VARCHAR(100) NULL DEFAULT 'India',
  highest_qualification VARCHAR(100) NULL,
  institution_name VARCHAR(180) NULL,
  intended_programme_id BIGINT UNSIGNED NULL,
  profile_photo_path VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  KEY idx_applicant_programme (intended_programme_id),
  CONSTRAINT fk_applicant_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS staff_profiles (
  user_id BIGINT UNSIGNED NOT NULL,
  department VARCHAR(160) NULL,
  designation VARCHAR(120) NULL,
  employee_code VARCHAR(40) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  CONSTRAINT fk_staff_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admission_cycles (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 0,
  created_by_user_id BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_admission_cycles_active_dates (is_active, start_date, end_date),
  CONSTRAINT fk_cycles_creator FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS programmes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code VARCHAR(40) NOT NULL,
  name VARCHAR(180) NOT NULL,
  short_code VARCHAR(40) NOT NULL,
  category VARCHAR(100) NOT NULL,
  level VARCHAR(50) NOT NULL,
  duration VARCHAR(80) NULL,
  description TEXT NULL,
  department VARCHAR(160) NULL,
  intake_capacity INT UNSIGNED NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_programmes_code (code),
  UNIQUE KEY uq_programmes_name (name),
  KEY idx_programmes_active_category (is_active, category),
  KEY idx_programmes_short_code (short_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS application_stages (
  code VARCHAR(50) NOT NULL,
  label VARCHAR(100) NOT NULL,
  sequence_no TINYINT UNSIGNED NOT NULL,
  description VARCHAR(255) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (code),
  UNIQUE KEY uq_application_stages_sequence (sequence_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS document_types (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code VARCHAR(60) NOT NULL,
  name VARCHAR(140) NOT NULL,
  description VARCHAR(255) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_document_types_code (code),
  UNIQUE KEY uq_document_types_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS programme_document_requirements (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  programme_id BIGINT UNSIGNED NOT NULL,
  document_type_id BIGINT UNSIGNED NOT NULL,
  qualification VARCHAR(100) NOT NULL DEFAULT '*',
  is_mandatory TINYINT(1) NOT NULL DEFAULT 1,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  display_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uq_programme_document_requirement (programme_id, document_type_id, qualification),
  KEY idx_programme_requirements_active (programme_id, is_active, is_mandatory),
  CONSTRAINT fk_pdr_programme FOREIGN KEY (programme_id) REFERENCES programmes(id) ON DELETE CASCADE,
  CONSTRAINT fk_pdr_document_type FOREIGN KEY (document_type_id) REFERENCES document_types(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS applications (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  application_number VARCHAR(32) NOT NULL,
  applicant_id BIGINT UNSIGNED NOT NULL,
  programme_id BIGINT UNSIGNED NOT NULL,
  admission_cycle_id BIGINT UNSIGNED NOT NULL,
  qualification VARCHAR(100) NOT NULL,
  personal_statement TEXT NULL,
  status ENUM('DRAFT','SUBMITTED','DOCUMENT_VERIFICATION','ELIGIBILITY_SCREENING','DEPARTMENT_REVIEW','DECISION_PENDING','ADMITTED','REJECTED','WAITLISTED','WITHDRAWN') NOT NULL DEFAULT 'DRAFT',
  current_stage_code VARCHAR(50) NOT NULL DEFAULT 'APPLICATION_SUBMISSION',
  submitted_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_applications_number (application_number),
  KEY idx_applications_applicant (applicant_id, created_at),
  KEY idx_applications_stage_status (current_stage_code, status),
  KEY idx_applications_programme_cycle (programme_id, admission_cycle_id),
  CONSTRAINT fk_applications_applicant FOREIGN KEY (applicant_id) REFERENCES users(id),
  CONSTRAINT fk_applications_programme FOREIGN KEY (programme_id) REFERENCES programmes(id),
  CONSTRAINT fk_applications_cycle FOREIGN KEY (admission_cycle_id) REFERENCES admission_cycles(id),
  CONSTRAINT fk_applications_stage FOREIGN KEY (current_stage_code) REFERENCES application_stages(code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS education_records (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  qualification VARCHAR(100) NOT NULL,
  institution_name VARCHAR(180) NOT NULL,
  board VARCHAR(180) NULL,
  year_of_passing SMALLINT UNSIGNED NOT NULL,
  marks_obtained DECIMAL(8,2) NOT NULL,
  maximum_marks DECIMAL(8,2) NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_education_user_qualification (user_id, qualification, year_of_passing),
  CONSTRAINT fk_education_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS application_documents (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  application_id BIGINT UNSIGNED NOT NULL,
  document_type_id BIGINT UNSIGNED NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  stored_filename VARCHAR(255) NOT NULL,
  storage_path VARCHAR(500) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size_bytes INT UNSIGNED NOT NULL,
  status ENUM('PENDING','VERIFIED','CLARIFICATION_REQUESTED','REJECTED') NOT NULL DEFAULT 'PENDING',
  version_number SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  is_latest TINYINT(1) NOT NULL DEFAULT 1,
  uploaded_by_user_id BIGINT UNSIGNED NOT NULL,
  uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_documents_application_latest (application_id, is_latest),
  KEY idx_documents_status (status, uploaded_at),
  KEY idx_documents_type (document_type_id),
  CONSTRAINT fk_documents_application FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
  CONSTRAINT fk_documents_type FOREIGN KEY (document_type_id) REFERENCES document_types(id),
  CONSTRAINT fk_documents_uploader FOREIGN KEY (uploaded_by_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS document_reviews (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  application_document_id BIGINT UNSIGNED NOT NULL,
  reviewer_user_id BIGINT UNSIGNED NOT NULL,
  decision ENUM('VERIFIED','CLARIFICATION_REQUESTED','REJECTED') NOT NULL,
  reason VARCHAR(1500) NULL,
  notes VARCHAR(1500) NULL,
  reviewed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_document_reviews_doc (application_document_id, reviewed_at),
  KEY idx_document_reviews_reviewer (reviewer_user_id, reviewed_at),
  CONSTRAINT fk_document_reviews_document FOREIGN KEY (application_document_id) REFERENCES application_documents(id) ON DELETE CASCADE,
  CONSTRAINT fk_document_reviews_reviewer FOREIGN KEY (reviewer_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS eligibility_rules (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  programme_id BIGINT UNSIGNED NOT NULL,
  qualification VARCHAR(100) NOT NULL,
  minimum_percentage DECIMAL(5,2) NOT NULL,
  required_documents JSON NOT NULL,
  optional_documents JSON NULL,
  remarks TEXT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_by_user_id BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_eligibility_rule_programme_qualification (programme_id, qualification),
  KEY idx_eligibility_rules_active (programme_id, is_active),
  CONSTRAINT fk_eligibility_rule_programme FOREIGN KEY (programme_id) REFERENCES programmes(id),
  CONSTRAINT fk_eligibility_rule_creator FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS eligibility_evaluations (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  application_id BIGINT UNSIGNED NOT NULL,
  rule_id BIGINT UNSIGNED NOT NULL,
  evaluated_by_user_id BIGINT UNSIGNED NOT NULL,
  status ENUM('ELIGIBLE','NOT_ELIGIBLE','INCOMPLETE') NOT NULL,
  percentage DECIMAL(5,2) NULL,
  summary TEXT NOT NULL,
  evaluated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_eligibility_eval_application (application_id, evaluated_at),
  CONSTRAINT fk_eligibility_eval_application FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
  CONSTRAINT fk_eligibility_eval_rule FOREIGN KEY (rule_id) REFERENCES eligibility_rules(id),
  CONSTRAINT fk_eligibility_eval_actor FOREIGN KEY (evaluated_by_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS eligibility_evaluation_checks (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  evaluation_id BIGINT UNSIGNED NOT NULL,
  criterion VARCHAR(180) NOT NULL,
  result ENUM('PASS','FAIL','PENDING') NOT NULL,
  explanation TEXT NOT NULL,
  actual_value VARCHAR(255) NULL,
  expected_value VARCHAR(255) NULL,
  PRIMARY KEY (id),
  KEY idx_eligibility_checks_eval (evaluation_id),
  CONSTRAINT fk_eligibility_checks_evaluation FOREIGN KEY (evaluation_id) REFERENCES eligibility_evaluations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS evaluation_rubrics (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(160) NOT NULL,
  programme_id BIGINT UNSIGNED NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_by_user_id BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_rubrics_programme_active (programme_id, is_active),
  CONSTRAINT fk_rubric_programme FOREIGN KEY (programme_id) REFERENCES programmes(id) ON DELETE SET NULL,
  CONSTRAINT fk_rubric_creator FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rubric_criteria (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  rubric_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(160) NOT NULL,
  description VARCHAR(1000) NULL,
  weight DECIMAL(5,2) NOT NULL,
  max_score DECIMAL(6,2) NOT NULL DEFAULT 10,
  display_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  KEY idx_rubric_criteria_order (rubric_id, display_order),
  CONSTRAINT fk_rubric_criteria_rubric FOREIGN KEY (rubric_id) REFERENCES evaluation_rubrics(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS evaluator_assignments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  application_id BIGINT UNSIGNED NOT NULL,
  evaluator_user_id BIGINT UNSIGNED NOT NULL,
  assigned_by_user_id BIGINT UNSIGNED NOT NULL,
  due_date DATE NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_evaluator_assignment (application_id, evaluator_user_id),
  KEY idx_evaluator_assignments_evaluator (evaluator_user_id, is_active, due_date),
  CONSTRAINT fk_assignment_application FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
  CONSTRAINT fk_assignment_evaluator FOREIGN KEY (evaluator_user_id) REFERENCES users(id),
  CONSTRAINT fk_assignment_admin FOREIGN KEY (assigned_by_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS department_reviews (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  application_id BIGINT UNSIGNED NOT NULL,
  assignment_id BIGINT UNSIGNED NOT NULL,
  evaluator_user_id BIGINT UNSIGNED NOT NULL,
  status ENUM('DRAFT','SUBMITTED') NOT NULL DEFAULT 'DRAFT',
  recommendation ENUM('RECOMMEND','DO_NOT_RECOMMEND','CLARIFICATION_REQUIRED') NOT NULL,
  remarks TEXT NULL,
  conflict_confirmed TINYINT(1) NOT NULL DEFAULT 0,
  submitted_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_department_review_assignment (assignment_id),
  KEY idx_department_reviews_application (application_id, status),
  CONSTRAINT fk_department_review_application FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
  CONSTRAINT fk_department_review_assignment FOREIGN KEY (assignment_id) REFERENCES evaluator_assignments(id) ON DELETE CASCADE,
  CONSTRAINT fk_department_review_evaluator FOREIGN KEY (evaluator_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS department_review_scores (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  review_id BIGINT UNSIGNED NOT NULL,
  criterion_id BIGINT UNSIGNED NULL,
  criterion_name VARCHAR(160) NOT NULL,
  weight DECIMAL(5,2) NOT NULL,
  score DECIMAL(6,2) NOT NULL,
  max_score DECIMAL(6,2) NOT NULL,
  evidence TEXT NULL,
  evidence_source VARCHAR(500) NULL,
  PRIMARY KEY (id),
  KEY idx_department_review_scores_review (review_id),
  CONSTRAINT fk_review_scores_review FOREIGN KEY (review_id) REFERENCES department_reviews(id) ON DELETE CASCADE,
  CONSTRAINT fk_review_scores_criterion FOREIGN KEY (criterion_id) REFERENCES rubric_criteria(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS clarification_requests (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  application_id BIGINT UNSIGNED NOT NULL,
  application_document_id BIGINT UNSIGNED NULL,
  created_by_user_id BIGINT UNSIGNED NOT NULL,
  category VARCHAR(80) NOT NULL,
  subject VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  applicant_instruction TEXT NULL,
  applicant_response TEXT NULL,
  priority ENUM('LOW','NORMAL','HIGH') NOT NULL DEFAULT 'NORMAL',
  status ENUM('OPEN_FOR_OFFICER','WAITING_FOR_APPLICANT','RESPONSE_RECEIVED','READY_FOR_REVIEW','RESOLVED','CLOSED') NOT NULL DEFAULT 'OPEN_FOR_OFFICER',
  resolved_by_user_id BIGINT UNSIGNED NULL,
  resolved_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_clarifications_application (application_id, status),
  KEY idx_clarifications_status (status, priority, created_at),
  CONSTRAINT fk_clarification_application FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
  CONSTRAINT fk_clarification_document FOREIGN KEY (application_document_id) REFERENCES application_documents(id) ON DELETE SET NULL,
  CONSTRAINT fk_clarification_creator FOREIGN KEY (created_by_user_id) REFERENCES users(id),
  CONSTRAINT fk_clarification_resolver FOREIGN KEY (resolved_by_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS final_decisions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  application_id BIGINT UNSIGNED NOT NULL,
  decided_by_user_id BIGINT UNSIGNED NOT NULL,
  outcome ENUM('ADMITTED','REJECTED','WAITLISTED') NOT NULL,
  remarks TEXT NOT NULL,
  decided_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_final_decision_application (application_id),
  CONSTRAINT fk_final_decision_application FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
  CONSTRAINT fk_final_decision_admin FOREIGN KEY (decided_by_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS application_stage_history (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  application_id BIGINT UNSIGNED NOT NULL,
  from_stage_code VARCHAR(50) NULL,
  to_stage_code VARCHAR(50) NOT NULL,
  from_status VARCHAR(40) NULL,
  to_status VARCHAR(40) NOT NULL,
  actor_user_id BIGINT UNSIGNED NULL,
  reason TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_stage_history_application (application_id, created_at),
  CONSTRAINT fk_stage_history_application FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
  CONSTRAINT fk_stage_history_from_stage FOREIGN KEY (from_stage_code) REFERENCES application_stages(code) ON DELETE SET NULL,
  CONSTRAINT fk_stage_history_to_stage FOREIGN KEY (to_stage_code) REFERENCES application_stages(code),
  CONSTRAINT fk_stage_history_actor FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notifications (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  recipient_user_id BIGINT UNSIGNED NOT NULL,
  actor_user_id BIGINT UNSIGNED NULL,
  title VARCHAR(180) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(40) NOT NULL DEFAULT 'SYSTEM',
  application_id BIGINT UNSIGNED NULL,
  route VARCHAR(255) NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  read_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_notifications_recipient (recipient_user_id, is_read, created_at),
  CONSTRAINT fk_notifications_recipient FOREIGN KEY (recipient_user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_notifications_actor FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_notifications_application FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  actor_user_id BIGINT UNSIGNED NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(80) NOT NULL,
  entity_id VARCHAR(80) NULL,
  metadata JSON NULL,
  ip_address VARCHAR(45) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_audit_entity (entity_type, entity_id, created_at),
  KEY idx_audit_actor (actor_user_id, created_at),
  KEY idx_audit_action (action, created_at),
  CONSTRAINT fk_audit_actor FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS refresh_sessions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  token_hash CHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  revoked_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_refresh_token_hash (token_hash),
  KEY idx_refresh_user_expiry (user_id, expires_at, revoked_at),
  CONSTRAINT fk_refresh_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
