'use strict';

/* global describe, it */

var
	fs = require('fs'),
	path = require('path'),
	assert = require('assert'),
	Task = require('../lib/task'),
	Tasks = require('../lib/tasks'),
	Report = require('../lib/report'),
	fromTo = require('../lib/timerange');

var testTasks = fs.readFileSync(path.join(__dirname, 'fixtures', 'test.log'), 'utf8');

describe('#Report', function() {

	it ('can loop over days', function(){
		var report = new Report(),
			tmp = fromTo('2015-02-25', '2015-03-02'),
			res = report._loop(tmp.from, tmp.to),
			exp = [
				'2015-02-25',
				'2015-02-26',
				'2015-02-27',
				'2015-02-28',
				'2015-03-01',
				'2015-03-02'
			];

		assert.deepEqual(res,exp);
	});

	it ('can loop over weeks', function(){
		var report = new Report(),
			tmp = fromTo('2015-02-01', '2015-03-02'),
			res = report._loop(tmp.from, tmp.to, 'week'),
			exp = [ 5, 6, 7, 8, 9 ];

		assert.deepEqual(res,exp);
	});

	it ('can loop over months', function(){
		var report = new Report(),
			tmp = fromTo('2015-02-01', '2015-03-02'),
			res = report._loop(tmp.from, tmp.to, 'month'),
			exp = [ '2015-02', '2015-03' ];

		assert.deepEqual(res,exp);
	});

	it ('can report working hours for a single day', function(){
		var tsk = new Task({now: true}),
			tasks = new Tasks({tasks: tsk.date + ' 09:00 start\n' + tsk.date + ' 17:00 end\n' }),
			report = new Report(tasks),
			res = report.time(),
			exp = { 'sum': 8 };
			exp[tsk.date] = 8;

		assert.deepEqual(res, exp);
	});

	it ('can report for a number of days', function(){
		var tasks = new Tasks({tasks: testTasks }),
			report = new Report(tasks),
			tmp = fromTo('2015-04-01', '2015-05-13'),
			res = report.time('day', tmp.from, tmp.to),
			exp =  {
				'2015-04-01': 8,
				'2015-04-02': 8,
				'2015-05-12': 10,
				'sum': 26
			};

		assert.deepEqual(res, exp);
	});

	it ('can report for a single week', function(){
		var tsk = new Task({now: true}),
			tasks = new Tasks({tasks: tsk.date + ' 09:00 start\n' + tsk.date + ' 17:00 end\n' }),
			report = new Report(tasks),
			res = report.time('week'),
			exp = {'sum': 8};

		exp['CW'+tsk.week] = 8;

		assert.deepEqual(res, exp);
	});

 	it ('can report for a number of weeks', function(){
		var tasks = new Tasks({tasks: testTasks }),
			report = new Report(tasks),
			tmp = fromTo('2015-04-01', '2015-05-13'),
			res = report.time('week', tmp.from, tmp.to),
			exp = {
				CW14: 16,
				CW20: 10,
				'sum': 26
			};

		assert.deepEqual(res, exp);
	});

	it ('can report for a single month', function(){
		var tsk = new Task({now: true}),
			tasks = new Tasks({tasks: tsk.date + ' 09:00 start\n' + tsk.date + ' 17:00 end\n' }),
			report = new Report(tasks),
			res = report.time('month'),
			exp =  { sum: 8 };

		exp[tsk.month] = 8;

		assert.deepEqual(res, exp);
	});

 	it ('can report for a number of months', function(){
		var tasks = new Tasks({tasks: testTasks }),
			report = new Report(tasks),
			tmp = fromTo('2015-04-01', '2015-05-13'),
			res = report.time('month', tmp.from, tmp.to),
			exp = { sum: 26, '2015-04': 16, '2015-05': 10 };

		assert.deepEqual(res, exp);
	});

	it ('can report projects for a single day', function(){
		var tsk = new Task({now: true}),
			tasks = new Tasks({tasks: tsk.date + ' 09:00 prj desc\n' + tsk.date + ' 17:00 end\n' }),
			report = new Report(tasks),
			res = report.prjTime(),
			exp = { sum: 8 };

		exp[tsk.date] = { prj: 8 };
		assert.deepEqual(res, exp);
	});

	it ('can report projects for a number of days', function(){
		var tasks = new Tasks({tasks: testTasks }),
			report = new Report(tasks),
			tmp = fromTo('2015-04-01', '2015-05-13'),
			res = report.prjTime('day', tmp.from, tmp.to),
			exp =  {
				'sum': 26,
				'2015-04-01': { prj: 8, pause: 1 },
				'2015-04-02': { prj: 4, pause: 1, org: 4 },
				'2015-05-12': { new: 10 }
			};

		assert.deepEqual(res, exp);
	});

	it ('can report projects for a number of months', function(){
		var tasks = new Tasks({tasks: testTasks }),
			report = new Report(tasks),
			tmp = fromTo('2015-04-01', '2015-05-13'),
			res = report.prjTime('month', tmp.from, tmp.to),
			exp =  {
				sum: 26,
				'2015-04': { prj: 12, pause: 2, org: 4 },
				'2015-05': { new: 10 }
			};

		assert.deepEqual(res, exp);
	});

	it ('can report project "prj" for a number of days', function(){
		var tasks = new Tasks({tasks: testTasks }),
			report = new Report(tasks),
			tmp = fromTo('2015-04-01', '2015-05-13'),
			res = report.prjTime('day', tmp.from, tmp.to, 'prj'),
			exp =  {
				sum: 12,
				'2015-04-01': { prj: 8 },
				'2015-04-02': { prj: 4 }
			};

		assert.deepEqual(res, exp);
	});

	it ('can report project "prj" for a number of weeks', function(){
		var tasks = new Tasks({tasks: testTasks }),
			tmp = fromTo('2015-04-01', '2015-05-13'),
			report = new Report(tasks),
			res = report.prjTime('week',tmp.from, tmp.to, 'prj'),
			exp =  { 'CW14': { prj: 12 }, sum: 12 };

		assert.deepEqual(res, exp);
	});

	it ('can report project "prj" for a number of months', function(){
		var tasks = new Tasks({tasks: testTasks }),
			report = new Report(tasks),
			tmp = fromTo('2015-04-01', '2015-05-13'),
			res = report.prjTime('month', tmp.from, tmp.to, 'prj'),
			exp =  { sum: 12, '2015-04': { prj: 12 } };

		assert.deepEqual(res, exp);
	});
});