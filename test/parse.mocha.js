'use strict';

/* global describe, it */

var
	assertMap = require('./lib/helper').assertMap,
	Task = require('../lib/task'),
	parse = require('../lib/parse');

describe('#parse', function() {

	describe('line', function(){

		it ('can parse a line', function(){
			var res = parse.line('2015-08-07	22:11	prj	a description of what we have done');

			var exp = { date: '2015-08-07',
				time: '22:11',
				project: 'prj',
				description: 'a description of what we have done',
				utc: 1438978260000,
				week: 32
			};

			assertMap(res, exp);
		});

		it ('can parse a line with tabs in description', function(){
			var res = parse.line('2015-01-07	22:11	prj	a	description of what we	have done');

			var exp = { date: '2015-01-07',
				time: '22:11',
				project: 'prj',
				description: 'a description of what we have done',
				utc: 1420665060000,
				week: 2
			};

			assertMap(res, exp);
		});

		it ('can ignore comments', function(){
			var res = parse.line('# this is a comment');

			var exp = {
				isComment: true
			};
			assertMap(res, exp);
		});

		it ('can detect wrong line 1', function(){
			var res = parse.line('this is a comment');
			var exp = { isValid: false };

			assertMap(res, exp);
		});

		it ('can detect wrong line 2', function(){
			var res = parse.line('this');
			var exp = { isValid: false };

			assertMap(res, exp);
		});

		it ('can detect bad date', function(){
			var res = parse.line('2015-111-07	22:11	prj	a	description of what we	have done');
			var exp = { isValid: false };

			assertMap(res, exp);
		});

		it ('can detect bad time', function(){
			var res = parse.line('2015-01-07	122:11	prj	a	description of what we	have done');
			var exp = { isValid: false };

			assertMap(res, exp);
		});

	});

	describe('newLine', function(){
		it ('can add a new line without a date', function(){
			var task = new Task({now: true});
			var res = parse.newLine(['prj','a','description']);
			var exp = {
				date: task.date,
				time: task.time,
				project: 'prj',
				description: 'a description'
			};

			assertMap(res, exp);
		});

		it ('can add a new line with time', function(){
			var res = parse.newLine(['12:12', 'prj','a','description']);
			var exp = {
				time: '12:12',
				project: 'prj',
				description: 'a description'
			};

			assertMap(res, exp);
		});

		it ('can add a new line with date', function(){
			var res = parse.newLine(['2015-02-01', 'prj','a','description']);
			var exp = {
				date: '2015-02-01',
				project: 'prj',
				description: 'a description'
			};

			assertMap(res, exp);
		});

		it ('can add a new line with date without year', function(){
			var res = parse.newLine(['12-01', 'prj','a','description']);
			var exp = {
				date: '2015-12-01',
				project: 'prj',
				description: 'a description'
			};

			assertMap(res, exp);
		});

		it ('can add a new line with date and time', function(){
			var res = parse.newLine(['2015-02-01', '12:15', 'prj','a','description']);
			var exp = {
				date: '2015-02-01',
				time: '12:15',
				project: 'prj',
				description: 'a description'
			};

			assertMap(res, exp);
		});

	});
});