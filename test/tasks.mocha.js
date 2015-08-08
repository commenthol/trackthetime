'use strict';

/* global describe, it */

var
	fs = require('fs'),
	path = require('path'),
	assert = require('assert'),
	Tasks = require('../lib/tasks');

var testTasks = fs.readFileSync(path.join(__dirname, 'fixtures', 'test.log'), 'utf8');

describe('#Tasks', function() {

	it ('can split tasks', function(){
		var tasks = new Tasks({tasks: testTasks});
		//~ console.log(tasks)
		assert.equal(tasks.tasks.length, 12);
	});

	it ('can convert tasks to human readable format', function(){
		var tasks = new Tasks({tasks: testTasks});
		var res = tasks.toString();
		//~ fs.writeFileSync(path.join(__dirname, 'fixtures', 'testExp.log'), tasks.toString(), 'utf8');
		var exp = fs.readFileSync(path.join(__dirname, 'fixtures', 'testExp.log'), 'utf8');

		assert.equal(res, exp);
	});

	it ('can read tasks from file', function(done){
		var tasks = new Tasks();
		tasks.read(path.join(__dirname, 'fixtures', 'testExp.log'), function() {
			assert.equal(tasks.tasks.length, 12);
			done();
		});

	});

	it ('can read and write tasks from file', function(done){
		var tasks = new Tasks();

		tasks.read(path.join(__dirname, 'fixtures', 'testExp.log'), function(err){
			assert.ok(!err, ''+err);

			tasks.write(path.join(__dirname, 'fixtures', 'testWrite.log'), function(err){
				assert.ok(!err, ''+err);

				var res = fs.readFileSync(path.join(__dirname, 'fixtures', 'testWrite.log'), 'utf8');
				var exp = tasks.toString();

				assert.equal(res, exp);

				done();
			});
		});
	});
});