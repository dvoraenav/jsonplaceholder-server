-- Safe to run on an existing populated database: it only ALTERs the
-- users table and adds two new columns. It does NOT drop or recreate
-- any tables, so existing data is preserved.

ALTER TABLE users
    ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN is_blocked BOOLEAN NOT NULL DEFAULT FALSE;

