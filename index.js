const express = require('express');
const app = express();
const hb = require('express-handlebars');
const cookieSession = require('cookie-session');
const database = require('./database');
const bcrypt = require('./bcrypt');
const csurf = require('csurf');
const helmet = require('helmet');

let secrets;

if (process.env.secret) {
    secrets = process.env;
} else {
    secrets = require('./secrets.json');
}

app.engine('handlebars', hb({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
app.use(express.static('public'));
app.use(
    require('body-parser').urlencoded({
        extended: false
    })
);
app.use(require('cookie-parser')());
app.use(
    cookieSession({
        secret: secrets.secret,
        maxAge: 1000 * 60 * 60 * 24 * 14
    })
);
app.use(csurf());
app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
});

// app.use(function(req, res, next) {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header(
//         'Access-Control-Allow-Origin',
//         'Origin, X-Requested-With, Content-Type, Accept'
//     );
//     next();
// });

app.use(helmet());
// app.use(
//     helmet.contentSecurityPolicy({
//         directives: {
//             defaultSrc: ["'self'", 'code.jquery.com'],
//             styleSrc: ["'self'", 'fonts.googleapis.com'],
//             fontSrc: ['fonts.googleapis.com', 'fonts.gstatic.com']
//         }
//     })
// );

// ************** MIDDLEWARE ***************************
function checkSessionUser(req, res, next) {
    // console.log('inside checkSessionUser', req.session);
    if (!req.session.user) {
        res.redirect('/registration');
    } else {
        next();
    }
}

function checkForSigId(req, res, next) {
    // console.log('inside checkForSigId', req.session);
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

app.get('/', (req, res) => {
    res.redirect('/login');
});

// ***************** ROUTES *******************************

app.get('/registration', (req, res) => {
    res.render('registration');
});

app.post('/registration', (req, res) => {
    let { first, last, email, password } = req.body;
    // if (password != '') {
    bcrypt.hashPass(password).then(function(hashedPass) {
        database
            .createNewUser(first, last, email, hashedPass)
            .then(response => {
                req.session.user = {
                    first: first,
                    last: last,
                    userId: response.rows[0].id
                };
                res.redirect('/profile');
            })
            .catch(err => {
                if (err.constraint == 'users_email_key') {
                    res.render('registration', {
                        duplicateMail: true
                    });
                } else {
                    res.render('registration', {
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
    res.render('login');
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
                                database
                                    .checkSig(req.session.user.userId)
                                    .then(response => {
                                        req.session.sigId = response.rows[0].id;
                                        res.redirect('/thanks');
                                    })
                                    .catch(() => {
                                        res.redirect('/petition');
                                    });
                            } else {
                                res.render('login', {
                                    wrongPass: true
                                });
                            }
                        });
                }
            });
            if (!match) {
                res.render('login', {
                    noUser: true
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.render('login', {
                error: true
            });
        });
});

app.get('/logout', (req, res) => {
    req.session = null;
    res.redirect('/login');
});

app.get('/profile', checkSessionUser, (req, res) => {
    res.render('profile', {
        first: req.session.user.first,
        last: req.session.user.last
    });
});

app.post('/profile', (req, res) => {
    let { age, city, url } = req.body;
    let userId = req.session.user.userId;
    database.createUserProfile(age, city, url, userId).then(() => {
        res.redirect('/petition');
    });
});

app.get('/profile/edit', checkSessionUser, (req, res) => {
    let userId = req.session.user.userId;
    let updated = req.query.updated;
    console.log('updated', updated);
    database.getProfileData(userId).then(response => {
        let {
            user_first,
            user_last,
            user_email,
            user_age,
            user_city,
            user_url
        } = response.rows[0];
        res.render('edit_profile', {
            user_first,
            user_last,
            user_email,
            user_age,
            user_city,
            user_url,
            first: req.session.user.first,
            last: req.session.user.last,
            updated
        });
    });
});

app.post('/profile/edit', (req, res) => {
    let { first, last, email, password, age, city, url } = req.body;
    let { userId } = req.session.user;
    const updateUser = () => {
        if (password == '') {
            return database.updateUserNoPW(first, last, email, userId);
        } else {
            bcrypt.hashPass(password).then(response => {
                let hashedPass = response;
                return database.updateUserWithPW(
                    first,
                    last,
                    email,
                    hashedPass,
                    userId
                );
            });
        }
    };
    Promise.all([
        updateUser(),
        database.updateUserProfile(age, city, url, userId)
    ])
        .then(() => {
            console.log('Profile updated!');
            let str = encodeURIComponent('yes');
            res.redirect('/profile/edit/?updated=' + str);
        })
        .catch(err => console.log('profile update error: ', err));
});

app.get('/petition', checkSessionUser, (req, res) => {
    if (!req.session.sigId) {
        res.render('petition', {
            first: req.session.user.first,
            last: req.session.user.last
        });
    } else {
        res.redirect('thanks');
    }
});

app.post('/petition', (req, res) => {
    let { signature } = req.body;
    let { userId } = req.session.user;
    database
        .createNewSig(signature, userId)
        .then(response => {
            console.log('response from createNewSig', response);
            req.session.sigId = response.rows[0].id;
            console.log('setting new sigId: ', req.session.sigId);
            res.redirect('/thanks');
        })
        .catch(err => {
            console.log(err);
            res.render('petition', {
                error: true
            });
        });
});

// Thank you page
app.get('/thanks', checkSessionUser, checkForSigId, (req, res) => {
    database
        .getSigners()
        .then(response => {
            let number = response.rows.length;
            let userSig;
            response.rows.forEach(elem => {
                // console.log('elem_id: ', elem.sig_id);
                // console.log('elem_sigId', elem.sig_id);
                // console.log('session_sigId: ', req.session.sigId);
                if (elem.sig_id == req.session.sigId) {
                    userSig = elem.signature;
                }
            });
            res.render('thanks', {
                number,
                userSig,
                first: req.session.user.first,
                last: req.session.user.last
            });
        })
        .catch(err => console.log(err));
});

app.post('/thanks', (req, res) => {
    console.log(
        'userId: ',
        req.session.user.userId,
        'sigId: ',
        req.session.sigId
    );
    database
        .deleteSig(req.session.sigId)
        .then(() => {
            req.session.sigId = null;
            res.redirect('/petition');
        })
        .catch(err => console.log('error on deleting sig: ', err));
});

// Supporters page
app.get('/signers', checkSessionUser, checkForSigId, (req, res) => {
    database.getSigners().then(response => {
        res.render('signers', {
            signers: response.rows,
            first: req.session.user.first,
            last: req.session.user.last
        });
    });
});

app.get('/signers/:userCity', checkSessionUser, (req, res) => {
    database.getSignersByCity(req.params.userCity).then(response => {
        res.render('signers_by_city', {
            city: req.params.userCity,
            signers: response.rows,
            first: req.session.user.first,
            last: req.session.user.last
        });
    });
});

app.listen(process.env.PORT || 8080, () => console.log('listening...'));
