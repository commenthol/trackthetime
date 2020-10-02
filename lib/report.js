'use strict'

const moment = require('moment')
const { hashTree } = require('hashtree')
const { DAY, WEEK, MONTH, PAUSE, END } = require('./consts')
const Task = require('./task')

const PROJECT = 'project'
const SUM = 'sum'

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
    const now = new Task({ now: true })
    const last = this._tasks[this._tasks.length - 1]

    if (last &&
      last.project !== END &&
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
    let i
    let secs
    let tsk
    let next

    this._last()

    for (i = 0; i < this._tasks.length - 1; i++) {
      tsk = this._tasks[i]
      next = this._tasks[i + 1]

      secs = tsk.calcDuration(next)

      // count for the stats
      if (!tsk._isPause()) {
        hashTree.use(this._report, [DAY, tsk.date]).add(secs)
        hashTree.use(this._report, [WEEK, tsk.week]).add(secs)
        hashTree.use(this._report, [MONTH, tsk.month]).add(secs)
      }
      hashTree.use(this._report, [PROJECT, DAY, tsk.date, tsk.project]).add(secs)
      hashTree.use(this._report, [PROJECT, WEEK, tsk.week, tsk.project]).add(secs)
      hashTree.use(this._report, [PROJECT, MONTH, tsk.month, tsk.project]).add(secs)
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
  _loop: function (_from, _to, type = DAY) {
    let tmp
    let mm
    const res = []

    let from = new Task({ date: (_from || moment().hour(0).minute(0).second(0)) })
    let to = new Task({ date: (_to || moment().hour(23).minute(59).second(59)) })

    if (to._moment < from._moment) {
      tmp = from; from = to; to = tmp
    }

    mm = from._moment

    while (mm < to._moment) {
      tmp = new Task({ date: mm })
      if (type === MONTH) {
        res.push(tmp.month)
      } else if (type === WEEK) {
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
    const obj = { sum: 0 }
    opts = opts || {}

    this._loop(from, to, type).forEach(function (item) {
      const secs = hashTree.get(this._report, [type, item])

      if (secs) {
        item = (type === WEEK ? 'CW' + item : item)
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
    const obj = { sum: 0 }
    const hasSelectedPrjs = !!selectPrjs
    const selected = Report.selectProjects(selectPrjs)

    this._loop(from, to, type).forEach(function (item) {
      let secs
      const prjs = hashTree.get(this._report, [PROJECT, type, item])

      item = (type === WEEK ? 'CW' + item : item)
      for (const p in prjs) {
        if (hasSelectedPrjs && !selected['*'] && selected[p] !== true) {
          continue
        }
        secs = prjs[p]
        if (secs && selected[p] !== false) {
          if (!obj[item]) obj[item] = {}
          obj[item][p] = this._toHour(secs, 1)
          if (p !== PAUSE) {
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
    return this._type(from, to, type || DAY)
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
    return this._typePrj(from, to, type || DAY, prj)
  },

  /**
   * calculate the time until
   * @param {Object} conf
   * @param {Number} conf.daily
   * @param {Number} conf.weekly
   */
  todayTimeLeft: function (conf) {
    const tsk = new Task({ now: true })
    const lastTsk = this._tasks[this._tasks.length - 1]
    const secs = hashTree.get(this._report, [DAY, tsk.date])
    let last = (conf.daily * 3600) - secs
    const week = this.time(WEEK).sum
    const diff = conf.weekly - week

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
    let out = ''

    for (const date in obj) {
      if (date !== SUM) {
        if (typeof obj[date] === 'object') {
          for (const i in obj[date]) {
            out += [date, obj[date][i], i].join('\t') + '\n'
          }
        } else {
          out += [date, obj[date]].join('\t') + '\n'
        }
      }
    }
    if (obj.sum) {
      out += ['', obj.sum, SUM].join('\t') + '\n'
    }
    return out.substr(0, out.length - 1)
  }
}

Report.selectProjects = function selectProjects (prjs) {
  const obj = { pause: false }
  prjs = prjs || []
  if (typeof prjs === 'string') {
    prjs = prjs.split(/[,\s]+/)
  }

  prjs.forEach((name) => {
    let val = true
    const deselect = /^-(.*)$/.exec(name)
    if (deselect) {
      name = deselect[1]
      val = false
    }
    obj[name] = val
  })
  return obj
}
