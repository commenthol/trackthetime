'use strict'

/* global describe, it, before, after */

const moment = require('moment')
const assert = require('assert')
const sinon = require('sinon')
const fromTo = require('../lib/timerange')

const assertRes = function (res, exp) {
  assert.strictEqual(res.from.format(), exp.from)
  assert.strictEqual(res.to.format(), exp.to)
}

describe('#fromto', function () {
  let clock

  before(function () {
    const start = moment('2015-07-17 17:00:00Z').utc().valueOf()
    clock = sinon.useFakeTimers(start)
  })

  after(function () {
    clock.restore()
  })

  it('can set timerange for today if from and to are undefined', function () {
    const res = fromTo()
    const exp = {
      from: '2015-07-17T00:00:00+02:00',
      to: '2015-07-18T00:00:00+02:00'
    }
    // ~ console.log(res)
    assertRes(res, exp)
  })

  it('can set timerange from "from" until "today" if only from is defined', function () {
    const res = fromTo('2015-07-10')
    const exp = {
      from: '2015-07-10T00:00:00+02:00',
      to: '2015-07-18T00:00:00+02:00'
    }
    // ~ console.log(res)
    assertRes(res, exp)
  })

  it('can set timerange from "from" until "to"', function () {
    const res = fromTo('2015-06-29', '2015-07-10')
    const exp = {
      from: '2015-06-29T00:00:00+02:00',
      to: '2015-07-11T00:00:00+02:00'
    }
    // ~ console.log(res)
    assertRes(res, exp)
  })

  it('can correct timerange from "to" until "from"', function () {
    const res = fromTo('2015-07-10', '2015-06-29')
    const exp = {
      from: '2015-06-29T00:00:00+02:00',
      to: '2015-07-11T00:00:00+02:00'
    }
    // ~ console.log(res)
    assertRes(res, exp)
  })

  it('can set timerange from "from" until "to" using short format', function () {
    const res = fromTo('06-29', '07-10')
    const exp = {
      from: '2015-06-29T00:00:00+02:00',
      to: '2015-07-11T00:00:00+02:00'
    }
    // ~ console.log(res)
    assertRes(res, exp)
  })

  it('can set relative timerange for last day', function () {
    const res = fromTo(undefined, '1d')
    const exp = {
      from: '2015-07-16T00:00:00+02:00',
      to: '2015-07-17T00:00:00+02:00'
    }
    // ~ console.log(res)
    assertRes(res, exp)
  })

  it('can set relative timerange for current week', function () {
    const res = fromTo(undefined, '0w')
    const exp = {
      from: '2015-07-13T00:00:00+02:00',
      to: '2015-07-20T00:00:00+02:00'
    }
    // ~ console.log(res)
    assertRes(res, exp)
  })

  it('can set relative timerange for last week', function () {
    const res = fromTo(undefined, '1w')
    const exp = {
      from: '2015-07-06T00:00:00+02:00',
      to: '2015-07-13T00:00:00+02:00'
    }
    // ~ console.log(res)
    assertRes(res, exp)
  })

  it('can set relative timerange for previous last week', function () {
    const res = fromTo(undefined, '2w')
    const exp = {
      from: '2015-06-29T00:00:00+02:00',
      to: '2015-07-06T00:00:00+02:00'
    }
    // ~ console.log(res)
    assertRes(res, exp)
  })

  it('can set relative timerange for last month', function () {
    const res = fromTo(undefined, '1m')
    const exp = {
      from: '2015-06-01T00:00:00+02:00',
      to: '2015-07-01T00:00:00+02:00'
    }
    // ~ console.log(res)
    assertRes(res, exp)
  })
})
