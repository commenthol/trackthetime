'use strict'

const parse = require('./parse')
const Task = require('./task')

/**
 * @constructor
 * @param {String|Array} [tasks] - Task list; if {Array} then elements need to be instanceof {Task}
 * @param {Object} [opts] - options
 */
function Tasks (tasks, opts) {
  if (!(this instanceof Tasks)) {
    return new Tasks(tasks, opts)
  }

  this.tasks = []
  this._opts = Object.assign({
    daily: 8 * 3600, // default duration for one day in seconds
    console: false // log to console
  }, opts)

  if (typeof tasks === 'string') {
    this.split(tasks)
  } else if (Array.isArray(tasks)) {
    this.tasks = tasks
  } else {
    if (typeof tasks === 'object') {
      this._opts = tasks
    }
  }
}
module.exports = Tasks

Tasks.prototype = {
  /**
   * append single task
   * @param {Object|Array} task - {Task}
   * @return {Object} obj - `{ str: {String} , err: {String} }`
   */
  append: function (task) {
    const out = []
    let err
    let i
    let tmp

    const push = function (task) {
      const tsk = task.toString()
      this.tasks.push(task)
      out.push(tsk)
    }.bind(this)

    if (Array.isArray(task)) {
      task = parse.newLine(task.slice())
    }
    if (task) {
      if (task.project === 'c') { // continue previous project
        tmp = this.previous()
        task.project = tmp.project || '?'
        task.description = tmp.description || ''
      }

      push(task)

      if (task.duration) {
        tmp = new Task(task)
        if (task.duration === '1day') {
          tmp.addSeconds(this._opts.daily)
          tmp.project = 'end'
          tmp.description = ''
        } else {
          tmp.addSeconds(task.duration)
          tmp.project = '?'
          tmp.description = ''
          // try to get previous task
          this.sort()
          for (i = 0; i < this.tasks.length - 1; i++) {
            if (this.tasks[i + 1] === task &&
              this.tasks[i].date === task.date // need to be on same date
            ) {
              tmp.project = this.tasks[i].project
              tmp.description = this.tasks[i].description
              if (this.tasks[i + 2] &&
                this.tasks[i + 2].utc < tmp.utc
              ) {
                tmp.project = this.tasks[i + 2].project
                tmp.description = this.tasks[i + 2].description
                err = 'Error: "' + this.tasks[i + 2].toString().replace(/\s+/g, ' ').trim() + '" deleted"'
                this.tasks[i + 2].deleted = true
                out.push(this.tasks[i + 2].toString())
              }
              break
            }
          }
        }
        push(tmp)
      }

      const str = out.join('\n') + '\n'
      if (this._opts.console) {
        console.log(str)
        if (err) {
          console.error(err)
        }
      }
      return { str: str, err: err }
    }
    return {}
  },

  /**
   * split string into tasks
   * @param {String} str - data to split into pieces
   */
  split: function (str) {
    let i
    let line
    const errors = []
    let tsk
    const lines = str.split(/[\n\r]/)

    this.tasks = []

    for (i = 0; i < lines.length; i++) {
      line = lines[i]
      tsk = parse.line(line)
      if (tsk) {
        if (tsk.isValid) {
          this.tasks.push(tsk)
        } else if (!tsk.isComment) {
          errors.push('line ' + (i + 1) + ': ' + (line || '').replace(/\t/g, ' '))
        }
      }
    }

    this.sort()

    if (errors.length > 0) {
      return errors
    }
  },

  /**
   * sort tasks by date/ time
   */
  sort: function () {
    function sorter (a, b) {
      return (a.utc < b.utc) ? -1 : (a.utc == b.utc ? 0 : 1) // eslint-disable-line eqeqeq
    }

    this.tasks = this.tasks.sort(sorter)
    return this
  },

  /**
  * try to get previous task which is not pause or end
  */
  previous: function () {
    const tmp = {}
    let tmpTsk
    const now = Date.now()
    // try to get previous task
    this.sort()
    for (let i = this.tasks.length - 1; i >= 0; i--) {
      tmpTsk = this.tasks[i]
      if (['pause', 'end'].indexOf(tmpTsk.project) === -1 && tmpTsk.utc < now) {
        tmp.project = tmpTsk.project
        tmp.description = tmpTsk.description
        break
      }
    }
    return tmp
  },

  /**
   * slice tasks list to `num` entries from end.
   * @param {Number} num
   */
  slice: function (num) {
    num = (isNaN(num) ? 10 : num)
    const end = this.tasks.length
    const beg = ((end - num) < 0 ? 0 : end - num)

    this.tasks = this.tasks.slice(beg, end)
    return this
  },

  /**
   * convert task list to human readable format
   * @return {String}
   */
  toString: function () {
    let _week = 0
    const arr = []

    // add calender week as seperator
    function week (tsk) {
      _week = tsk.week
      return '# CW ' + _week + '\n'
    }

    arr.push(week(this.tasks[0]))

    this.tasks.forEach(function (tsk) {
      if (tsk.week !== _week) {
        arr.push(week(tsk))
      }

      arr.push(tsk.toString())
    })

    return arr.join('\n') + '\n'
  }
}
