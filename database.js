// db.query returns a promise

// setup spiced-postgres module
const spicedPg = require('spiced-pg');

const db = spicedPg('postgres:postgres:postgres@localhost:5432/petition');

// on signing INSERT
// db.query('', [first || null, last || null, signature || null])
// after INSERT into db, set cookie

module.exports.newSigner = function(first, last, signature) {
    // CHECK IF FIRSTNAME/LASTNAME ALREADY EXISTS FIRST?

    // insert new Signer
    return db.query(
        'INSERT INTO signers (first, last, signature) VALUES($1, $2, $3) RETURNING id',
        [first || null, last || null, signature || null]
    );
};

module.exports.getSigners = function() {
    console.log('getting signers');
    return db.query('SELECT * FROM signers');
};
