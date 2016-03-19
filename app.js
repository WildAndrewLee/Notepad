var express = require('express');
var Flake = require('flake-idgen');
var handlebars = require('express-handlebars');
var int_format = require('biguint-format');
var multer = require('multer');
var levelup = require('levelup');

const PORT = 4646;
const SNOWFLAKE = new Flake();
const MULT = multer();

/*
 * Setup DB
 */

var db = levelup(__dirname + '/notepad_db')

/*
 * Setup Express
 */

var app = express();

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

app.post('/share', MULT.array(), (req, resp) => {
    var code_submission = req.body.code;
    var snowflake_id = int_format(SNOWFLAKE.next(), 'dec');

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
                resp.redirect('/' + snowflake_id);
            }
            else{
                resp.json({
                    snowflake: snowflake_id,
                });
            }
        }
    });
});

app.get(/.+/, (req, resp) => {
    var snowflake_id = req.originalUrl.substring(1);

    db.get(snowflake_id, (err, val) => {
        if(err){
            resp.status(404).end();
        }
        else{
            resp.render('code', {
                snowflake: snowflake_id,
                code: val
            });
        }
    });
});

/*
 * Run Express
 */

app.listen(PORT);
