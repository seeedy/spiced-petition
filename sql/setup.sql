DROP TABLE IF EXISTS signers;
DROP TABLE IF EXISTS user_profiles;
DROP TABLE IF EXISTS users;


CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    first VARCHAR(100) NOT NULL,
    last VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL
);

CREATE TABLE signers (
    id SERIAL PRIMARY KEY,
    signature TEXT NOT NULL,
    user_id INTEGER REFERENCES users(id) NOT NULL
);

CREATE TABLE user_profiles (
    id SERIAL PRIMARY KEY,
    age VARCHAR(100),
    city VARCHAR(100),
    url VARCHAR(200),
    user_id INTEGER REFERENCES users(id) NOT NULL
)
