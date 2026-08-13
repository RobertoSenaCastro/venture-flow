ALTER TABLE resellers
    ADD COLUMN IF NOT EXISTS created_at timestamp(6) without time zone,
    ADD COLUMN IF NOT EXISTS updated_at timestamp(6) without time zone;

UPDATE resellers
SET created_at = COALESCE(created_at, CURRENT_TIMESTAMP),
    updated_at = COALESCE(updated_at, created_at, CURRENT_TIMESTAMP)
WHERE created_at IS NULL OR updated_at IS NULL;

ALTER TABLE resellers
    ALTER COLUMN created_at SET NOT NULL,
    ALTER COLUMN updated_at SET NOT NULL;
