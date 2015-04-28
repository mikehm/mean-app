// Invoke 'strict' JavaScript mode
'use strict';

// Set the 'NODE_ENV' variable
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Load the module dependencies
var mongoose = require('./config/mongoose'),
	express = require('./config/express');
	passport = require('./config/passport');

// Create a new Mongoose connection instance
var db = mongoose();

var app = express();
var passport = passport();
app.listen(3000);

module.exports = app;
console.log("Server listening at port 3000");