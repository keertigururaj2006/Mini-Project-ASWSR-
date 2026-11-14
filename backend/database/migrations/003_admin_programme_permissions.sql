  -- CrediFit: programme-level permissions for individual Admin accounts.
  -- Run this AFTER 002_multi_college_workflow.sql.
  -- Existing Admin accounts keep full programme access until an administrator
  -- changes them to a selected programme list in User & Role Management.

  CREATE TABLE IF NOT EXISTS admin_programme_access (
    admin_user_id BIGINT UNSIGNED NOT NULL,
    access_mode ENUM('ALL', 'SELECTED') NOT NULL DEFAULT 'SELECTED',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (admin_user_id),
    CONSTRAINT fk_admin_programme_access_user
      FOREIGN KEY (admin_user_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

  CREATE TABLE IF NOT EXISTS admin_programme_permissions (
    admin_user_id BIGINT UNSIGNED NOT NULL,
    programme_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (admin_user_id, programme_id),
    KEY idx_admin_programme_permissions_programme (programme_id),
    CONSTRAINT fk_admin_programme_permissions_admin
      FOREIGN KEY (admin_user_id) REFERENCES admin_programme_access(admin_user_id) ON DELETE CASCADE,
    CONSTRAINT fk_admin_programme_permissions_programme
      FOREIGN KEY (programme_id) REFERENCES programmes(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

  -- Preserve existing Admin accounts as full-access accounts, so the upgrade
  -- does not unexpectedly remove their current access. Scope them afterwards.
  INSERT IGNORE INTO admin_programme_access (admin_user_id, access_mode)
  SELECT u.id, 'ALL'
  FROM users u
  JOIN roles r ON r.id = u.role_id
  WHERE r.code = 'ADMIN';

  SELECT 'CrediFit Admin programme permissions migration completed.' AS migration_status;
