// Invoke 'strict' JavaScript mode
'use strict';

// Load the Mongoose module and Schema object
var mongoose = require('mongoose'),
	crypto = require('crypto'),
	Schema = mongoose.Schema;

// Define a new 'UserSchema'
var UserSchema = new Schema({
	firstName: String,
	lastName: String,
	email: {
		type: String,
		// Validate the email format
		match: [/.+\@.+\..+/, 'Please fill a valid email address']
	},
	username: {
		type: String,
		// Trim the 'username' field
		trim: true,
		// Set a unique 'username' index
		unique: true,
		// Validate 'username' value existance
		required: 'Username is required'
	},
	password: {
		type: String,
		// Validate the 'password' value length
		validate: [
			function(password) {
				return password.length >= 6;
			},
			'Password Should Be Longer'
		]
	},
	salt: {
		type: String
	},
	provider: {
		type: String,
		required: 'Provider is required'
	},
	providerId: String,
	providerData: {},
	created: {
		type: Date,
		// Create a default 'created' value
		default: Date.now
	}
});

// Set the 'fullname' virtual property
UserSchema.virtual('fullName').get(function() {
	return this.firstName + ' ' + this.lastName;
}).set(function(fullName) {
	var splitName = fullName.split(' ');
	this.firstName = splitName[0] || '';
	this.lastName = splitName[1] || '';
});

UserSchema.pre('save', function(next){
	if(this.password){
		this.salt = new Buffer(crypto.randomBytes(16)
			.toString('base64'), 'base64');
		this.password = this.hashPassword(this.password);
	}

	next();
});


UserSchema.methods.hashPassword = function(password){
	return crypto.pbkdf2Sync(password, this.salt, 10000, 64)
		.toString('base64');
};


UserSchema.methods.authenticate = function(password){

	return this.password === this.hashPassword(password);

};


UserSchema.statics.findUniqueUsername = function(username, suffix, callback){

	var _this = this;
	var possibleUsername = username + (suffix || ' ');

	_this.findOne({username: possibleUsername}, 
		function(err, user){
			if(!err){
				if(!user){
					callback(possibleUsername);
				}
				else {
					return _this.findUniqueUsername(username, (suffix || 0) + 1, callback);
				}
			} else {
				callback(null);
			}
		});
};


// Create the 'findOneByUsername' static method
UserSchema.statics.findOneByUsername = function(username, callback) {
	// Use the 'findOne' method to retrieve a user document
	this.findOne({
		username: new RegExp(username, 'i')
	}, callback);
};

\

// Configure the 'UserSchema' to use getters and virtuals when transforming to JSON
UserSchema.set('toJSON', {
	getters: true,
	virtuals: true
});

// Create the 'User' model out of the 'UserSchema'
mongoose.model('User', UserSchema);