'use strict';

var
	moment = require('moment'),
	extend = require('util')._extend;

var fromTo = extend(function F(from, to, type) {
	var str,
		tmp;

	// timespan today
	if (!from && !to) {
		from = F._zeroTime(moment());
		to   = F._incDay(moment());
	}
	// timespan "from" until now
	else if (from && !to) {
		from = F._zeroTime(F._toMoment(from));
		to   = F._incDay(moment());
	}
	// timespan "from" = 2unit until "to" = 1unit
	else if (!from && to) {
		str = to;
		to = F._toMoment(to);
		if ((tmp = F._matchRelativeTime(str))) {
			from = F._toMoment('2'+tmp[2], to);
		}
		else {
			from = F._toMoment(str, to);
		}
	}
	else {
		from = F._toMoment(from);
		to   = F._toMoment(to);

		// revert
		if (from.valueOf() > to.valueOf()) {
			tmp = from;
			from = to;
			to = tmp;
		}

		from = F._zeroTime(from);
		to   = F._incDay(to);
	}

	return { from: from, to: to };
},{

	// check for relative time
	_matchRelativeTime: function(str) {
		var CAL_REG = /^-?(\d+)([dwm])[a-z]*$/;
		if (typeof str === 'string') {
			return (str||'').match(CAL_REG);
		}
	},

	_incDay: function(mmt) {
		return this._zeroTime(mmt.add(1, 'day'));
	},

	_zeroTime: function(mmt) {
		return mmt.hour(0).minute(0).second(0);
	},

	// convert `str` to a date using `moment`
	_toMoment: function(str, date) {
		var tmp, mmt;

		if ((tmp = this._matchRelativeTime(str))) {
			switch(tmp[2]) {
				// month
				case 'm': {
					mmt = moment(date).subtract(tmp[1]-1, 'Month');
					mmt.date(1);
					break;
				}
				// week
				case 'w': {
					mmt = moment(date).subtract(tmp[1]-1, 'week');
					mmt.day(1);
					break;
				}
				// day
				default: {
					mmt = moment(date).subtract(tmp[1]-1, 'day');
					break;
				}
			}
		}
		else {
			if (/^\d{1,2}-\d{1,2}$/.test(str)) {
				str = (new Date()).getFullYear() + '-' + str;
			}
			mmt = moment(str);
		}
		mmt.hour(0).minute(0).second(0);
		return mmt;
	}
});

module.exports = fromTo;
