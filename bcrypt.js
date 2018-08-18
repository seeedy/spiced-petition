const bcrypt = require('bcryptjs');
const { promisify } = require('util');

const genSalt = promisify(bcrypt.genSalt);
const hash = promisify(bcrypt.hash);
const compare = promisify(bcrypt.compare);

module.exports.hashPass = function(pass) {
    return genSalt().then(salt => {
        return hash(pass, salt);
    });
};

module.exports.checkPass = function(hash, pass) {
    return compare(pass, hash).then(doesMatch => console.log(doesMatch));
};
