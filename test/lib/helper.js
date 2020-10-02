'use strict'

var
  assert = require('assert')

const M = {

  /**
   * helper to assert only on properties of `exp`
   * @throws
   * @param {Object} res - result object
   * @param {Object} exp - expected object
   */
  assertMap: function (res, exp) {
    let i

    for (i in exp) {
      if (typeof exp[i] === 'object') {
        assert.deepStrictEqual(res[i], exp[i])
      } else {
        assert.strictEqual(res[i], exp[i])
      }
    }
  },

  diffText: function (one, other) {
    require('colors')

    const diff = require('diff').diffChars(one, other)

    diff.forEach(function (part) {
      // green for additions, red for deletions
      // grey for common parts
      const color = part.added ? 'green'
        : part.removed ? 'red' : 'grey'
      process.stderr.write(part.value[color])
    })
  }

}

module.exports = M
