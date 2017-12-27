'use strict'

const arrayOrNull = v => Array.isArray(v) || v == null
const delta = (a, b) => a - b === 0 ? 0 : a - b < 0 ? b - a : a - b

module.exports.def = {
  in: {
    protobuf: {
      1: 'repeated string hashes',
      2: 'repeated bytes onion_signs',
      3: 'repeated string onions',
      4: 'int64 onion_sign_this',
      5: 'repeated string add',
      6: 'int32 need_num',
      7: 'repeated string need_types',
      8: 'int32 port',
      9: 'bool delete'
    },
    strict: {
      onions: arrayOrNull,
      onion_signs: arrayOrNull,
      onion_sign_this: [v => v == null, v => delta(Date.getTime(), v * 1000) < 3 * 60 * 1000 && typeof v === 'number'],
      add: arrayOrNull,
      need_num: 'number',
      need_types: arrayOrNull,
      port: 'number',
      delete: ['boolean', v => v == null]
    }
  }
}

module.exports.fakeZeroNet = () => {
  return {
    rev: '0',
    version: 'v0',
    swarm: {}
  }
}
