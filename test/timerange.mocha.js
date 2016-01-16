'use strict'

/* global describe, it, before, after */

var moment = require('moment')
var assert = require('assert')
var sinon  = require('sinon')
var fromTo  = require('../lib/timerange')

var assertRes = function (res, exp) {
	assert.equal(res.from.format(), exp.from)
	assert.equal(res.to.format()  , exp.to)
}

describe('#fromto', function(){
	var clock

	before(function(){
		var start = moment('2015-07-17 17:00:00Z').utc().valueOf()
		clock = sinon.useFakeTimers(start)
	})

	after(function(){
		clock.restore()
	})

	it('can set timerange for today if from and to are undefined', function(){
		var res = fromTo()
		var exp = {
			from: '2015-07-17T00:00:00+02:00',
			to  : '2015-07-18T00:00:00+02:00'
		}
		//~ console.log(res)
		assertRes(res, exp)
	})

	it('can set timerange from "from" until "today" if only from is defined', function(){
		var res = fromTo('2015-07-10')
		var exp = {
			from: '2015-07-10T00:00:00+02:00',
			to  : '2015-07-18T00:00:00+02:00'
		}
		//~ console.log(res)
		assertRes(res, exp)
	})

	it('can set timerange from "from" until "to"', function(){
		var res = fromTo('2015-06-29', '2015-07-10')
		var exp = {
			from: '2015-06-29T00:00:00+02:00',
			to  : '2015-07-11T00:00:00+02:00'
		}
		//~ console.log(res)
		assertRes(res, exp)
	})

	it('can correct timerange from "to" until "from"', function(){
		var res = fromTo('2015-07-10', '2015-06-29')
		var exp = {
			from: '2015-06-29T00:00:00+02:00',
			to  : '2015-07-11T00:00:00+02:00'
		}
		//~ console.log(res)
		assertRes(res, exp)
	})

	it('can set timerange from "from" until "to" using short format', function(){
		var res = fromTo('06-29', '07-10')
		var exp = {
			from: '2015-06-29T00:00:00+02:00',
			to  : '2015-07-11T00:00:00+02:00'
		}
		//~ console.log(res)
		assertRes(res, exp)
	})

	it('can set relative timerange for last day', function(){
		var res = fromTo(undefined, '1d')
		var exp = {
			from: '2015-07-16T00:00:00+02:00',
			to  : '2015-07-17T00:00:00+02:00'
		}
		//~ console.log(res)
		assertRes(res, exp)
	})

	it('can set relative timerange for current week', function(){
		var res = fromTo(undefined, '0w')
		var exp = {
			from: '2015-07-13T00:00:00+02:00',
			to  : '2015-07-20T00:00:00+02:00'
		}
		//~ console.log(res)
		assertRes(res, exp)
	})

	it('can set relative timerange for last week', function(){
		var res = fromTo(undefined, '1w')
		var exp = {
			from: '2015-07-06T00:00:00+02:00',
			to  : '2015-07-13T00:00:00+02:00'
		}
		//~ console.log(res)
		assertRes(res, exp)
	})

	it('can set relative timerange for previous last week', function(){
		var res = fromTo(undefined, '2w')
		var exp = {
			from: '2015-06-29T00:00:00+02:00',
			to  : '2015-07-06T00:00:00+02:00'
		}
		//~ console.log(res)
		assertRes(res, exp)
	})

	it('can set relative timerange for last month', function(){
		var res = fromTo(undefined, '1m')
		var exp = {
			from: '2015-06-01T00:00:00+02:00',
			to  : '2015-07-01T00:00:00+02:00'
		}
		//~ console.log(res)
		assertRes(res, exp)
	})
})
