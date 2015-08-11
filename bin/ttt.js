#!/usr/bin/env node

'use strict';

// module dependencies
var
	fs = require('fs'),
	path = require('path'),
	child_process = require('child_process'),
	async = require('async'),
	mkdirp = require('mkdirp'),
	moment = require('moment'),
	commander = require('commander'),
	Tasks = require('../').Tasks,
	Report = require('../').Report,
	timerange = require('../').timerange;

// TODO - move outside
var config = {
	folder: path.join(process.env.HOME, '.config', 'ttt'),
	file  : 'ttt.log',
	editor: process.env.EDITOR || 'vi'
};
config.filename = path.join(config.folder, config.file);

// prepare config dir if file does not exist
var prep = function (dir, file) {
	return function(cb) {
		fs.stat(path.join(dir, file), function(err){
			if (err) {
				mkdirp(dir, cb);
				return;
			}
			cb();
		});
	};
};

// open the editor
var spawnEditor = function(cmd, filename, cb) {
	var child = child_process.spawn(cmd, [filename], {
		stdio: 'inherit'
	});

	child.on('exit', function (e, code) {
		cb && cb(code);
	});
};

// main function
var main = {

	// the commands to perform
	_cmd  : [],
	// the tasks to process
	_tasks: new Tasks({ console: true }),
	// command line arguments
	_args : process.argv.slice(2),
	// compare command
	_isCmd: function(cmd) {
		return ~this._cmd.indexOf(cmd);
	},

	// process command line args
	cmd: function() {
		var self = this;
		return function(cb) {
			commander
				.option('-s, --sort',  'sort the time track log')
				.option('-e, --edit',  'edit the time track log')
				.option('-d, --day',   'report dayly stats')
				.option('-w, --week',  'report weekly stats')
				.option('-m, --month', 'report monthly stats')
				.option('-p, --project [prj]', 'report projects only')
				.option('-f, --from <val>', 'report from "val"')
				.option('-t, --to <val>', 'report until "val"')
				.option('-l, --last [n]', 'show last n lines')
				.parse(process.argv);

			if (commander.sort) {
				self._cmd = ['read', 'sort', 'write'];
			}
			else if (commander.edit) {
				self._cmd = [];
				spawnEditor(config.editor, config.filename);
			}
			else if (
				commander.day ||
				commander.week ||
				commander.month ||
				commander.project ||
				commander.from ||
				commander.to
			) {
				self._commander = commander;
				self._cmd = ['read', 'report'];
			}
			else if (commander.last) {
				self._commander = commander;
				self._cmd = ['read', 'last'];
			}
			else if (self._args.length > 0) {
				self._cmd = ['append'];
			}
			else {
				self._cmd = ['read', 'report'];
			}
			cb();
		};
	},

	// read tasks from file
	read: function() {
		var self = this;
		return function(cb) {
			if (self._isCmd('read')) {
				self._tasks.read(config.filename, cb);
			} else {
				cb();
			}
		};
	},

	// write them back
	write: function() {
		var self = this;
		return function(cb) {
			if (self._isCmd('write')) {
				// TODO - write to a different file first and then move back
				self._tasks.write(config.filename, cb);
			} else {
				cb();
			}
		};
	},

	// append a line to the track log
	append: function() {
		var self = this;
		return function(cb) {
			if (self._isCmd('append')) {
				self._tasks.append(config.filename, self._args, cb);
			} else {
				cb();
			}
		};
	},

	// sort the track log
	sort: function() {
		var self = this;
		return function(cb) {
			if (self._isCmd('sort')) {
				self._tasks.sort();
			}
			cb();
		};
	},

	// give back some stats
	report: function() {
		var self = this;
		return function(cb) {
			var
				type,
				tmp,
				from, to,
				report = new Report(self._tasks),
				c = self._commander;

			if (self._isCmd('report')) {

				if (c) {
					tmp  = timerange(c.from, c.to);
					from = tmp.from;
					to   = tmp.to;

					if (c.week)  type='week';
					if (c.month) type='month';
					if (c.project) {
						if (c.project === true) {
							c.project = undefined;
						}
						console.log(report.toCSV(report.prjTime(type, from, to, c.project)));
					}
					else {
						console.log(report.toCSV(report.time(type, from, to)));
					}
				}
				else {
					console.log(report.toCSV(report.time('week')));
					console.log(report.toCSV(report.time()));
				}
			}
			cb();
		};
	},

	last: function() {
		var self = this;
		return function(cb) {
			if (self._isCmd('last')) {
				var num = self._commander.last;
				if (num === true) num = 10;
				self._tasks.slice(num);
				console.log(self._tasks.toString());
			}
		}
	}

};

async.series([
	prep(config.folder, config.file),
	main.cmd(),
	main.append(),
	main.read(),
	main.sort(),
	main.write(),
	main.report(),
	main.last()
], function(err){
	if (err) {
		console.error('\nError:', err.message || err);
		if (err.data) {
			if (Array.isArray(err.data)){
				console.error('    ' + err.data.join('\n    '));
			}
			else {
				console.error(err.data);
			}
		}
		console.error();
	}
});
