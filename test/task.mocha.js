'use strict';

/* global describe, it */

var
	assert = require('assert'),
	assertMap = require('./lib/helper').assertMap,
	Task = require('../lib/task');

describe('#Task', function() {

	it ('can create task for now', function() {
		var task = new Task();
		task.now();
		//~ console.log(task)

		assert.ok(/^\d{4}-\d{2}-\d{2}/.test(task.date));
		assert.ok(/^\d{2}:\d{2}/.test(task.time));
	});

	it ('can update to a date', function() {
		var task = new Task();
		task.update('2015-08-07', '22:11');

		var exp = {
			date: '2015-08-07',
			time: '22:11',
			utc: 1438978260000,
			week: 32,
		};

		assertMap(task, exp);
	});

	it ('can add a project description', function() {
		var exp = {
			date: '2015-08-07',
			time: '22:11',
			utc: 1438978260000,
			week: 32,
			project: 'myprj',
			description: 'a description describing that task'
		};
		var task = new Task();

		task.update('2015-08-07', '22:11');
		task.addProject('myprj', 'a description describing that task');

		assertMap(task, exp);
	});

	it ('can calculate a duration', function() {
		var task = new Task({date: '2015-08-07', time: '23:55'});
		var task2 = new Task();
		task2.update('2015-08-08', '00:05');
		task.calcDuration(task2);

		var exp = {
			duration: 600
		};

		assertMap(task, exp);
	});

	it ('only accepts a valid date', function() {
		var exp = {
			date: '2015-08-07',
			time: '23:55',
		};
		var task = new Task({date: exp.date, time: exp.time});

		assert.ok(!task.update('11-23'));
		assertMap(task, exp);
	});

	it ('only accepts a valid time', function() {
		var exp = {
			date: '2015-08-07',
			time: '23:55',
		};
		var task = new Task({date: '2015-08-07', time: '23:55'});

		assert.ok(!task.update(undefined, '26:3'));
		assertMap(task, exp);
	});

	it ('can convert a task to string', function(){
		var task = new Task({date: '2015-08-07', time: '23:55', project: 'prj', description: 'a description'});
		var res = task.toString();
		var exp = '2015-08-07\t23:55\tprj\ta description';

		assert.strictEqual(res, exp);
	});

});