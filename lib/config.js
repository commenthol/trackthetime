'use strict'

const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')

const config = {
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
    const dir = path.dirname(this.filename)
    return function (cb) {
      fs.stat(dir, function (err) {
        if (err) {
          mkdirp(dir, cb)
          return
        }
        cb()
      })
    }
  },

  writeInitial: function () {
    const _this = this
    return function (cb) {
      fs.stat(_this.filename, function (err) {
        if (err) {
          fs.writeFile(_this.filename, '', 'utf8', cb)
          return
        }
        cb()
      })
    }
  },

  writeDefault: function () {
    const _this = this
    return function (cb) {
      fs.stat(_this.configfilename, function (err) {
        if (err) {
          fs.writeFile(_this.configfilename,
            JSON.stringify(_this.defaults, null, 2),
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
    const _this = this
    return function (cb) {
      fs.readFile(_this.configfilename, 'utf8', function (err, data) {
        try {
          if (!err && data) {
            data = JSON.parse(data)
            config.config = Object.assign({ editor: config.editor }, config.defaults, data)
          }
        } catch (e) {
          err = e
          data = null
        }
        cb(err)
      })
    }
  }
}

config.configfilename = path.join(path.dirname(config.filename), 'ttt.json')
config.config = Object.assign({ editor: config.editor }, config.defaults)

module.exports = config
