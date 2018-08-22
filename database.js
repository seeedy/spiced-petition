// setup spiced-postgres module
const spicedPg = require('spiced-pg');

const db = spicedPg('postgres:postgres:postgres@localhost:5432/petition');

module.exports.createNewSig = function(sig, userId) {
    return db.query(
        `
        INSERT INTO signers (signature, user_id)
        VALUES($1, $2)
        RETURNING id
        `,
        [sig || null, userId || null]
    );
};

module.exports.getSigners = function() {
    console.log('getting signers');
    return db.query(`
                    SELECT signers.id AS sig_id,
                            signers.signature AS signature,
                            users.first AS user_first,
                            users.last AS user_last,
                            user_profiles.age AS user_age,
                            user_profiles.city AS user_city,
                            user_profiles.url AS user_url
                    FROM signers
                    JOIN users
                    ON signers.user_id = users.id
                    JOIN user_profiles
                    ON user_profiles.user_id = users.id
                    `);
};

module.exports.getProfileData = function(userId) {
    console.log('getting profileData');
    return db.query(
        `
                    SELECT users.first AS user_first,
                            users.last AS user_last,
                            users.email AS user_email,
                            user_profiles.age AS user_age,
                            user_profiles.city AS user_city,
                            user_profiles.url AS user_url
                    FROM users
                    JOIN user_profiles
                    ON user_profiles.user_id = users.id
                    WHERE users.id = $1`,
        [userId || null]
    );
};

module.exports.getSignersByCity = function(city) {
    console.log('getting signers by city');
    return db.query(
        `
                    SELECT signers.user_id AS sig_id,
                            users.first AS user_first,
                            users.last AS user_last,
                            user_profiles.age AS user_age,
                            user_profiles.url AS user_url
                    FROM signers
                    JOIN users
                    ON signers.user_id = users.id
                    JOIN user_profiles
                    ON user_profiles.user_id = users.id
                    WHERE user_profiles.city = $1`,
        [city || null]
    );
};

module.exports.createNewUser = function(first, last, email, pw) {
    return db.query(
        'INSERT INTO users (first, last, email, password) VALUES($1, $2, $3, $4) RETURNING id, first, last',
        [first || null, last || null, email || null, pw || null]
    );
};

module.exports.getUsers = function() {
    return db.query('SELECT * FROM users');
};

module.exports.checkSig = function(passedId) {
    return db.query('SELECT id FROM signers WHERE user_id=$1', [
        passedId || null
    ]);
};

module.exports.createUserProfile = function(age, city, url, userId) {
    return db.query(
        'INSERT INTO user_profiles (age, city, url, user_id) VALUES ($1, $2, $3, $4)',
        [age || null, city || null, url || null, userId || null]
    );
};
