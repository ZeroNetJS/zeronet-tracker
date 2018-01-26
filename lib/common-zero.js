'use strict'

const arrayOrNull = v => Array.isArray(v) || v == null
const delta = (a, b) => a - b === 0 ? 0 : a - b < 0 ? b - a : a - b

const assert = require('assert')
// quick tests.
assert(delta(0, 2) === 2)
assert(delta(3, -4) === 7)
assert(delta(0, 0) === 0)

const Zero = module.exports

Zero.def = {
  in: {
    protobuf: {
      1: 'repeated string hashes',
      2: 'repeated bytes onion_signs',
      3: 'repeated string onions',
      4: 'string onion_sign_this',
      5: 'repeated string add',
      6: 'int32 need_num',
      7: 'repeated string need_types',
      8: 'int32 port',
      9: 'bool delete'
    },
    strict: {
      onions: arrayOrNull,
      onion_signs: arrayOrNull,
      onion_sign_this: [v => v == null, v => typeof v === 'string' && !isNaN(parseInt(v, 10)) && delta(Zero.pyTime(), parseInt(v, 10)) < 3 * 60],
      add: arrayOrNull,
      need_num: 'number',
      need_types: arrayOrNull,
      port: 'number',
      delete: ['boolean', v => v == null]
    }
  }
}

Zero.fakeZeroNet = () => {
  return {
    rev: '0',
    version: 'v0',
    swarm: {}
  }
}

Zero.pyTime = () => Math.floor(new Date().getTime() / 1000)

Zero.delta = delta
