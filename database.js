// setup spiced-postgres module
const spicedPg = require('spiced-pg');

const db = spicedPg('postgres:postgres:postgres@localhost:5432/petition');

module.exports.createNewSig = function(sig, userId) {
    // insert new signer, db.query returns a promise
    return db.query(
        'INSERT INTO signers (signature, user_id) VALUES($1, $2) RETURNING id',
        [sig || null, userId || null]
    );
};

// FIX THIS TO SHOW NAMES (JOIN TABLES)!!!!! *****************************
module.exports.getSigners = function() {
    console.log('getting signers');
    return db.query(`
                    SELECT signers.user_id AS sig_id,
                            signers.signature as signature,
                            users.first AS user_first,
                            users.last AS user_last
                    FROM signers
                    JOIN users
                    ON users.id = signers.user_id
                    `);
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
        [age, city, url, userId || null]
    );
};
