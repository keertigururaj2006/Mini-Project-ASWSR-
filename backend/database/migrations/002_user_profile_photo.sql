-- Stores authenticated profile photos for every account role.
ALTER TABLE users
  ADD COLUMN profile_photo_path VARCHAR(500) NULL AFTER phone_number;

-- Preserve photos previously stored on applicant_profiles.
UPDATE users u
JOIN applicant_profiles ap ON ap.user_id = u.id
SET u.profile_photo_path = ap.profile_photo_path
WHERE u.profile_photo_path IS NULL AND ap.profile_photo_path IS NOT NULL;
