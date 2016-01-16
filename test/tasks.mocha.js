'use strict'

/* global describe, it */

var fs = require('fs')
var path = require('path')
var assert = require('assert')
var Tasks = require('../lib/tasks')
var file = require('../lib/file')

var testTasks = fs.readFileSync(path.join(__dirname, 'fixtures', 'test.log'), 'utf8')

describe('#Tasks', function() {

	it('can add tasks', function(){
		var tasks = new Tasks(testTasks)
		assert.equal(tasks.tasks.length, 21)
	})

	it('can split tasks', function(){
		var tasks = new Tasks()
		tasks.split(testTasks)
		assert.equal(tasks.tasks.length, 21)
	})

	it('can convert tasks to human readable format', function () {
		var tasks = new Tasks()
		var err = tasks.split(testTasks)
		var res = tasks.toString()
		//~ fs.writeFileSync(path.join(__dirname, 'fixtures', 'testExp.log'), tasks.toString(), 'utf8')
		var exp = fs.readFileSync(path.join(__dirname, 'fixtures', 'testExp.log'), 'utf8')

		assert.ok(!err, '' + err)
		assert.equal(res, exp)
	})

	it('can read and write tasks from file', function (done) {
		var tasks = new Tasks()

		file.read(path.join(__dirname, 'fixtures', 'testExp.log'), function (err, data){
			assert.ok(!err, ''+err)

			err = tasks.split(data)
			assert.ok(!err, ''+err)

			file.write(path.join(__dirname, 'fixtures', 'testWrite.log'), tasks.toString(), function (err) {
				assert.ok(!err, ''+err)

				var res = fs.readFileSync(path.join(__dirname, 'fixtures', 'testWrite.log'), 'utf8')
				var exp = tasks.toString()

				assert.equal(res, exp)

				done()
			})
		})
	})

	it('can append a new task', function () {
		var tasks = new Tasks()
		var args = ['2015-06-01', '9:00', 'start']
		var res = tasks.append(args).str
		var exp = '2015-06-01\t09:00\tstart\t\n'
		assert.equal(res, exp)
	})

	it('can append a full day for vacation', function () {
		var tasks = new Tasks()
		var args = ['2015-06-01', 'vacation']
		var res = tasks.append(args).str
		var exp =
			'2015-06-01\t09:00\tvacation\t\n' +
			'2015-06-01\t17:00\tend\t\n\n'
		assert.equal(res, exp)
	})

	it('can insert a task with a duration', function () {
		var t =
			'2015-06-01\t09:00\tdooh\tmake my day\n' +
			'2015-06-01\t10:00\t1stCoffee\twith donut\n' +
			'2015-06-01\t11:00\t2ndCoffee\t\n' +
			'2015-06-01\t12:00\tpause\t\n' +
			'2015-06-01\t13:00\t3rdCoffee\t\n'
		var tasks = new Tasks(t)
		var args = ['2015-06-01', '11:12', '+12', 'phone', 'Mr. Burns calling']
		var res = tasks.append(args).str
		var exp =
			'2015-06-01\t11:12\tphone\tMr. Burns calling\n' +
			'2015-06-01\t11:24\t2ndCoffee\t\n'
		assert.equal(res, exp)

		tasks.sort()
		res = tasks.toString()
		exp =
			'# CW 23\n' +
			'\n' +
			'2015-06-01\t09:00\tdooh\tmake my day\n' +
			'2015-06-01\t10:00\t1stCoffee\twith donut\n' +
			'2015-06-01\t11:00\t2ndCoffee\t\n' +
			'2015-06-01\t11:12\tphone\tMr. Burns calling\n' +
			'2015-06-01\t11:24\t2ndCoffee\t\n' +
			'2015-06-01\t12:00\tpause\t\n' +
			'2015-06-01\t13:00\t3rdCoffee\t\n' +
			''
		assert.equal(res, exp)
	})

	it('can insert a task without an ancestor', function () {
		var t =
			'2015-06-01\t09:00\tdooh\tmake my day\n' +
			'2015-06-01\t10:00\t1stCoffee\twith donut\n' +
			'2015-06-01\t11:00\t2ndCoffee\t\n' +
			'2015-06-01\t12:00\tpause\t\n' +
			'2015-06-01\t13:00\t3rdCoffee\t\n'
		var tasks = new Tasks(t)
		var args = ['2015-06-01', '08:02', '+42', 'phone', 'Mr. Burns calling']
		var res = tasks.append(args).str
		var exp =
			'2015-06-01\t08:02\tphone\tMr. Burns calling\n' +
			'2015-06-01\t08:44\t?\t\n'
		assert.equal(res, exp)

		res = tasks.sort().toString()
		exp =
			'# CW 23\n' +
			'\n' +
			'2015-06-01\t08:02\tphone\tMr. Burns calling\n' +
			'2015-06-01\t08:44\t?\t\n' +
			'2015-06-01\t09:00\tdooh\tmake my day\n' +
			'2015-06-01\t10:00\t1stCoffee\twith donut\n' +
			'2015-06-01\t11:00\t2ndCoffee\t\n' +
			'2015-06-01\t12:00\tpause\t\n' +
			'2015-06-01\t13:00\t3rdCoffee\t\n' +
			''
		assert.equal(res, exp)
	})

	it('can insert a task with duration which colides with successor task', function () {
		var t =
			'2015-06-01\t09:00\tdooh\tmake my day\n' +
			'2015-06-01\t10:00\t1stCoffee\twith donut\n' +
			'2015-06-01\t11:00\t2ndCoffee\t\n' +
			'2015-06-01\t12:00\tpause\t\n' +
			'2015-06-01\t13:00\t3rdCoffee\t\n'
		var tasks = new Tasks(t, {console: true})
		var args = ['2015-06-01', '10:30', '+42', 'phone', 'Mr. Burns calling']
		var res = tasks.append(args).str
		var exp =
			'2015-06-01\t10:30\tphone\tMr. Burns calling\n' +
			'#2015-06-01\t11:00\t2ndCoffee\t#DELETED#\n' +
			'2015-06-01\t11:12\t2ndCoffee\t\n'
		assert.equal(res, exp)

		res = tasks.sort().toString()
		// ~ console.log(JSON.stringify(res).replace(/(\\n)/g, '$1\' + \n\''))
		exp =
			'# CW 23\n' + 
			'\n' + 
			'2015-06-01\t09:00\tdooh\tmake my day\n' + 
			'2015-06-01\t10:00\t1stCoffee\twith donut\n' + 
			'2015-06-01\t10:30\tphone\tMr. Burns calling\n' + 
			'#2015-06-01\t11:00\t2ndCoffee\t#DELETED#\n' + 
			'2015-06-01\t11:12\t2ndCoffee\t\n' + 
			'2015-06-01\t12:00\tpause\t\n' + 
			'2015-06-01\t13:00\t3rdCoffee\t\n' + 
''
		assert.equal(res, exp)
	})

})
