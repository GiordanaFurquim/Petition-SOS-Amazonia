const spicedPg = require("spiced-pg");

let db;
if (process.env.DATABASE_URL) {
    db = spicedPg(process.env.DATABASE_URL);
} else {
    const { dbuser, dbpass } = require("../secrets.json");
    db = spicedPg(`postgres:${dbuser}:${dbpass}@localhost:5432/petition`);
}

exports.getSigners = function() {
    return db.query(`SELECT first, last FROM sigatures`).then(({ rows }) => {
        return rows;
    });
};

exports.getSignature = function(signature) {
    return db
        .query(`SELECT signatures FROM sigatures WHERE user_id=$1`, [signature])
        .then(({ rows }) => {
            return rows[0];
        });
};

exports.insertUser = function(first, last, email, hash) {
    return db
        .query(
            `INSERT INTO users (first, last, email, password)
            VALUES ($1, $2, $3, $4)
            RETURNING id`,
            [first, last, email, hash]
        )
        .then(({ rows }) => {
            return rows[0].id;
        });
};

exports.insertSignature = function(signature, userId) {
    return db.query(
        `INSERT INTO sigatures (signatures, user_id)
        VALUES ($1, $2)
        RETURNING id`,
        [signature, userId]
    );
};

exports.userInfo = function(email) {
    return db
        .query(
            `SELECT password, id FROM users
            WHERE email = $1`,
            [email]
        );

};

exports.getProfile = function (age, city, url, user_id) {
    return db
        .query(
            `INSERT INTO users_profiles (age, city, url, user_id)
            VALUES ($1, $2, $3, $4)
            RETURNING id`,
            [age, city, url, user_id]
        )
        .then(({ rows }) => {
            return rows[0].id;
        });
};

exports.getAllSupporters = function () {
    return db
        .query(
            `SELECT users.first, users.last, users_profiles.age,
            users_profiles.url, users_profiles.city
            FROM sigatures
            JOIN users
            ON users.id = sigatures.user_id
            JOIN users_profiles
            ON users_profiles.user_id = sigatures.user_id`,
        )
        .then(({rows}) => {
            return rows;
        });
};

exports.getSameCitySupporters = function (city) {
    return db.query(`
        SELECT first, last, age, url, city
        FROM sigatures
        JOIN users
        ON users.id = sigatures.user_id
        JOIN users_profiles
        ON sigatures.user_id = users_profiles.user_id
        WHERE LOWER(city) = LOWER($1)`,
    [city]
    );
};

exports.getUpdatedUserProfile = function (userId) {
    console.log('userId:', userId);
    return db
        .query(`SELECT first, last, email, age, city, url
        FROM users
        JOIN users_profiles
        ON users.id = users_profiles.user_id
        WHERE users.id = $1`,
        [userId]
        )
        .then(results => {
            console.log("results db:", results);
            let userUpdate = {
                first: results.rows[0].first,
                last: results.rows[0].last,
                mail: results.rows[0].email,
                age: results.rows[0].age,
                city: results.rows[0].city,
                url: results.rows[0].url
            };
            return userUpdate;
        });
};

exports.updatedUsersProfile = function (age, city, url, user_id) {
    return db.query(`
        INSERT INTO users_profiles (age, city, url, user_id)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id)
        DO UPDATE SET age = $1, city = $2, url = $3, user_id $4
        `,
    [age || null, city || null, url || null, user_id]
    );
};

exports.noPasswordProfileUpdate = function (first, last, email, user_id){
    return db
        .query(`
        UPDATE users SET
        first = $1,
        last = $2,
        email = $3
        WHERE id = $4
        `,
        [first, last, email, user_id]
        );
};

exports.updateProfilePassword = function (first, last, email, user_id,  password) {
    return db
        .query(
            ` UPDATE users SET
        first = $1,
        last = $2,
        email = $3,
        password = $4
        WHERE id = $5`,
            [first, last, email, user_id, password]
        );
};

exports.deleteSignature = function(userId) {
    return db.query(
        `
        DELETE FROM sigatures
        WHERE user_id = $1
        `,
        [userId]
    );
};



//LOWER function converts all the characters in a string into lowercase.
//If you want to convert all characters in a string into uppercase, you should use the UPPER function.
