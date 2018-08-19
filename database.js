// setup spiced-postgres module
const spicedPg = require('spiced-pg');

const db = spicedPg('postgres:postgres:postgres@localhost:5432/petition');

module.exports.newSigner = function(first, last, sig) {
    // insert new signer, db.query returns a promise
    return db.query(
        'INSERT INTO signers (first, last, signature) VALUES($1, $2, $3) RETURNING id',
        [first || null, last || null, sig]
    );
};

module.exports.getSigners = function() {
    console.log('getting signers');
    return db.query('SELECT * FROM signers');
};

module.exports.newUser = function(first, last, email, pw) {
    return db.query(
        'INSERT INTO users (first, last, email, password) VALUES($1, $2, $3, $4) RETURNING id, first, last',
        [first || null, last || null, email || null, pw || null]
    );
};

module.exports.getUsers = function() {
    return db.query('SELECT * FROM users');
};
