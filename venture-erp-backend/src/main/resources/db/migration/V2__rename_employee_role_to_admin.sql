-- The EMPLOYEE role was renamed to ADMIN. The old check constraint still lists
-- the previous values, so it is dropped, the rows are migrated, and a new
-- constraint is created with the current set of roles.

ALTER TABLE users DROP CONSTRAINT users_role_check;

UPDATE users SET role = 'ADMIN' WHERE role = 'EMPLOYEE';

ALTER TABLE users
    ADD CONSTRAINT users_role_check
    CHECK (role IN ('ADMIN', 'ASSEMBLY_SUPERVISOR'));