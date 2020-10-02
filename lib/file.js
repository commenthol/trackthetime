'use strict'

const fs = require('fs')

/**
 * async file handler
 */
function read (filename, cb) {
  fs.readFile(filename, 'utf8', cb)
}

function write (filename, data, cb) {
  fs.writeFile(filename, data, 'utf8', cb)
}

function append (filename, data, cb) {
  // if (typeof data === 'string') {
  fs.appendFile(filename, data, 'utf8', cb)
  // }
}

module.exports = {
  read,
  write,
  append
}
