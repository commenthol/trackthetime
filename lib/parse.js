'use strict'

const Task = require('./task')
const { rfcDate, timeOrDuration } = require('./rfcDate')

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

/**
 * compose a new track log line from command line arguments
 * @param {Array} arr - cli arguments
 * @return {Object} composed object
 */
function newLine (arr) {
  let i = 0
  const opts = { now: true, description: '' }

  for (i = 0; i <= 4; i++) {
    const date = rfcDate(arr[0])
    const [time, duration] = timeOrDuration(arr[0])

    if (date) {
      opts.date = date
      arr.shift()
    } else if (time) {
      opts.time = time
      arr.shift()
    } else if (duration) {
      // duration in seconds
      opts.duration = duration
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
