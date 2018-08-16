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
