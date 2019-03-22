//Module Requirements----------------------------------------------------
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');

var app = express();

//MIDDLEWARE-------------------------------------------------------------
// Body-parser:
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// Set Static Path
app.use(express.static(path.join(__dirname, 'public')));

//ROUTES-----------------------------------------------------------------
app.get('/', function(req, res){
    res.send('Test');
});

/*
app.listen(6660, function(){
    console.log('Server started on port 6660...')
})
*/