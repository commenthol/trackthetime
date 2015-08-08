'use strict';

var
	moment = require('moment'),
	hashTree = require('hashtree').hashTree,
	Task = require('./task');

/**
 * @constructor
 */
function Report(tasks, opts) {

	opts = opts || {};

	this._tasks = [];
	if (tasks) {
		this._tasks = tasks.sort();
	}
	this._report = {};

	this._calcDuration();
}

module.exports = Report;

Report.prototype = {

	/**
	 * calculate the duration for all tasks and count the time for the stats.
	 * requires that `this._tasks` is sorted.
	 * @api private
	 */
	_calcDuration: function() {
		var i,
			secs,
			tsk,
			next;

		for (i=0; i<this._tasks.length-1; i++) {
			tsk  = this._tasks[i];
			next = this._tasks[i+1];

			secs = tsk.calcDuration(next);

			// count for the stats
			if (!tsk._isPause()) {
				hashTree.use(this._report, ['day'  , tsk.date  ]).add(secs);
				hashTree.use(this._report, ['week' , tsk.week  ]).add(secs);
				hashTree.use(this._report, ['month', tsk.month ]).add(secs);
			}
			hashTree.use(this._report, ['project', 'day',   tsk.date,  tsk.project]).add(secs);
			hashTree.use(this._report, ['project', 'week',  tsk.week,  tsk.project]).add(secs);
			hashTree.use(this._report, ['project', 'month', tsk.month, tsk.project]).add(secs);
		}
	},

	/**
	 * convert seconds to a fraction of an hour
	 * @api private
	 * @param {Number} secs - seconds
	 * @param {Number} [precision]
	 * @return {Number} fraction of hour
	 */
	_toHour: function(secs, precision) {
		return parseFloat((secs / 3600).toFixed(precision), 10);
	},

	/**
	 * loop over a date range; day or week
	 * @api private
	 * @param {String} [from]
	 * @param {String} [to]
	 * @param {String} [type] - 'day' or 'week'; defaults to 'day'
	 * @return {Array}
	 */
	_loop: function(from, to, type) {
		var tmp,
			mm,
			res=[];

		type = type || 'day';

		from = new Task({date: (from || moment())});
		to = new Task({date: (to || moment())});

		if (to._moment < from._moment) {
			tmp = from; from = to; to = tmp;
		}

		mm = from._moment;

		while (mm <= to._moment) {
			tmp = new Task({date: mm});
			if (type === 'month') {
				res.push(tmp.month);
			}
			else if (type === 'week') {
				res.push(tmp.week);
			}
			else {
				res.push(tmp.date);
			}
			mm = mm.add(1, type);
		}
		return res;
	},

	/**
	 * helper function to get general information per type
	 * @api private
	 * @param {String} [from]
	 * @param {String} [to]
	 * @param {String} [type] - 'day' or 'week'; defaults to 'day'
	 * @return {Object}
	 */
	_type: function(from, to, type) {
		var self = this,
			obj = { sum: 0 };

		this._loop(from, to, type).forEach(function(item){
			var secs = hashTree.get(self._report, [ type, item ]);

			if (secs) {
				item = (type === 'week' ? 'CW'+item : item);
				obj[item] = self._toHour(secs, 1);
				obj.sum += secs;
			}
		});

		if (obj.sum) {
			obj.sum = self._toHour(obj.sum, 1);
		} else {
			delete(obj.sum);
		}
		return obj;
	},

	/**
	 * helper function to get project information per type
	 * @api private
	 * @param {String} [from]
	 * @param {String} [to]
	 * @param {String} [type] - 'day' or 'week'; defaults to 'day'
	 * @return {Object}
	 */
	_typePrj: function(from, to, type, prj) {
		var self = this,
			obj = { sum: 0 };

		this._loop(from, to, type).forEach(function(item){
			var secs,
				prjs = hashTree.get(self._report, [ 'project', type, item ]);

			item = (type === 'week' ? 'CW'+item : item);
			for (var p in prjs) {
				if (prj && p !== prj) {
					continue;
				}
				secs = prjs[p];

				if (secs) {
					if (!obj[item]) obj[item] = {};

					obj[item][p] = self._toHour(secs, 1);
					if (p !== 'pause') {
						obj.sum += secs;
					}
				}
			}
		});

		if (obj.sum) {
			obj.sum = self._toHour(obj.sum, 1);
		} else {
			delete(obj.sum);
		}
		return obj;
	},

	/**
	 * report working hours per day,week,month within a given period
	 * @param {String} [type] - day | week | month
	 * @param {String} [from]
	 * @param {String} [to]
	 * @return {Array}
	 */
	time: function(type, from, to) {
		type = type || 'day';
		return this._type(from, to, type);
	},

	/**
	 * report working hours per day,week,month within a given period for projects
	 * @param {String} [type] - day | week | month
	 * @param {String} [from]
	 * @param {String} [to]
	 * @param {String|Array} [prj] - filter per prj
	 * @return {Array}
	 */
	prjTime: function(type, from, to, prj) {
		type = type || 'day';
		return this._typePrj(from, to, type, prj);
	},

	toCSV: function (obj) {
		var tab,
			out = '';

		for (var date in obj) {
			if (date !== 'sum') {
				if (typeof obj[date] === 'object' ) {
					for (var i in obj[date]) {
						tab = 1;
						out += [ date, i, obj[date][i] ].join('\t') + '\n';
					}
				} else {
					out += [ date, obj[date] ].join('\t') + '\n';
				}
			}
		}
		if (obj.sum) {
			out += [ '', 'sum', obj.sum ].join('\t') + '\n';
		}
		return out.substr(0, out.length-1);
	}

};