// setup express
const express = require('express');
const app = express();

// setup express.handlebars
const hb = require('express-handlebars');
app.engine('handlebars', hb());
app.set('view engine', 'handlebars');
// set middleware express.static to serve .css from directory
app.use(express.static(__dirname + '/static'));
app.use(
    require('body-parser').urlencoded({
        extended: false
    })
);
app.use(require('cookie-parser')());

const database = require('./database');

// ***************** ROUTES *******************************

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
    // CALL FUNCTION TO INSERT SIGNER INTO DB HERE
    database.newSigner(first, last, signature);
    res.render('thanks');
});

app.listen(8080, () => console.log('listening...'));
