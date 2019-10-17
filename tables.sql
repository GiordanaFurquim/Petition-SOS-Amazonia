DROP TABLE IF EXISTS users;

CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    first VARCHAR(255) NOT NULL,
    last VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


DROP TABLE IF EXISTS sigatures;

CREATE TABLE sigatures(
    id SERIAL PRIMARY KEY,
    signatures TEXT NOT NULL,
    user_id INT NOT NULL
);


DROP TABLE IF EXISTS users_profiles CASCADE;
CREATE TABLE users_profiles (
    id SERIAL PRIMARY KEY,
    age INT,
    city VARCHAR (100),
    url VARCHAR (300),
    user_id INT REFERENCES users(id) NOT NULL UNIQUE

);
