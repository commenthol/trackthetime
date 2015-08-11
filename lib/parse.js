'use strict';

var
	Task = require('./task');

var M = {

	/**
	 * parse a track log line into its components
	 * @param {String} str - e.g. '2015-08-04 12:23 prj description'
	 * @return {Object} - parsed object
	 */
	line: function(str) {
		var opts;
		var line = str.split(/\s+/);

		if (line) {
			// ignore comments
			if (/^#|^\s*$/.test(line)) {
				return { isComment: true };
			}
			else if (line.length >= 3) {
				opts = {
					date       : line.shift(),
					time       : line.shift(),
					project    : line.shift(),
					description: line.join(' '),
				};

				return new Task(opts);
			}
		}
		return { isValid: false };
	},

	/**
	 * compose a new track log line from command line arguments
	 * @param {Array} arr - cli arguments
	 * @return {Object} composed object
	 */
	newLine: function(arr) {
		var i=0,
			task,
			opts = { now: true };

		for (i=0; i<=3; i++) {
			if (/^\d{2,4}-\d{1,2}-\d{1,2}$/.test(arr[0])) {
				opts.date = arr[0];
				arr.shift();
			}
			else if (/^\d{1,2}-\d{1,2}$/.test(arr[0])) {
				var d = new Date();
				opts.date = d.getFullYear() + '-' + arr[0];
				arr.shift();
			}
			else if (/^\d{1,2}:\d{1,2}$/.test(arr[0])) {
				opts.time = arr[0];
				arr.shift();
			}
			else {
				opts.project = arr[0];
				arr.shift();
				opts.description = arr.join(' ');
				break;
			}
		}

		if (!opts.project) return;

		task = new Task(opts);
		if (task.isValid) {
			return task;
		}
	},

};

module.exports = M;

