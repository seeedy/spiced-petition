// setup express
const express = require('express');
const app = express();
// const secrets = require('./secrets');

// setup express.handlebars
const hb = require('express-handlebars');
app.engine('handlebars', hb());
app.set('view engine', 'handlebars');

// set up middleware (.use)
app.use(express.static('public'));
app.use(
    require('body-parser').urlencoded({
        extended: false
    })
);

app.use(require('cookie-parser')());

const cookieSession = require('cookie-session');
app.use(
    cookieSession({
        secret: 'stupid secret',
        maxAge: 1000 * 60 * 60 * 24 * 14
    })
);

const csurf = require('csurf');
app.use(csurf());
app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
});

// module for db queries
const database = require('./database');
// encryption module
const bcrypt = require('./bcrypt');

// ************** MIDDLEWARE ***************************
function checkSessionUser(req, res, next) {
    console.log('inside checkSessionUser', req.session);
    if (!req.session.user) {
        console.log(req.session.user);
        res.redirect('/registration');
    } else {
        next();
    }
}

function checkForSigId(req, res, next) {
    console.log('inside checkForSigId', req.session);
    if (!req.session.sigId) {
        res.redirect('/petition');
    } else {
        next();
    }
}

// log all requests that are received ***DELETE LATER***
app.use(function logUrl(req, res, next) {
    console.log(req.url);
    next();
});

// redirect to petition start page ***CHANGE LATER***
app.get('/', (req, res) => {
    res.redirect('/petition');
});

// ***************** ROUTES *******************************

app.get('/registration', (req, res) => {
    res.render('registration', {
        layout: 'main'
    });
});

app.post('/registration', (req, res) => {
    let { first, last, email, password } = req.body;
    console.log('pw: ', password);
    // if (password != '') {
    bcrypt.hashPass(password).then(function(hashedPass) {
        console.log('hashed: ', hashedPass);
        database
            .newUser(first, last, email, hashedPass)
            .then(response => {
                req.session.user = {
                    first: first,
                    last: last,
                    userId: response.rows[0].id
                };
                res.redirect('/petition');
            })
            .catch(err => {
                if (err.constraint == 'users_email_key') {
                    res.render('registration', {
                        layout: 'main',
                        duplicateMail: true
                    });
                } else {
                    res.render('registration', {
                        layout: 'main',
                        error: true
                    });
                }
            });
    });
    // } else {
    //     res.render('registration', {
    //         layout: 'main',
    //         error: true
    //     });
    // }
});

app.get('/login', (req, res) => {
    res.render('login', {
        layout: 'main'
    });
});

app.post('/login', (req, res) => {
    let { email, password } = req.body;
    database
        .getUsers()
        .then(response => {
            let match = 0;
            response.rows.forEach(user => {
                if (email == user.email) {
                    match = 1;
                    bcrypt
                        .checkPass(password, user.password)
                        .then(doesMatch => {
                            if (doesMatch) {
                                req.session.user = {
                                    first: user.first,
                                    last: user.last,
                                    userId: user.id
                                };
                                console.log(req.session);
                                res.redirect('/petition');
                            } else {
                                res.render('login', {
                                    layout: 'main',
                                    wrongPass: true
                                });
                            }
                        });
                }
            });
            if (!match) {
                res.render('login', {
                    layout: 'main',
                    noUser: true
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.render('login', {
                layout: 'main',
                error: true
            });
        });
});

app.get('/logout', function(req, res) {
    req.session = null;
    res.redirect('/login');
});

app.get('/petition', checkSessionUser, (req, res) => {
    res.render('petition', {
        layout: 'main',
        first: req.session.user.first,
        last: req.session.user.last
    });
});

app.post('/petition', (req, res) => {
    let { signature } = req.body;
    let { first, last, userId } = req.session.user;
    console.log('first: ', first, ' last: ', last, 'userId: ', userId);
    // CALL FUNCTION TO INSERT SIGNER INTO DB HERE
    database
        .newSigner(first, last, signature, userId)
        .then(response => {
            // console.log('response: ', response);
            req.session.sigId = response.rows[0].id;
            res.redirect('/thanks');
        })
        .catch(err => {
            console.log(err);
            res.render('petition', {
                layout: 'main',
                error: true
            });
        });
});

// Thank you page
app.get('/thanks', checkSessionUser, checkForSigId, (req, res) => {
    database.getSigners().then(function(response) {
        let number = response.rows.length;
        let userSig;
        response.rows.forEach(function(item) {
            // console.log('signature: ', item.signature);
            // console.log('sigId: ', req.session.sigId);
            if (item.id == req.session.sigId) {
                userSig = item.signature;
            }
        });
        res.render('thanks', {
            layout: 'main',
            number,
            userSig,
            first: req.session.user.first,
            last: req.session.user.last
        });
    });
});

// Supporters page
app.get('/signers', checkSessionUser, checkForSigId, (req, res) => {
    database.getSigners().then(function(response) {
        res.render('signers', {
            layout: 'main',
            signers: response.rows,
            first: req.session.user.first,
            last: req.session.user.last
        });
    });
});

app.listen(8080, () => console.log('listening...'));
