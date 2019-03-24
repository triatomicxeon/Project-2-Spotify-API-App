/**
 * Here is a list of reasons I think Node.js is silly:
 *
 * 1. It is.
 *
 * @type {createApplication}
 */

//Module Requirements----------------------------------------------------
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');

var app = express();

// set the port of our application
// process.env.PORT lets the port be set by Heroku
var port = process.env.PORT || 6660;

//MIDDLEWARE-------------------------------------------------------------
// set the view engine to ejs
app.set('view engine', 'ejs');

// Body-parser:
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// Set Static Path
app.use(express.static(path.join(__dirname, 'public')));

//ROUTES-----------------------------------------------------------------
app.get('/', function(req, res){
    // ejs render automatically looks in the views folder
    res.render('index');

    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:' + port);
});

//LOCAL
app.listen(port, function(){
    console.log('Our app is running on http://localhost:' + port);
})
