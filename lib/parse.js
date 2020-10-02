'use strict'

const Task = require('./task')

/**
 * parse a track log line into its components
 * @param {String} str - e.g. '2015-08-04 12:23 prj description'
 * @return {Object} - parsed object
 */
function line (str) {
  let opts
  const line = str.split(/\s+/)

  if (line) {
    // ignore comments
    if (/^#|^\s*$/.test(str)) {
      return { isComment: true }
    } else if (line.length >= 3) {
      opts = {
        date: line.shift(),
        time: line.shift(),
        project: line.shift(),
        description: line.join(' ')
      }

      return new Task(opts)
    }
  }
  return { isValid: false }
}

function isDate (str) {
  const d = new Date(str).getTime()
  return !isNaN(d)
}

/**
 * compose a new track log line from command line arguments
 * @param {Array} arr - cli arguments
 * @return {Object} composed object
 */
function newLine (arr) {
  let d
  let i = 0
  const opts = { now: true, description: '' }

  for (i = 0; i <= 4; i++) {
    if (/^\d{2,4}-\d{1,2}-\d{1,2}$/.test(arr[0])) {
      const str = arr[0]
      if (isDate(str)) {
        opts.date = str
      }
      arr.shift()
    } else if (/^\d{1,2}-\d{1,2}$/.test(arr[0])) {
      const d = new Date()
      const str = d.getFullYear() + '-' + arr[0]
      if (isDate(str)) {
        opts.date = str
      }
      arr.shift()
    } else if (/^\d{1,2}:\d{1,2}$/.test(arr[0])) {
      opts.time = arr[0]
      arr.shift()
    } else if (/^\+(\d{1,2}:)?(\d{1,2})$/.test(arr[0])) {
      // duration
      d = /^\+(\d{1,2}:)?(\d{1,2})$/.exec(arr[0])
      d.shift()
      // duration in seconds
      opts.duration = ((parseInt(d[0], 10) || 0) * 60 + parseInt(d[1], 10)) * 60
      arr.shift()
    } else {
      opts.project = arr[0]
      arr.shift()
      opts.description += arr.join(' ')
      break
    }
  }
  opts.description = opts.description.trim()

  if (!opts.project) return

  const task = new Task(opts)
  if (task.isValid) {
    return task
  }
}

module.exports = {
  line,
  newLine
}
