const spicedPg = require('spiced-pg');

const db = spicedPg('postgres:postgres:postgres@localhost:5432/actors');
//syntax: postgres:username:password:@host:port:database
// put own postgres password for 'seedy' in secrets.josn if using it!!!
// or use 'postgres' or make new user

function changeCityName(id, name) {
    db.query('UPDATE cities SET city = $2 WHERE id = $1', [id, name])
        .then(({ rows }) => {
            console.log(rows);
        })
        .catch(err => {
            console.log(err);
        });
}

res.render('petition', {
    error: true
});

// {{#if error}}
// <div class="error">smth went wrong</div>
// {{error}}

// ************  INSTRUCTIONS *****************

// 1. create table
// 2. template
// 3. GET route petition
// 4. canvas thing
// 5. POST route petition
// 6. GET route thank you page
// 7. GET route signers page

// route to /petition, redirect from localhost to there
// check if "signature-cookie" exists/ redirect to Thank you

// create dbpetition, create table for signatures (id, first, last, signature)
// first VARCHAR(200) NOT NULL
// ....
// signature TEXT NOT NULL

// on signing INSERT
// db.query('', [first || null, last || null, signature || null])
// after INSERT into db, set cookie

// after signing, set cookie and redirect to 'thank you'-page
// check if "signature-cookie" exists/ redirect to petition
// show other signers' first name and last name on 'signers'-page (not sig!)

// signature:
// listen to mousedown, mousemove on canvas
// record (x, y) to draw
// canvas.toDataURL => string (on mouseup or on submit) to store signature in db
// set value of hidden form to string

// submit button:
// <form method="POST">
// <input name="first">
// <input last="last">
// <input sig="sig>"

// ****************** NOTES pt. 2 ******************

// session = {}
// In Express, the session is located on req.session
// req.session is globally available, so we can use it in multiple routes

// set session cookie in submit post route

app.get('/whatever', (req, res) => {
    req.session = {
        // sigId: should have ID of sig row
    };
});

// only use route if SigId is truthy
app.post('/create-user', (req, res) => {
    if (!req.session.sigId) {
        res.redirect('/homepage');
    }
});

// <img src="{{ signature }}" />

// INSERT INTO people (name) VALUES ('Sean') RETURNING id

db.query(q, params).then(results => {
    results.rows[0].id; // turn this into cookie-session id!!
});

// ************ NOTES VULNERABILITIES ***************
app.disable();

// ************** NOTES PT3 **************

// 1 new GET, 1 new POST route for register/login each
// 1 new template for for each

// new SQL table for users (key, first, last, email(unique), pass)

// post route for setting pwd
// hash password (+salt) and insert in table users
// error msg on registration error (email already used)

// after succesful reg, put userId in cookie
// redirect to /petition

// on login page compare req.password and session.userId
// find id through email address
// then check if user == signer already (get sigId by userId)
// redirect accordingly
// on login error show error msg

// middleware to check if UserId exists and only allow register/login routes

// ****************** pt4 ***************

// app.get('/signers/:city', (req, res) => {
//     console.log(req.params.city);
// });

// ****************** pt5 **************

// did user enter new pw
// yes: hash and update user info with hash
// no: update user info without pw
// need 2 queries to update user and user_profiles table

// on delete signature: delete sigId from session

// URL displaying user based on id: /user/:id
