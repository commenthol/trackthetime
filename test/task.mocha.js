'use strict'

/* global describe, it */

const assert = require('assert')
const assertMap = require('./lib/helper').assertMap
const Task = require('../lib/task')

describe('#Task', function () {
  it('can create task for now', function () {
    const task = new Task()
    task.now()
    // ~ console.log(task)

    assert.ok(/^\d{4}-\d{2}-\d{2}/.test(task.date))
    assert.ok(/^\d{2}:\d{2}/.test(task.time))
  })

  it('can update to a date', function () {
    const task = new Task()
    task.update('2015-08-07', '22:11')

    const exp = {
      date: '2015-08-07',
      time: '22:11',
      utc: 1438978260000,
      week: 32
    }

    assertMap(task, exp)
  })

  it('can add a project description', function () {
    const exp = {
      date: '2015-08-07',
      time: '22:11',
      utc: 1438978260000,
      week: 32,
      project: 'myprj',
      description: 'a description describing that task'
    }
    const task = new Task()

    task.update('2015-08-07', '22:11')
    task.addProject('myprj', 'a description describing that task')

    assertMap(task, exp)
  })

  it('can calculate a duration', function () {
    const task = new Task({ date: '2015-08-07', time: '23:55' })
    const task2 = new Task()
    task2.update('2015-08-08', '00:05')
    task.calcDuration(task2)

    const exp = {
      duration: 600
    }

    assertMap(task, exp)
  })

  it('only accepts a valid date', function () {
    const exp = {
      date: '2015-08-07',
      time: '23:55'
    }
    const task = new Task({ date: exp.date, time: exp.time })

    assert.ok(!task.update('11-23'))
    assertMap(task, exp)
  })

  it('only accepts a valid time', function () {
    const exp = {
      date: '2015-08-07',
      time: '23:55'
    }
    const task = new Task({ date: '2015-08-07', time: '23:55' })

    assert.ok(!task.update(undefined, '26:3'))
    assertMap(task, exp)
  })

  it('can convert a task to string', function () {
    const task = new Task({ date: '2015-08-07', time: '23:55', project: 'prj', description: 'a description' })
    const res = task.toString()
    const exp = '2015-08-07\t23:55\tprj\ta description'

    assert.strictEqual(res, exp)
  })

  it('can set time and duration if project is `sick`', function () {
    const task = new Task({ date: '2015-08-07', project: 'sick' })
    const exp = {
      date: '2015-08-07',
      project: 'sick',
      time: '09:00',
      duration: '1day'
    }
    assertMap(task, exp)
  })

  it('can set time and duration if project is `vacation`', function () {
    const task = new Task({ date: '2015-08-07', project: 'vacation' })
    const exp = {
      date: '2015-08-07',
      project: 'vacation',
      time: '09:00',
      duration: '1day'
    }
    assertMap(task, exp)
  })
})
