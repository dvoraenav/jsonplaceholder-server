-- ============================================================
-- JSONPlaceholder API - FINAL consolidated schema
-- Includes every update: admin/block columns, albums, photos.
-- This file replaces schema.sql + migrations/01_add_admin_columns.sql.
-- Run it from a fresh database (it drops and recreates everything).
-- ============================================================

-- Create the database and set it as the active one
CREATE DATABASE IF NOT EXISTS jsonplaceholder_api;
USE jsonplaceholder_api;

-- Drop in reverse dependency order so re-running is safe
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS photos;
DROP TABLE IF EXISTS albums;
DROP TABLE IF EXISTS todos;
DROP TABLE IF EXISTS passwords;
DROP TABLE IF EXISTS users;

-- 1. Users table (must be created first as others depend on it)
--    is_admin / is_blocked added for the admin + blocking feature.
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    is_blocked BOOLEAN NOT NULL DEFAULT FALSE
);

-- 2. Passwords table (separated for security, linked to users)
CREATE TABLE passwords (
    user_id INT PRIMARY KEY,
    password_hash VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Todos table (linked to users)
CREATE TABLE todos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    title VARCHAR(255) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Albums table (linked to users)
CREATE TABLE albums (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    title VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Photos table (linked to albums)
CREATE TABLE photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    album_id INT,
    title VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    thumbnailUrl TEXT NOT NULL,
    FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE
);

-- 6. Posts table (linked to users)
CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    title VARCHAR(255) NOT NULL,
    body TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. Comments table (must be created last as it depends on posts)
CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    body TEXT,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);
