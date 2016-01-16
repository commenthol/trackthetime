'use strict'

var fs = require('fs')
var path = require('path')
var mkdirp = require('mkdirp')
var _ = require('lodash')

var config = {
	filename: process.env.TRACKTHETIMELOG || path.join(process.env.HOME, '.config', 'ttt', 'ttt.log'),

	editor: process.env.EDITOR || 'vi',

	defaults: {
		daily: 8,
		weekly: 40
	},

	/**
	 * prepare config dir if file does not exist
	 * use with `async.series`
	 * @param {String} filename
	 * @return {Function} callback
	 */
	prep: function () {
		var self = this
		var dir = path.dirname(self.filename)
		return function(cb) {
			fs.stat(dir, function(err){
				if (err) {
					mkdirp(dir, cb)
					return
				}
				cb()
			})
		}
	},

	writeDefault: function () {
		var self = this
		return function(cb) {
			fs.stat(self.configfilename, function(err){
				if (err) {
					fs.writeFile(self.configfilename,
						JSON.stringify(self.defaults, null, 2),
						'utf8',
						cb
					)
					return
				}
				cb()
			})
		}
	},

	load: function () {
		var self = this
		return function(cb) {
			fs.readFile(self.configfilename, 'utf8', function(err, data) {
				try {
					if(!err && data) {
						data = JSON.parse(data)
						config.config = _.assign({ editor: config.editor }, config.defaults, data)
					}
				} catch(e) {
					err = e
					data = null
				}
				cb(err)
			})
		}
	}
}

config.configfilename = path.join(path.dirname(config.filename), 'ttt.json'),
config.config = _.assign({ editor: config.editor }, config.defaults)

module.exports = config
