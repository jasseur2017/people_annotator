BEGIN;

CREATE SCHEMA IF NOT EXISTS project;

CREATE TABLE IF NOT EXISTS project.annotations(
    image_name VARCHAR(50) NOT NULL,
    shape INT[] NOT NULL,
    label VARCHAR(50)[],
    UNIQUE (image_name, shape)
);

CREATE TYPE status AS ENUM ('todo', 'doing', 'done');

CREATE TABLE IF NOT EXISTS project.filenames(
    image_name VARCHAR(50) PRIMARY KEY,
    status STATUS
);

COMMIT