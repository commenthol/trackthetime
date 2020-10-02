const assert = require('assert')
const sinon = require('sinon')
const { rfcDate, timeOrDuration } = require('../lib/rfcDate')

describe('rfcDate', function () {
  describe('rfcDate', function () {
    let clock

    before(function () {
      clock = sinon.useFakeTimers(new Date('2015-07-17 17:00:00Z'))
    })

    after(function () {
      clock.restore()
    })

    it('dmy 1.2', function () {
      assert.strictEqual(rfcDate('1.2'), '2015-02-01')
    })
    it('dmy 1.2.', function () {
      assert.strictEqual(rfcDate('1.2.'), '2015-02-01')
    })
    it('dmy 01.08', function () {
      assert.strictEqual(rfcDate('01.02'), '2015-02-01')
    })
    it('dmy 31.13', function () {
      assert.strictEqual(rfcDate('31.13'), '2016-01-31')
    })
    it('dmy 29.2.19 -> 2019-03-01', function () {
      assert.strictEqual(rfcDate('29.2.19'), '2019-03-01')
    })
    it('dmy 29/2/2019 -> 2019-03-01', function () {
      assert.strictEqual(rfcDate('29/2/2019'), '2019-03-01')
    })

    it('iso 2-1', function () {
      assert.strictEqual(rfcDate('2-1'), '2015-02-01')
    })
    it('iso 8-15', function () {
      assert.strictEqual(rfcDate('8-15'), '2015-08-15')
    })
    it('iso 13-31', function () {
      assert.strictEqual(rfcDate('13-31'), '2016-01-31')
    })
    it('iso 07-10', function () {
      assert.strictEqual(rfcDate('07-10'), '2015-07-10')
    })
    it('iso 2019-02-29 -> 2019-03-01', function () {
      assert.strictEqual(rfcDate('2019-02-29'), '2019-03-01')
    })

    it('1.1.000000 fails', function () {
      assert.strictEqual(rfcDate('1.1.000000'), undefined)
    })
    it('foobar fails', function () {
      assert.strictEqual(rfcDate('foobar'), undefined)
    })
  })

  describe('timeOrDuration', function () {
    it('10 in minutes', function () {
      assert.deepStrictEqual(timeOrDuration('10'), ['00:10'])
    })
    it('999 in hours minutes', function () {
      assert.deepStrictEqual(timeOrDuration('999'), ['16:39'])
    })
    it('+90', function () {
      assert.deepStrictEqual(timeOrDuration('+90'), [undefined, 5400])
    })
    it('+1:45', function () {
      assert.deepStrictEqual(timeOrDuration('+2:15'), [undefined, 8100])
    })
    it('foo fails', function () {
      assert.deepStrictEqual(timeOrDuration('foo'), [])
    })
  })
})
