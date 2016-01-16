'use strict'

var moment = require('moment')

/**
 * constants
 */
var DATE     = require('./consts').DATE
var TIME     = require('./consts').TIME
var DATE_REX = require('./consts').DATE_REX
var TIME_REX = require('./consts').TIME_REX

/**
 * Handle a task
 * @constructor
 */
function Task (options) {
	if (! (this instanceof Task)) {
		return new Task(options)
	}

	options = options || {}

	if (options.now) {
		this.now()
	}
	if (options.date || options.time) {
		this.isValid = this.update(options.date, options.time)
	}
	this.duration = options.duration
	this.addProject(options.project, options.description)

	Object.defineProperty(this, 'month', {
		get: function () {
			var month = this.date.match(/^(\d{4}-\d{2}).*$/)
			if (month && month.length > 1) {
				return month[1]
			}
		}
	})

	Object.defineProperty(this, 'week', {
		get: function () {
			return parseInt(this._moment.format('W'), 10)
		}
	})
}
module.exports = Task

Task.prototype = {

	/**
	 * get date + time of now in readable format
	 */
	now: function () {
		this._moment = moment()
		this.date = this._moment.format(DATE)
		this.time = this._moment.format(TIME)
		this.update()
	},

	/**
	 * update time stamps
	 * @param {String|Object} [date] - in format "YYYY-MM-DD"; If Object needs to be of type `moment`
	 * @param {String} [time] - in format "HH:mm"
	 */
	update: function (date, time) {
		var mmnt
		this.isValid = false

		if (moment.isMoment(date)) {
			mmnt = date
		}
		else {
			date = date || this.date
			time = time || this.time
			mmnt = this._valid(date, time)
		}

		if (mmnt) {
			this._updateMoment(mmnt)
			this.isValid = true
		}
		return this.isValid
	},

	_updateMoment: function (mmnt) {
		this._moment = mmnt
		this.date = mmnt.format(DATE)
		this.time = mmnt.format(TIME)
		this.utc = this._moment + 0
	},

	/**
	 * change time of task by `seconds`
	 */
	addSeconds: function (seconds) {
		if (this.isValid) {
			var mmnt = this._moment
			mmnt.add(seconds, 'seconds')
			this._updateMoment(mmnt)
			return this
		}
	},

	/**
	 * add project information
	 * @param {String} project
	 * @param {String} [description]
	 */
	addProject: function (project, description) {
		// handle shortcuts
		switch(project) {
			case 'e': {
				project = 'end'
				break
			}
			case 's': {
				project = 'start'
				break
			}
			case 'p': {
				project = 'pause'
				break
			}
			case 'vacation':
			case 'sick': {
				if (!this.duration) {
					this.time = '09:00'
					this.duration = '1day'
				}
			}
		}

		this.project = project
		this.description = description
	},

	/**
	 * calculate duration of task in seconds
	 * @param {Object} info
	 * @return {Number} duration in seconds
	 */
	calcDuration: function (task) {
		if (this._isEnd()) {
			this.duration = 0
		}
		else {
			this.duration = (task.utc - this.utc) / 1000
		}
		return this.duration
	},

	/**
	 * @return {String}
	 */
	toString: function () {
		var arr = [ this.date, this.time, this.project, this.description ]
		var str = arr.join('\t')
		if (this.deleted) {
			str = '#' + str + '#DELETED#'
		}
		return str + (this._isEnd() ? '\n' : '')
	},

	/**
	 * check if `date` and/or `time` are valid
	 * @api private
	 * @param {String} date
	 * @param {String} time
	 */
	_valid: function (date, time) {
		var tmp

		time = time || '00:00'

		if (DATE_REX.test(date) && TIME_REX.test(time)) {
			tmp = moment(date + ' ' + time , DATE + ' ' + TIME)
			if (tmp && !~tmp.format(DATE).indexOf('Invalid date') && !~tmp.format(TIME).indexOf('Invalid date')) {
				return tmp
			}
		}
	},

	_isEnd: function () {
		return (this.project === 'end')
	},

	_isPause: function () {
		return (this.project === 'pause')
	},
}
