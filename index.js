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
// function to check for session cookie
function checkForSigId(req, res, next) {
    console.log('inside checkForSigId', req.session);
    if (!req.session.sigId) {
        res.redirect('/');
    } else {
        next();
    }
}

function checkSessionUser(req, res, next) {
    console.log('inside checkSessionUser', req.session);
    if (req.session.user) {
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

app.post('/registration', checkSessionUser, (req, res) => {
    let { first, last, email, password } = req.body;
    console.log('req: ', first, last, email, password);
    bcrypt.hashPass(password).then(function(hashedPass) {
        console.log('promise from hashPass resolved: ', hashedPass);
        database
            .newUser(first, last, email, hashedPass)
            .then((response, first, last) => {
                console.log(response.rows[0].id);
                req.session.user = {
                    first: first,
                    last: last,
                    userId: response.rows[0].id
                };
                res.redirect('/petition');
            })
            .catch(err => {
                console.log(err.constraint);
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
});

app.get('/login', checkSessionUser, (req, res) => {
    res.render('login', {
        layout: 'main'
    });
});

app.post('/login', (req, res) => {
    let { email, password } = req.body;
    bcrypt.hashPass(password).then(hashedPass => {
        database.getUsers().then(response => {
            console.log('getUsers: ', response.rows);
            response.rows.forEach(user => {
                if (email == user.email && hashedPass == user.password) {
                    console.log('logging in');
                }
            });
        });
    });
});

app.get('/petition', (req, res) => {
    res.render('petition', {
        layout: 'main'
    });
});

app.post('/petition', (req, res) => {
    let { first, last, signature } = req.body;
    console.log('first: ', first, ' last: ', last, 'signature: ', signature);
    // CALL FUNCTION TO INSERT SIGNER INTO DB HERE
    database
        .newSigner(first, last, signature)
        .then(({ rows }) => {
            console.log('response: ', rows[0].id);
            req.session.sigId = rows[0].id;
            res.redirect('/thanks');
        })
        .catch(() => {
            res.render('petition', {
                layout: 'main',
                error: true
            });
        });
});

// Thank you page
app.get('/thanks', checkForSigId, (req, res) => {
    database.getSigners().then(function(response) {
        let number = response.rows.length;
        let userSig;
        response.rows.forEach(function(item) {
            console.log('signature: ', item.signature);
            console.log('sigId: ', req.session.sigId);
            if (item.id == req.session.sigId) {
                userSig = item.signature;
            }
        });
        res.render('thanks', {
            layout: 'main',
            number,
            userSig
        });
    });
});

// Supporters page
app.get('/signers', checkForSigId, (req, res) => {
    database.getSigners().then(function(response) {
        res.render('signers', {
            layout: 'main',
            signers: response.rows
        });
    });
});

app.listen(8080, () => console.log('listening...'));
