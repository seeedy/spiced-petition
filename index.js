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

// get module for db queries
const database = require('./database');

// ***************** ROUTES *******************************

// middleware to check for session cookie
function checkForSigId(req, res, next) {
    console.log('inside checkForSigId', req.session);
    console.log(req.session);
    if (!req.session.sigId) {
        res.redirect('/');
    } else {
        next();
    }
}
// middleware to log all requests that are received
app.use(function logUrl(req, res, next) {
    console.log(req.url);
    next();
});

// middleware to redirect to petition start page
app.get('/', (req, res) => {
    res.redirect('/petition');
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
    if (first && last && signature) {
        database
            .newSigner(first, last, signature)
            .then(({ rows }) => {
                console.log('response: ', rows[0].id);
                req.session.sigId = rows[0].id;
                res.redirect('/thanks');
            })
            .catch(err => {
                console.log(err);
            });
    } else {
        res.render('petition', {
            layout: 'main',
            error: true
        });
    }
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
