'use strict'

/* global describe, it */

var fs = require('fs')
var path = require('path')
var sinon = require('sinon')
var assert = require('assert')
var Task = require('../lib/task')
var Tasks = require('../lib/tasks')
var Report = require('../lib/report')
var fromTo = require('../lib/timerange')

var testTasks = fs.readFileSync(path.join(__dirname, 'fixtures', 'test.log'), 'utf8')

describe('#Report', function () {
  it('can loop over days', function () {
    var report = new Report()
    var tmp = fromTo('2015-02-25', '2015-03-02')
    var res = report._loop(tmp.from, tmp.to)
    var exp = [
      '2015-02-25',
      '2015-02-26',
      '2015-02-27',
      '2015-02-28',
      '2015-03-01',
      '2015-03-02'
    ]

    assert.deepEqual(res, exp)
  })

  it('can loop over weeks', function () {
    var report = new Report()
    var tmp = fromTo('2015-02-01', '2015-03-02')
    var res = report._loop(tmp.from, tmp.to, 'week')
    var exp = [ 5, 6, 7, 8, 9 ]

    assert.deepEqual(res, exp)
  })

  it('can loop over months', function () {
    var report = new Report()
    var tmp = fromTo('2015-02-01', '2015-03-02')
    var res = report._loop(tmp.from, tmp.to, 'month')
    var exp = [ '2015-02', '2015-03' ]

    assert.deepEqual(res, exp)
  })

  it('can report working hours for a single day', function () {
    var tsk = new Task({now: true})
    var tasks = new Tasks(tsk.date + ' 09:00 start\n' + tsk.date + ' 17:00 end\n')
    var report = new Report(tasks)
    var res = report.time()
    var exp = { 'sum': 8 }
    exp[tsk.date] = 8

    assert.deepEqual(res, exp)
  })

  it('can report for a number of days', function () {
    var tasks = new Tasks(testTasks)
    var report = new Report(tasks)
    var tmp = fromTo('2015-04-01', '2015-05-13')
    var res = report.time('day', tmp.from, tmp.to)
    var exp = {
      '2015-04-01': 8,
      '2015-04-02': 8,
      '2015-05-12': 10,
      'sum': 26
    }

    assert.deepEqual(res, exp)
  })

  it('can report for a single week', function () {
    var tsk = new Task({now: true})
    var tasks = new Tasks(tsk.date + ' 09:00 start\n' + tsk.date + ' 17:00 end\n')
    var report = new Report(tasks)
    var res = report.time('week')
    var exp = {'sum': 8}

    exp['CW' + tsk.week] = 8

    assert.deepEqual(res, exp)
  })

  it('can report for a number of weeks', function () {
    var tasks = new Tasks(testTasks)
    var report = new Report(tasks)
    var tmp = fromTo('2015-04-01', '2015-05-13')
    var res = report.time('week', tmp.from, tmp.to)
    var exp = {
      CW14: 16,
      CW20: 10,
      'sum': 26
    }

    assert.deepEqual(res, exp)
  })

  it('can report for a single month', function () {
    var tsk = new Task({now: true})
    var tasks = new Tasks(tsk.date + ' 09:00 start\n' + tsk.date + ' 17:00 end\n')
    var report = new Report(tasks)
    var res = report.time('month')
    var exp = { sum: 8 }

    exp[tsk.month] = 8

    assert.deepEqual(res, exp)
  })

  it('can report for a number of months', function () {
    var tasks = new Tasks(testTasks)
    var report = new Report(tasks)
    var tmp = fromTo('2015-04-01', '2015-05-13')
    var res = report.time('month', tmp.from, tmp.to)
    var exp = { sum: 26, '2015-04': 16, '2015-05': 10 }

    assert.deepEqual(res, exp)
  })

  it('can report projects for a single day', function () {
    var tsk = new Task({now: true})
    var tasks = new Tasks(tsk.date + ' 09:00 prj desc\n' + tsk.date + ' 17:00 end\n')
    var report = new Report(tasks)
    var res = report.prjTime()
    var exp = { sum: 8 }

    exp[tsk.date] = { prj: 8 }
    assert.deepEqual(res, exp)
  })

  it('can report projects for a number of days', function () {
    var tasks = new Tasks(testTasks)
    var report = new Report(tasks)
    var tmp = fromTo('2015-04-01', '2015-05-13')
    var res = report.prjTime('day', tmp.from, tmp.to)
    var exp = {
      'sum': 26,
      '2015-04-01': { prj: 8 },
      '2015-04-02': { prj: 4, org: 4 },
      '2015-05-12': { new: 10 }
    }

    assert.deepEqual(res, exp)
  })

  it('can report projects for a number of days including pause', function () {
    var tasks = new Tasks(testTasks)
    var report = new Report(tasks)
    var tmp = fromTo('2015-04-01', '2015-05-13')
    var res = report.prjTime('day', tmp.from, tmp.to, '*,pause')
    var exp = {
      'sum': 26,
      '2015-04-01': { prj: 8, pause: 1 },
      '2015-04-02': { prj: 4, pause: 1, org: 4 },
      '2015-05-12': { new: 10 }
    }

    assert.deepEqual(res, exp)
  })

  it('can report projects for a number of months', function () {
    var tasks = new Tasks(testTasks)
    var report = new Report(tasks)
    var tmp = fromTo('2015-04-01', '2015-05-13')
    var res = report.prjTime('month', tmp.from, tmp.to)
    var exp = {
      sum: 26,
      '2015-04': { prj: 12, org: 4 },
      '2015-05': { new: 10 }
    }

    assert.deepEqual(res, exp)
  })

  it('can report project "prj" for a number of days', function () {
    var tasks = new Tasks(testTasks)
    var report = new Report(tasks)
    var tmp = fromTo('2015-04-01', '2015-05-13')
    var res = report.prjTime('day', tmp.from, tmp.to, 'prj')
    var exp = {
      sum: 12,
      '2015-04-01': { prj: 8 },
      '2015-04-02': { prj: 4 }
    }

    assert.deepEqual(res, exp)
  })

  it('can report project "prj" for a number of weeks', function () {
    var tasks = new Tasks(testTasks)
    var tmp = fromTo('2015-04-01', '2015-05-13')
    var report = new Report(tasks)
    var res = report.prjTime('week', tmp.from, tmp.to, 'prj')
    var exp = { 'CW14': { prj: 12 }, sum: 12 }

    assert.deepEqual(res, exp)
  })

  it('can report project "prj" for a number of months', function () {
    var tasks = new Tasks(testTasks)
    var report = new Report(tasks)
    var tmp = fromTo('2015-04-01', '2015-05-13')
    var res = report.prjTime('month', tmp.from, tmp.to, 'prj')
    var exp = { sum: 12, '2015-04': { prj: 12 } }

    assert.deepEqual(res, exp)
  })

  it('can report time to leave for one day in advance', function () {
    var t =
  '2015-05-28\t08:00\tprj\n' +
  '2015-05-28\t12:00\tpause\n' +
  '2015-05-28\t12:30\tprj\n'
    var clock = sinon.useFakeTimers(+(new Date('2015-05-28T11:00:00')))
    var tasks = new Tasks(t)
    var report = new Report(tasks)
    var tmp = report.todayTimeLeft({ daily: 8, weekly: 40 })
    var res = tmp.format('HH:mm')
    var exp = '16:30'

    clock.restore()
    assert.deepEqual(res, exp)
  })

  it('can report time to leave for one day', function () {
    var t =
      '2015-05-28\t08:00\tprj\n' +
      '2015-05-28\t12:00\tpause\n' +
      '2015-05-28\t12:30\tprj\n'
    var clock = sinon.useFakeTimers(+(new Date('2015-05-28T15:00:00')))
    var tasks = new Tasks(t)
    var report = new Report(tasks)
    var tmp = report.todayTimeLeft({ daily: 8, weekly: 40 })
    var res = tmp.format('HH:mm')
    var exp = '16:30'

    clock.restore()
    assert.deepEqual(res, exp)
  })

  it('can report time to leave for last day of week', function () {
    var clock = sinon.useFakeTimers(+(new Date('2015-06-05T11:00:00')))
    var tasks = new Tasks(testTasks)
    var report = new Report(tasks)
    var tmp = report.todayTimeLeft({ daily: 8, weekly: 40 })
    var res = tmp.format('HH:mm')
    var exp = '14:30'

    clock.restore()
    assert.deepEqual(res, exp)
  })

  it('can report time to leave for last day of week making overtime', function () {
    var clock = sinon.useFakeTimers(+(new Date('2015-06-05T15:00:00')))
    var tasks = new Tasks(testTasks)
    var report = new Report(tasks)
    var tmp = report.todayTimeLeft({ daily: 8, weekly: 40 })
    var res = tmp.format('HH:mm')
    var exp = '14:30'

    clock.restore()
    assert.deepEqual(res, exp)
  })

  describe('selectProjects', function () {
    var selectProjects = Report.selectProjects

    it('can deselect pause per default', function () {
      var res = selectProjects()
      assert.deepEqual(res, {pause: false})
    })

    it('can select prj', function () {
      var res = selectProjects(['prj'])
      assert.deepEqual(res, {prj: true, pause: false})
    })

    it('can select prj and pause', function () {
      var res = selectProjects(['prj', 'pause'])
      assert.deepEqual(res, {prj: true, pause: true})
    })

    it('can deselect prj', function () {
      var res = selectProjects(['-prj'])
      assert.deepEqual(res, {prj: false, pause: false})
    })

    it('can deselect prj and select pause', function () {
      var res = selectProjects(['-prj', 'pause'])
      assert.deepEqual(res, {prj: false, pause: true})
    })
  })
})
