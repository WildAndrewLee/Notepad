var crypto = require('crypto');
var express = require('express');
var Flake = require('flake-idgen');
var handlebars = require('express-handlebars');
var levelup = require('levelup');
var multer = require('multer');
var rate_limit = require('express-rate-limit');

const PORT = 4646;
const SNOWFLAKE = new Flake();
const MULT = multer();

/*
 * Setup DB
 */

var db = levelup(__dirname + '/notepad_db')

/*
 * Setup rate limiter
 */
var limiter = rate_limit({
    delayAfter: 0,
    delayMs: 0,
    max: 15, // 15 requests per minute
    windowMs: 60000 // 1 minute
});

/*
 * Setup Express
 */

var app = express();

app.enable('trust proxy');
app.use(express.static(__dirname + '/static'));
app.engine('html', handlebars());
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

/*
 * Routes
 */

app.get('/', (req, resp) => {
    resp.render('index');
});

app.get('/about', (req, resp) => {
    resp.render('about');
});

app.get('/api', (req, resp) => {
    resp.render('api');
});

app.post('/share', limiter, MULT.array(), (req, resp) => {
    var code_submission = req.body.code;
    var snowflake_id = SNOWFLAKE.next();
    snowflake_id = crypto.createHash('md5').update(snowflake_id).digest('hex');

    // 8 character should be long enough since this is a
    // fairly low use application.
    snowflake_id = snowflake_id.substring(0, 8);

    db.put(snowflake_id, code_submission, (err) => {
        if(err){
            console.log(err);

            resp.status(500).json({
                error: 'Oops. Something went wrong. Please try again later.'
            });
        }
        else{
            // The name field being set means
            // that code was submitted by normal
            // HTTP request--neither XHR nor cURL.
            if(req.body.name){
                resp.redirect('/' + snowflake_id + '/');
            }
            else{
                resp.json({
                    snowflake: snowflake_id,
                });
            }
        }
    });
});

app.get('/:snowflake/:lang?', (req, resp) => {
    var snowflake_id = req.params.snowflake;
    var lang = req.params.lang;

    db.get(snowflake_id, (err, val) => {
        if(err){
            resp.status(404).send('Error: Page not found.');
        }
        else{
            resp.render('code', {
                snowflake: snowflake_id,
                code: val,
                lang: lang || ''
            });
        }
    });
});

/*
 * Run Express
 */

app.listen(PORT);
