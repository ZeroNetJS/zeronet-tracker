'use strict'

const common = require('../common')
const {parallel} = require('async')
const mafmt = require('mafmt')
const equal = require('assert').deepEqual
const noop = () => {}
const randomIterate = require('random-iterate')
const debug = require('debug')
const log = debug('zeronet-tracker:zero')
const helper = require('zeronet-fileserver/src/pack')

module.exports = function parseZero (swarm, server) {
  function getSwarm (hash, cb) {
    const self = server
    self.getSwarm(hash, function (err, swarm) {
      if (err) return cb(err)
      if (swarm) {
        cb(null, swarm)
      } else {
        createSwarm()
      }
    })

    function createSwarm () {
      if (self._filter) {
        self._filter(hash, {}, function (err) {
          // Precense of err means that this info_hash is disallowed
          if (err) {
            cb(err)
          } else {
            self.createSwarm(hash, function (err, swarm) {
              if (err) return cb(err)
              cb(null, swarm)
            })
          }
        })
      } else {
        self.createSwarm(hash, function (err, swarm) {
          if (err) return cb(err)
          cb(null, swarm)
        })
      }
    }
  }

  function getPeers (swarm, zPeer, needTypes, numwant) {
    var peers = []
    var ite = randomIterate(swarm.peers.keys)
    var peerId
    while ((peerId = ite()) && peers.length < numwant) {
      // Don't mark the peer as most recently used on announce
      var peer = swarm.peers.peek(peerId)
      if (!peer) continue
      if (peer.peerId === zPeer.peerId) continue // don't send peer to itself
      // console.log(peer)
      if (common.IPV4_RE.test(peer.ip)) {
        if (needTypes.indexOf('ip4') === -1) return
      }
      if (peer.ip.endsWith('.onion')) {
        if (needTypes.indexOf('onion') === -1) return
      }
      peers.push(peer)
    }
    return peers
  }

  function announce (swarm, peer, needTypes, needNum, cb) {
    let ignored = 0
    const scrape = needTypes === false
    peer.addrs.forEach(({addr, type, validated}) => {
      if (!peer.port) return
      const btPeer = swarm.peers.get(addr)
      if ((!validated && !btPeer) || (!validated && btPeer.peerId != peer.peerId)) return ignored++

      if (scrape) {
        if (!btPeer) return
        swarm._onAnnounceStopped({}, btPeer, peer.peerId)
      }

      if (!btPeer) {
        swarm._onAnnounceStarted({
          type: 'zero',
          left: 0,
          peerId: peer.peerId, // as hex
          ip: addr,
          port: peer.port
        }, btPeer, peer.peerId)
      } else {
        swarm._onAnnounceUpdate({}, btPeer, peer.peerId)
      }
    })

    if (scrape) return cb()
    return cb(null, getPeers(swarm, peer, needTypes, needNum), !!ignored)
  }

  swarm.protocol.handle('announce', common.def, (data, cb) => {
    const client = data._client
    // console.log(data)

    let peer = {
      peerId: client.handshake.remote.peer_id,
      port: data.port || 0,
      addrs: []
    }

    const hashes = data.hashes.map(h => Buffer.from(h).toString('hex'))
    const needNum = Math.min(hashes.length >= 500 ? 5 : 30, data.need_num || 0)

    const validators = {
      ip4: cb => {
        client.getObservedAddrs((err, addrs) => {
          if (err) return cb(err)
          try {
            let addr = addrs.filter(a => mafmt.TCP.matches(a)).filter(a => !equal(a.protoNames(), [ 'ip4', 'tcp' ])).filter(a => Boolean(a.stringTuples()[1][1]) /* port !== 0 */)[0] // use first valid ip4
            if (!addr) return cb()
            addr = addr.stringTuples()[0][1]
            if (addr == '127.0.0.1') return cb(new Error('localhost not allowed!'))
            peer.addrs.push({type: 'ip4', addr, validated: true})
            cb()
          } catch (e) {
            cb(e)
          }
        })
      },
      onion: cb => {
        cb() // TODO: add
      }
    }

    let onionNeedSign = false
    let hash2peer = {}

    parallel((data.port && data.add ? data.add : []).map(type => validators[type] || noop), err => {
      if (err) log(err)
      if (err) return cb(err)
      parallel(hashes.map(h => cb => {
        getSwarm(h, (err, swarm) => {
          if (err) return cb(err)
          announce(swarm, peer, data.need_types || [], needNum, (err, peers, needSign) => {
            onionNeedSign = onionNeedSign || needSign
            hash2peer[h] = peers
            cb()
          })
        })
      }), err => {
        if (err) log(err)
        if (err) return cb(err)
        let res = {
          peers: hashes.map(h => {
            let r = {
              ip4: [],
              onion: []
            }
            hash2peer[h].forEach(peer => {
              if (peer.ip.endsWith('.onion')) {
                r.onion.push(Buffer.from(helper.onion.pack(peer.ip, peer.port), 'binary'))
              } else {
                r.ip4.push(Buffer.from(helper.ip4.pack(peer.ip, peer.port), 'binary'))
              }
            })
            return r
          })
        }
        // console.log(res)
        cb(null, res)
      })
    })
  })
}
