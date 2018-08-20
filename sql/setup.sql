DROP TABLE IF EXISTS signers;
DROP TABLE IF EXISTS users;


CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    first VARCHAR(200) NOT NULL,
    last VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL
);

CREATE TABLE signers (
    id SERIAL PRIMARY KEY,
    first VARCHAR(200) NOT NULL,
    last VARCHAR(255) NOT NULL,
    signature TEXT NOT NULL,
    user_id INTEGER REFERENCES users(id) NOT NULL
    -- bugfix: does not work with not null
);
