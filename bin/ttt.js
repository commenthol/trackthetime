#!/usr/bin/env node

'use strict'

// module dependencies
const childProcess = require('child_process')
const async = require('asyncc')
const Tasks = require('../').Tasks
const Report = require('../').Report
const timerange = require('../').timerange
const file = require('../lib/file')
const config = require('../lib/config')
const cli = require('../lib/cli')

// open the editor
const spawnEditor = function (cmd, filename, cb) {
  const child = childProcess.spawn(cmd, [filename], {
    stdio: 'inherit'
  })
  child
    .on('error', function (err) {
      if (!cb) {
        console.error(err)
      }
      cb && cb(err)
    })
    .on('exit', function (err, code) {
      if (!cb && err) {
        console.error(err)
      }
      cb && cb(code)
    })
}

// main function
const main = {
  // the commands to perform
  _cmd: [],
  // the tasks to process
  _tasks: null,
  // command line arguments
  _args: process.argv.slice(2),
  // compare command
  _isCmd: function (cmd) {
    return ~this._cmd.indexOf(cmd)
  },
  // read data
  _data: null,

  // process command line args
  cmd: function () {
    const _this = this
    return function (cb) {
      const commander = cli()
      if (commander.help) {
        console.log(commander.help)
        process.exit()
      }
      if (commander.sort) {
        _this._cmd = ['read', 'sort', 'write']
      } else if (commander.edit) {
        _this._cmd = []
        spawnEditor(config.config.editor, config.filename)
      } else if (commander.config) {
        _this._cmd = []
        spawnEditor(config.config.editor, config.configfilename)
      } else if (
        commander.day ||
        commander.week ||
        commander.month ||
        commander.project ||
        commander.from ||
        commander.to
      ) {
        _this._commander = commander
        _this._cmd = ['read', 'report']
      } else if (commander.last) {
        _this._commander = commander
        _this._cmd = ['read', 'last']
      } else if (_this._args.length > 0) {
        _this._cmd = ['read', 'append']
      } else {
        _this._cmd = ['read', 'report']
      }

      cb()
    }
  },

  init: function () {
    return function (cb) {
      this._tasks = new Tasks({
        console: true,
        daily: config.config.daily * 3600
      })
      cb()
    }.bind(this)
  },

  // read tasks from file
  read: function () {
    const _this = this
    return function (cb) {
      if (_this._isCmd('read')) {
        file.read(config.filename, function (err, data) {
          if (!err) {
            _this._data = data
            err = _this._tasks.split(data)
          }
          cb(err)
        })
      } else {
        cb()
      }
    }
  },

  // write them back
  write: function () {
    const _this = this
    return function (cb) {
      if (_this._isCmd('write')) {
        file.write(config.filename, _this._tasks.sort().toString(), cb)
      } else {
        cb()
      }
    }
  },

  // write a backup file
  writebackup: function () {
    const _this = this
    return function (cb) {
      if (_this._isCmd('write')) {
        file.write(config.filename + '.bak', _this._data, cb)
      } else {
        cb()
      }
    }
  },

  // append a line to the track log
  append: function () {
    const _this = this
    return function (cb) {
      if (_this._isCmd('append')) {
        const obj = _this._tasks.append(_this._args)
        if (obj.err) {
          _this._cmd.push('write')
        }
        if (obj.str) {
          file.append(config.filename, obj.str, cb)
        }
      } else {
        cb()
      }
    }
  },

  // sort the track log
  sort: function () {
    const _this = this
    return function (cb) {
      if (_this._isCmd('sort')) {
        _this._tasks.sort()
      }
      cb()
    }
  },

  // give back some stats
  report: function () {
    const _this = this
    return function (cb) {
      let type
      let mmt
      let tmp
      let from
      let to
      const report = new Report(_this._tasks)
      const c = _this._commander

      if (_this._isCmd('report')) {
        if (c) {
          tmp = timerange(c.from, c.to)
          from = tmp.from
          to = tmp.to

          if (c.week) type = 'week'
          if (c.month) type = 'month'
          if (c.project) {
            if (c.project === true) {
              c.project = undefined
            }
            console.log(report.toCSV(report.prjTime(type, from, to, c.project)))
          } else {
            console.log(report.toCSV(report.time(type, from, to)))
          }
        } else {
          mmt = report.todayTimeLeft(config.config)
          console.log(report.toCSV(report.time('week')))
          console.log(report.toCSV(report.time()))
          if (mmt) {
            console.log(mmt.format('HH:mm') + ' is ttl')
          }
        }
      }
      cb()
    }
  },

  last: function () {
    const _this = this
    return function (cb) {
      if (_this._isCmd('last')) {
        let num = _this._commander.last
        if (num === true) {
          num = 10
        }
        _this._tasks.slice(num)
        console.log(_this._tasks.toString())
      }
      cb && cb()
    }
  }
}

async.series(
  [
    config.prep(),
    config.writeInitial(),
    config.writeDefault(),
    config.load(),
    main.init(),
    main.cmd(),
    main.read(),
    main.sort(),
    main.append(),
    main.writebackup(),
    main.write(),
    main.report(),
    main.last()
  ],
  function (err) {
    if (err) {
      console.error('\nError:', err.message || err)
      if (err.data) {
        if (Array.isArray(err.data)) {
          console.error('    ' + err.data.join('\n    '))
        } else {
          console.error(err.data)
        }
      }
      console.error()
    }
  }
)
