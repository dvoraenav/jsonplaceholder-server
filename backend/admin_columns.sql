-- ==========================================
-- Migration 01: Add admin & blocking columns
-- ==========================================
-- Safe to run on an existing populated database: it only ALTERs the
-- users table and adds two new columns. It does NOT drop or recreate
-- any tables, so existing data is preserved.
--
-- Run with:  mysql -u root -p jsonplaceholder_api < backend/migrations/01_add_admin_columns.sql
-- (or paste into your MySQL client)

ALTER TABLE users
    ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN is_blocked BOOLEAN NOT NULL DEFAULT FALSE;

-- Optional: promote an existing account to admin (edit the id/username).
-- UPDATE users SET is_admin = TRUE WHERE username = 'your_admin_username';
