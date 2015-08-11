'use strict';

var
	_ = require('lodash'),
	file = require('./file'),
	parse = require('./parse');

/**
 * @constructor
 * @param {Object} [opts] - options
 * @param {String|Array} opts.tasks - Task list; if {Array} then elements need to be instanceof {Task}
 */
function Tasks(opts) {

	if (! this instanceof Tasks) {
		return new Tasks(opts);
	}

	opts = opts || {};
	if (typeof opts.tasks === 'string') {
		this.split(opts.tasks);
	}

	this._opts = _.pick(opts, ['console']) || {};
	this.tasks = this.tasks || opts.tasks || [];
}

module.exports = Tasks;

Tasks.prototype = {

	/**
	 * read tasks from file
	 * @param {String} filename
	 * @param {Function} cb - callback `function(err)`
	 */
	read: function(filename, cb) {
		var self = this;
		file.read(filename, function(err, str){
			if (err || !str) {
				cb && cb(err || new Error('no data'));
				return;
			}
			var errors = self.split(str);
			if (errors) {
				err = new Error('parse errors');
				err.data = errors;
				cb && cb(err);
				return;
			}
			cb && cb();
		});
	},

	/**
	 * write tasks to file
	 * @param {String} filename
	 * @param {Function} cb - callback `function(err)`
	 */
	write: function(filename, cb) {
		file.write(filename, this.toString(), cb);
	},

	/**
	 * append single task to `filename`
	 * @param {String} filename - {Path}
	 * @param {Object|Array} task - {Task}
	 * @param {Function} cb - callback `function(err)`
	 */
	append: function(filename, task, cb) {
		if (Array.isArray(task)) {
			task = parse.newLine(task);
		}
		if (task) {
			var tsk = task.toString();
			if (this._opts.console) {
				console.log(tsk);
			}
			file.append(filename, tsk + '\n', cb);
		}
		else {
			cb(new Error('no task'));
		}
	},

	/**
	 * split string into tasks
	 * @param {String} str - data to split into pieces
	 */
	split: function(str) {
		var self = this,
			i,
			line,
			errors = [],
			tsk,
			lines = str.split(/[\n\r]/);

		self.tasks = [];

		for (i=0; i<lines.length; i++) {
			line = lines[i];
			tsk = parse.line(line);
			if (tsk) {
				if (tsk.isValid) {
					self.tasks.push(tsk);
				}
				else if (!tsk.isComment) {
					errors.push('line '+(i+1)+': ' + (line||'').replace(/\t/g, ' '));
				}
			}
		}

		self.sort();

		if (errors.length > 0) {
			return errors;
		}
	},

	/**
	 * sort tasks by date/ time
	 */
	sort: function() {

		function sorter(a, b) {
			return (a.utc < b.utc) ? -1 : ( a.utc == b.utc ? 0 : 1);
		}

		this.tasks = this.tasks.sort(sorter);
		return this.tasks;
	},

	/**
	 * slice tasks list to `num` entries from end.
	 * @param {Number} num
	 */
	slice: function(num) {
		num = (isNaN(num) ? 10 : num);
		var end = this.tasks.length-1,
			beg = ((end-num) < 0 ? 0 : end-num);

		this.tasks = this.tasks.slice(beg, end);
	},

	/**
	 * convert task list to human readable format
	 * @return {String}
	 */
	toString: function() {
		var
			_week = 0,
			arr = [];

		// add calender week as seperator
		function week(tsk) {
			_week = tsk.week;
			return '# CW ' + _week + '\n';
		}

		arr.push(week(this.tasks[0]));

		this.tasks.forEach(function(tsk){

			if (tsk.week !== _week) {
				arr.push(week(tsk));
			}

			arr.push(tsk.toString());
		});

		return arr.join('\n') + '\n';
	},

};