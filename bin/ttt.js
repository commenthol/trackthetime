#!/usr/bin/env node

'use strict'

// module dependencies
var child_process = require('child_process')
var async = require('async')
var commander = require('commander')
var Tasks = require('../').Tasks
var Report = require('../').Report
var timerange = require('../').timerange
var file = require('../lib/file')
var config = require('../lib/config')

// open the editor
var spawnEditor = function (cmd, filename, cb) {
	var child = child_process.spawn(cmd, [filename], {
		stdio: 'inherit'
	})
	child
	.on('error', function (err) {
		if (!cb) {
			console.error(err)
		}
		cb && cb(err)
	})
	.on('exit', function (err, code) {
		if (!cb && err) {
			console.error(err)
		}
		cb && cb(code)
	})
}

// main function
var main = {

	// the commands to perform
	_cmd  : [],
	// the tasks to process
	_tasks: null,
	// command line arguments
	_args : process.argv.slice(2),
	// compare command
	_isCmd: function (cmd) {
		return ~this._cmd.indexOf(cmd)
	},
	// read data
	_data: null,

	// process command line args
	cmd: function () {
		var self = this
		return function (cb) {
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
				.option('    --config', 'open config in editor')
				.parse(process.argv)

			if (commander.sort) {
				self._cmd = ['read', 'sort', 'write']
			}
			else if (commander.edit) {
				self._cmd = []
				spawnEditor(config.config.editor, config.filename)
			}
			else if (commander.config) {
				self._cmd = []
				spawnEditor(config.config.editor, config.configfilename)
			}
			else if (
				commander.day ||
				commander.week ||
				commander.month ||
				commander.project ||
				commander.from ||
				commander.to
			) {
				self._commander = commander
				self._cmd = ['read', 'report']
			}
			else if (commander.last) {
				self._commander = commander
				self._cmd = ['read', 'last']
			}
			else if (self._args.length > 0) {
				self._cmd = ['read', 'append']
			}
			else {
				self._cmd = ['read', 'report']
			}
			cb()
		}
	},

	init: function () {
		return function (cb) {
			this._tasks = new Tasks({ console: true, daily: config.config.daily * 3600})
			cb()
		}.bind(this)
	},

	// read tasks from file
	read: function () {
		var self = this
		return function (cb) {
			if (self._isCmd('read')) {
				file.read(config.filename, function (err, data) {
					if (!err) {
						self._data = data
						err = self._tasks.split(data)
					}
					cb(err)
				})
			} else {
				cb()
			}
		}
	},

	// write them back
	write: function () {
		var self = this
		return function (cb) {
			if (self._isCmd('write')) {
				file.write(config.filename, self._tasks.sort().toString(), cb)
			} else {
				cb()
			}
		}
	},

	// write a backup file
	writebackup: function () {
		var self = this
		return function (cb) {
			if (self._isCmd('write')) {
				file.write(config.filename + '.bak', self._data, cb)
			} else {
				cb()
			}
		}
	},

	// append a line to the track log
	append: function () {
		var self = this
		return function (cb) {
			if (self._isCmd('append')) {
				var obj = self._tasks.append(self._args)
				if (obj.err) {
					self._cmd.push('write')
				}
				file.append(config.filename, obj.str, cb)
			} else {
				cb()
			}
		}
	},

	// sort the track log
	sort: function () {
		var self = this
		return function (cb) {
			if (self._isCmd('sort')) {
				self._tasks.sort()
			}
			cb()
		}
	},

	// give back some stats
	report: function () {
		var self = this
		return function (cb) {
			var
				type,
				mmt,
				tmp,
				from, to,
				report = new Report(self._tasks),
				c = self._commander

			if (self._isCmd('report')) {
				if (c) {
					tmp  = timerange(c.from, c.to)
					from = tmp.from
					to   = tmp.to

					if (c.week)  type='week'
					if (c.month) type='month'
					if (c.project) {
						if (c.project === true) {
							c.project = undefined
						}
						console.log(report.toCSV(report.prjTime(type, from, to, c.project)))
					}
					else {
						console.log(report.toCSV(report.time(type, from, to)))
					}
				}
				else {
					mmt = report.todayTimeLeft(config.config)
					console.log(report.toCSV(report.time('week')))
					console.log(report.toCSV(report.time()))
					if (mmt) {
						console.log(mmt.format('HH:mm') + ' is ttl')
					}
				}
			}
			cb()
		}
	},

	last: function () {
		var self = this
		return function (cb) {
			if (self._isCmd('last')) {
				var num = self._commander.last
				if (num === true) {
					num = 10
				}
				self._tasks.slice(num)
				console.log(self._tasks.toString())
			}
			cb && cb()
		}
	}
}

async.series([
	config.prep(),
	config.writeDefault(),
	config.load(),
	main.init(),
	main.cmd(),
	main.read(),
	main.sort(),
	main.append(),
	main.writebackup(),
	main.write(),
	main.report(),
	main.last()
], function (err){
	if (err) {
		console.error('\nError:', err.message || err)
		if (err.data) {
			if (Array.isArray(err.data)){
				console.error('    ' + err.data.join('\n    '))
			}
			else {
				console.error(err.data)
			}
		}
		console.error()
	}
})
