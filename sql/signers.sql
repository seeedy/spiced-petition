DROP TABLE IF EXISTS signers;

CREATE TABLE signers (
    id SERIAL PRIMARY KEY,
    first VARCHAR(200) NOT NULL,
    last VARCHAR(255) NOT NULL,
    signature TEXT NOT NULL
);


SELECT * FROM signers;
