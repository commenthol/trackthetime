'use strict'

var moment = require('moment')
var hashTree = require('hashtree').hashTree
var Task = require('./task')

/**
 * @constructor
 * @param {Object} tasks
 */
function Report (tasks) {
  this._tasks = []
  if (tasks) {
    this._tasks = tasks.sort().tasks
  }
  this._report = {}

  this._calcDuration()
}

module.exports = Report

Report.prototype = {
  /**
   * push a dummy task to task list to allow calc of previous durations for same day
   * @api private
   */
  _last: function () {
    var now = new Task({ now: true })
    var last = this._tasks[this._tasks.length - 1]

    if (last &&
      last.project !== 'end' &&
      now.date === last.date
    ) {
      this._tasks.push(now)
      this._tasks = this._tasks.sort()
    }
  },

  /**
   * calculate the duration for all tasks and count the time for the stats.
   * requires that `this._tasks` is sorted.
   * @api private
   */
  _calcDuration: function () {
    var i
    var secs
    var tsk
    var next

    this._last()

    for (i = 0; i < this._tasks.length - 1; i++) {
      tsk = this._tasks[i]
      next = this._tasks[i + 1]

      secs = tsk.calcDuration(next)

      // count for the stats
      if (!tsk._isPause()) {
        hashTree.use(this._report, ['day', tsk.date]).add(secs)
        hashTree.use(this._report, ['week', tsk.week]).add(secs)
        hashTree.use(this._report, ['month', tsk.month]).add(secs)
      }
      hashTree.use(this._report, ['project', 'day', tsk.date, tsk.project]).add(secs)
      hashTree.use(this._report, ['project', 'week', tsk.week, tsk.project]).add(secs)
      hashTree.use(this._report, ['project', 'month', tsk.month, tsk.project]).add(secs)
    }
  },

  /**
   * convert seconds to a fraction of an hour
   * @api private
   * @param {Number} secs - seconds
   * @param {Number} [precision]
   * @return {Number} fraction of hour
   */
  _toHour: function (secs, precision) {
    return parseFloat((secs / 3600).toFixed(precision), 10)
  },

  /**
   * loop over a date range; day or week
   * @api private
   * @param {String} [from]
   * @param {String} [to]
   * @param {String} [type] - 'day' or 'week'; defaults to 'day'
   * @return {Array}
   */
  _loop: function (from, to, type) {
    var tmp
    var mm
    var res = []

    type = type || 'day'

    from = new Task({ date: (from || moment().hour(0).minute(0).second(0)) })
    to = new Task({ date: (to || moment().hour(23).minute(59).second(59)) })

    if (to._moment < from._moment) {
      tmp = from; from = to; to = tmp
    }

    mm = from._moment

    while (mm < to._moment) {
      tmp = new Task({ date: mm })
      if (type === 'month') {
        res.push(tmp.month)
      } else if (type === 'week') {
        res.push(tmp.week)
      } else {
        res.push(tmp.date)
      }
      mm = mm.add(1, type)
    }
    return res
  },

  /**
   * helper function to get general information per type
   * @api private
   * @param {String} [from]
   * @param {String} [to]
   * @param {String} [type] - 'day' or 'week'; defaults to 'day'
   * @return {Object}
   */
  _type: function (from, to, type, opts) {
    var obj = { sum: 0 }
    opts = opts || {}

    this._loop(from, to, type).forEach(function (item) {
      var secs = hashTree.get(this._report, [type, item])

      if (secs) {
        item = (type === 'week' ? 'CW' + item : item)
        obj[item] = opts.secs ? secs : this._toHour(secs, 1)
        obj.sum += secs
      }
    }, this)

    if (obj.sum) {
      obj.sum = opts.secs ? obj.sum : this._toHour(obj.sum, 1)
    } else {
      delete (obj.sum)
    }
    return obj
  },

  /**
   * helper function to get project information per type
   * @api private
   * @param {String} [from]
   * @param {String} [to]
   * @param {String} [type] - 'day' or 'week'; defaults to 'day'
   * @param {Array} [selectedPrjs] - project(s) to report
   * @return {Object}
   */
  _typePrj: function (from, to, type, selectPrjs) {
    var obj = { sum: 0 }
    var hasSelectedPrjs = !!selectPrjs
    var selected = Report.selectProjects(selectPrjs)

    this._loop(from, to, type).forEach(function (item) {
      var secs
      var prjs = hashTree.get(this._report, ['project', type, item])

      item = (type === 'week' ? 'CW' + item : item)
      for (var p in prjs) {
        if (hasSelectedPrjs && !selected['*'] && selected[p] !== true) {
          continue
        }
        secs = prjs[p]
        if (secs && selected[p] !== false) {
          if (!obj[item]) obj[item] = {}
          obj[item][p] = this._toHour(secs, 1)
          if (p !== 'pause') {
            obj.sum += secs
          }
        }
      }
    }, this)

    if (obj.sum) {
      obj.sum = this._toHour(obj.sum, 1)
    } else {
      delete (obj.sum)
    }
    return obj
  },

  /**
   * report working hours per day,week,month within a given period
   * @param {String} [type] - day | week | month
   * @param {String} [from]
   * @param {String} [to]
   * @return {Array}
   */
  time: function (type, from, to) {
    type = type || 'day'
    return this._type(from, to, type)
  },

  /**
   * report working hours per day,week,month within a given period for projects
   * @param {String} [type] - day | week | month
   * @param {String} [from]
   * @param {String} [to]
   * @param {String|Array} [prj] - filter per prj
   * @return {Array}
   */
  prjTime: function (type, from, to, prj) {
    type = type || 'day'
    return this._typePrj(from, to, type, prj)
  },

  /**
   * calculate the time until
   * @param {Object} conf
   * @param {Number} conf.daily
   * @param {Number} conf.weekly
   */
  todayTimeLeft: function (conf) {
    var tsk = new Task({ now: true })
    var lastTsk = this._tasks[this._tasks.length - 1]
    var secs = hashTree.get(this._report, ['day', tsk.date])
    var last = (conf.daily * 3600) - secs
    var week = this.time('week').sum
    var diff = conf.weekly - week

    if (diff < conf.daily) {
      last = diff * 3600
    }

    if (lastTsk && !lastTsk._isEnd()) {
      if (tsk._moment < lastTsk._moment) {
        return lastTsk._moment.add(last, 'seconds')
      }
      return tsk._moment.add(last, 'seconds')
    }
  },

  /**
  * convert to csv
  */
  toCSV: function (obj) {
    var out = ''

    for (var date in obj) {
      if (date !== 'sum') {
        if (typeof obj[date] === 'object') {
          for (var i in obj[date]) {
            out += [date, obj[date][i], i].join('\t') + '\n'
          }
        } else {
          out += [date, obj[date]].join('\t') + '\n'
        }
      }
    }
    if (obj.sum) {
      out += ['', obj.sum, 'sum'].join('\t') + '\n'
    }
    return out.substr(0, out.length - 1)
  }
}

Report.selectProjects = function selectProjects (prjs) {
  var obj = { pause: false }
  prjs = prjs || []
  if (typeof prjs === 'string') {
    prjs = prjs.split(/[,\s]+/)
  }

  prjs.forEach((name) => {
    var val = true
    var deselect = /^-(.*)$/.exec(name)
    if (deselect) {
      name = deselect[1]
      val = false
    }
    obj[name] = val
  })
  return obj
}
