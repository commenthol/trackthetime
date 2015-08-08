'use strict';

var
	fs = require('fs');

/**
 * async file handler
 */
var M = {

	read: function(filename, cb) {
		fs.readFile(filename, 'utf8', cb);
	},

	write: function(filename, data, cb) {
		fs.writeFile(filename, data, 'utf8', cb);
	},

	append: function(filename, data, cb) {
		fs.appendFile(filename, data, 'utf8', cb);
	},
};

module.exports = M;