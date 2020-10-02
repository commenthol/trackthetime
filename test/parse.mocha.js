'use strict'

/* global describe, it */

const assertMap = require('./lib/helper').assertMap
const Task = require('../lib/task')
const parse = require('../lib/parse')

describe('#parse', function () {
  describe('line', function () {
    it('can parse a line', function () {
      const res = parse.line('2015-08-07\t22:11\tprj\ta description of what we have done')

      const exp = {
        date: '2015-08-07',
        time: '22:11',
        project: 'prj',
        description: 'a description of what we have done',
        utc: 1438978260000,
        week: 32
      }

      assertMap(res, exp)
    })

    it('can parse a line with tabs in description', function () {
      const res = parse.line('2015-01-07\t22:11\tprj\ta\tdescription of what we\thave done')

      const exp = {
        date: '2015-01-07',
        time: '22:11',
        project: 'prj',
        description: 'a description of what we have done',
        utc: 1420665060000,
        week: 2
      }

      assertMap(res, exp)
    })

    it('can ignore comments', function () {
      const res = parse.line('# this is a comment')

      const exp = {
        isComment: true
      }
      assertMap(res, exp)
    })

    it('can detect wrong line 1', function () {
      const res = parse.line('this is a comment')
      const exp = { isValid: false }

      assertMap(res, exp)
    })

    it('can detect wrong line 2', function () {
      const res = parse.line('this')
      const exp = { isValid: false }

      assertMap(res, exp)
    })

    it('can skip line with spaces', function () {
      const res = parse.line('\t')
      const exp = { isComment: true }

      assertMap(res, exp)
    })

    it('can detect bad date', function () {
      const res = parse.line('2015-111-07\t22:11\tprj\ta\tdescription of what we\thave done')
      const exp = { isValid: false }

      assertMap(res, exp)
    })

    it('can detect bad time', function () {
      const res = parse.line('2015-01-07\t122:11\tprj\ta\tdescription of what we\thave done')
      const exp = { isValid: false }

      assertMap(res, exp)
    })
  })

  describe('newLine', function () {
    it('can add a new line without a date', function () {
      const now = new Task({ now: true })
      const res = parse.newLine(['prj', 'a', 'description'])
      const exp = {
        date: now.date,
        time: now.time,
        project: 'prj',
        description: 'a description'
      }

      assertMap(res, exp)
    })

    it('can add a new line with time', function () {
      const res = parse.newLine(['12:12', 'prj', 'a', 'description'])
      const exp = {
        time: '12:12',
        project: 'prj',
        description: 'a description'
      }

      assertMap(res, exp)
    })

    it('can add a new line with time in short form', function () {
      const res = parse.newLine(['8:1', 'prj', 'a', 'description'])
      const exp = {
        time: '08:01',
        project: 'prj',
        description: 'a description'
      }

      assertMap(res, exp)
    })

    it('can add a new line with date', function () {
      const res = parse.newLine(['2015-02-01', 'prj', 'a', 'description'])
      const exp = {
        date: '2015-02-01',
        project: 'prj',
        description: 'a description'
      }

      assertMap(res, exp)
    })

    it('can add a new line with date without year', function () {
      const res = parse.newLine(['12-15', 'prj', 'a', 'description'])
      const exp = {
        date: (new Date()).getFullYear() + '-12-15',
        project: 'prj',
        description: 'a description'
      }

      assertMap(res, exp)
    })

    it('can add a new line with date without year short form', function () {
      const res = parse.newLine(['5-1', 'prj', 'a', 'description'])
      const exp = {
        date: (new Date()).getFullYear() + '-05-01',
        project: 'prj',
        description: 'a description'
      }

      assertMap(res, exp)
    })

    it('can add a new line with date and time', function () {
      const res = parse.newLine(['2015-02-01', '12:15', 'prj', 'a', 'description'])
      const exp = {
        date: '2015-02-01',
        time: '12:15',
        project: 'prj',
        description: 'a description'
      }

      assertMap(res, exp)
    })

    it('can add a new line with 1:30 h duration', function () {
      const now = new Task({ now: true })
      const res = parse.newLine(['+1:30', 'prj', 'a', 'description'])
      const exp = {
        date: now.date,
        time: now.time,
        project: 'prj',
        description: 'a description',
        duration: 5400
      }

      assertMap(res, exp)
    })

    it('ignores weird dates 99-99-99', function () {
      const res = parse.newLine(['99-99-99'])
      assertMap(res, undefined)
    })

    it('ignores weird dates 9-99', function () {
      const res = parse.newLine(['9-99'])
      assertMap(res, undefined)
    })
  })
})
