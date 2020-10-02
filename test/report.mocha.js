'use strict'

/* global describe, it */

const fs = require('fs')
const path = require('path')
const sinon = require('sinon')
const assert = require('assert')
const Task = require('../lib/task')
const Tasks = require('../lib/tasks')
const Report = require('../lib/report')
const fromTo = require('../lib/timerange')

const testTasks = fs.readFileSync(path.join(__dirname, 'fixtures', 'test.log'), 'utf8')

describe('#Report', function () {
  it('can loop over days', function () {
    const report = new Report()
    const tmp = fromTo('2015-02-25', '2015-03-02')
    const res = report._loop(tmp.from, tmp.to)
    const exp = [
      '2015-02-25',
      '2015-02-26',
      '2015-02-27',
      '2015-02-28',
      '2015-03-01',
      '2015-03-02'
    ]

    assert.deepStrictEqual(res, exp)
  })

  it('can loop over weeks', function () {
    const report = new Report()
    const tmp = fromTo('2015-02-01', '2015-03-02')
    const res = report._loop(tmp.from, tmp.to, 'week')
    const exp = [5, 6, 7, 8, 9]

    assert.deepStrictEqual(res, exp)
  })

  it('can loop over months', function () {
    const report = new Report()
    const tmp = fromTo('2015-02-01', '2015-03-02')
    const res = report._loop(tmp.from, tmp.to, 'month')
    const exp = ['2015-02', '2015-03']

    assert.deepStrictEqual(res, exp)
  })

  it('can report working hours for a single day', function () {
    const tsk = new Task({ now: true })
    const tasks = new Tasks(tsk.date + ' 09:00 start\n' + tsk.date + ' 17:00 end\n')
    const report = new Report(tasks)
    const res = report.time()
    const exp = { sum: 8 }
    exp[tsk.date] = 8

    assert.deepStrictEqual(res, exp)
  })

  it('can report for a number of days', function () {
    const tasks = new Tasks(testTasks)
    const report = new Report(tasks)
    const tmp = fromTo('2015-04-01', '2015-05-13')
    const res = report.time('day', tmp.from, tmp.to)
    const exp = {
      '2015-04-01': 8,
      '2015-04-02': 8,
      '2015-05-12': 10,
      sum: 26
    }

    assert.deepStrictEqual(res, exp)
  })

  it('can report for a single week', function () {
    const tsk = new Task({ now: true })
    const tasks = new Tasks(tsk.date + ' 09:00 start\n' + tsk.date + ' 17:00 end\n')
    const report = new Report(tasks)
    const res = report.time('week')
    const exp = { sum: 8 }

    exp['CW' + tsk.week] = 8

    assert.deepStrictEqual(res, exp)
  })

  it('can report for a number of weeks', function () {
    const tasks = new Tasks(testTasks)
    const report = new Report(tasks)
    const tmp = fromTo('2015-04-01', '2015-05-13')
    const res = report.time('week', tmp.from, tmp.to)
    const exp = {
      CW14: 16,
      CW20: 10,
      sum: 26
    }

    assert.deepStrictEqual(res, exp)
  })

  it('can report for a single month', function () {
    const tsk = new Task({ now: true })
    const tasks = new Tasks(tsk.date + ' 09:00 start\n' + tsk.date + ' 17:00 end\n')
    const report = new Report(tasks)
    const res = report.time('month')
    const exp = { sum: 8 }

    exp[tsk.month] = 8

    assert.deepStrictEqual(res, exp)
  })

  it('can report for a number of months', function () {
    const tasks = new Tasks(testTasks)
    const report = new Report(tasks)
    const tmp = fromTo('2015-04-01', '2015-05-13')
    const res = report.time('month', tmp.from, tmp.to)
    const exp = { sum: 26, '2015-04': 16, '2015-05': 10 }

    assert.deepStrictEqual(res, exp)
  })

  it('can report projects for a single day', function () {
    const tsk = new Task({ now: true })
    const tasks = new Tasks(tsk.date + ' 09:00 prj desc\n' + tsk.date + ' 17:00 end\n')
    const report = new Report(tasks)
    const res = report.prjTime()
    const exp = { sum: 8 }

    exp[tsk.date] = { prj: 8 }
    assert.deepStrictEqual(res, exp)
  })

  it('can report projects for a number of days', function () {
    const tasks = new Tasks(testTasks)
    const report = new Report(tasks)
    const tmp = fromTo('2015-04-01', '2015-05-13')
    const res = report.prjTime('day', tmp.from, tmp.to)
    const exp = {
      sum: 26,
      '2015-04-01': { prj: 8 },
      '2015-04-02': { prj: 4, org: 4 },
      '2015-05-12': { new: 10 }
    }

    assert.deepStrictEqual(res, exp)
  })

  it('can report projects for a number of days including pause', function () {
    const tasks = new Tasks(testTasks)
    const report = new Report(tasks)
    const tmp = fromTo('2015-04-01', '2015-05-13')
    const res = report.prjTime('day', tmp.from, tmp.to, '*,pause')
    const exp = {
      sum: 26,
      '2015-04-01': { prj: 8, pause: 1 },
      '2015-04-02': { prj: 4, pause: 1, org: 4 },
      '2015-05-12': { new: 10 }
    }

    assert.deepStrictEqual(res, exp)
  })

  it('can report projects for a number of months', function () {
    const tasks = new Tasks(testTasks)
    const report = new Report(tasks)
    const tmp = fromTo('2015-04-01', '2015-05-13')
    const res = report.prjTime('month', tmp.from, tmp.to)
    const exp = {
      sum: 26,
      '2015-04': { prj: 12, org: 4 },
      '2015-05': { new: 10 }
    }

    assert.deepStrictEqual(res, exp)
  })

  it('can report projects for a partial week', function () {
    const tasks = new Tasks(testTasks)
    const report = new Report(tasks)
    const tmp = fromTo('2015-06-01', '2015-06-02')
    const res = report.prjTime('week', tmp.from, tmp.to, '*')
    const exp = {
      sum: 16,
      CW23p: { prj: 16 }
    }

    assert.deepStrictEqual(res, exp)
  })

  it('can report project "prj" for a number of days', function () {
    const tasks = new Tasks(testTasks)
    const report = new Report(tasks)
    const tmp = fromTo('2015-04-01', '2015-05-13')
    const res = report.prjTime('day', tmp.from, tmp.to, 'prj')
    const exp = {
      sum: 12,
      '2015-04-01': { prj: 8 },
      '2015-04-02': { prj: 4 }
    }

    assert.deepStrictEqual(res, exp)
  })

  it('can report project "prj" for a number of weeks', function () {
    const tasks = new Tasks(testTasks)
    const tmp = fromTo('2015-04-01', '2015-05-13')
    const report = new Report(tasks)
    const res = report.prjTime('week', tmp.from, tmp.to, 'prj')
    const exp = { CW14: { prj: 12 }, sum: 12 }

    assert.deepStrictEqual(res, exp)
  })

  it('can report project "prj" for a number of months', function () {
    const tasks = new Tasks(testTasks)
    const report = new Report(tasks)
    const tmp = fromTo('2015-04-01', '2015-05-13')
    const res = report.prjTime('month', tmp.from, tmp.to, 'prj')
    const exp = { sum: 12, '2015-04': { prj: 12 } }

    assert.deepStrictEqual(res, exp)
  })

  it('can report time to leave for one day in advance', function () {
    const t =
  '2015-05-28\t08:00\tprj\n' +
  '2015-05-28\t12:00\tpause\n' +
  '2015-05-28\t12:30\tprj\n'
    const clock = sinon.useFakeTimers(+(new Date('2015-05-28T11:00:00')))
    const tasks = new Tasks(t)
    const report = new Report(tasks)
    const tmp = report.todayTimeLeft({ daily: 8, weekly: 40 })
    const res = tmp.format('HH:mm')
    const exp = '16:30'

    clock.restore()
    assert.deepStrictEqual(res, exp)
  })

  it('can report time to leave for one day', function () {
    const t =
      '2015-05-28\t08:00\tprj\n' +
      '2015-05-28\t12:00\tpause\n' +
      '2015-05-28\t12:30\tprj\n'
    const clock = sinon.useFakeTimers(+(new Date('2015-05-28T15:00:00')))
    const tasks = new Tasks(t)
    const report = new Report(tasks)
    const tmp = report.todayTimeLeft({ daily: 8, weekly: 40 })
    const res = tmp.format('HH:mm')
    const exp = '16:30'

    clock.restore()
    assert.deepStrictEqual(res, exp)
  })

  it('can report time to leave for last day of week', function () {
    const clock = sinon.useFakeTimers(+(new Date('2015-06-05T11:00:00')))
    const tasks = new Tasks(testTasks)
    const report = new Report(tasks)
    const tmp = report.todayTimeLeft({ daily: 8, weekly: 40 })
    const res = tmp.format('HH:mm')
    const exp = '14:30'

    clock.restore()
    assert.deepStrictEqual(res, exp)
  })

  it('can report time to leave for last day of week making overtime', function () {
    const clock = sinon.useFakeTimers(+(new Date('2015-06-05T15:00:00')))
    const tasks = new Tasks(testTasks)
    const report = new Report(tasks)
    const tmp = report.todayTimeLeft({ daily: 8, weekly: 40 })
    const res = tmp.format('HH:mm')
    const exp = '14:30'

    clock.restore()
    assert.deepStrictEqual(res, exp)
  })

  describe('selectProjects', function () {
    const selectProjects = Report.selectProjects

    it('can deselect pause per default', function () {
      const res = selectProjects()
      assert.deepStrictEqual(res, { pause: false })
    })

    it('can select prj', function () {
      const res = selectProjects(['prj'])
      assert.deepStrictEqual(res, { prj: true, pause: false })
    })

    it('can select prj and pause', function () {
      const res = selectProjects(['prj', 'pause'])
      assert.deepStrictEqual(res, { prj: true, pause: true })
    })

    it('can deselect prj', function () {
      const res = selectProjects(['-prj'])
      assert.deepStrictEqual(res, { prj: false, pause: false })
    })

    it('can deselect prj and select pause', function () {
      const res = selectProjects(['-prj', 'pause'])
      assert.deepStrictEqual(res, { prj: false, pause: true })
    })
  })
})
