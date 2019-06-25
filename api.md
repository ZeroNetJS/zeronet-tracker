## usage

### client

To connect to a tracker, just do this:

```js
var Client = require('zeronet-tracker')

var requiredOpts = {
  infoHash: new Buffer('012345678901234567890'), // hex string or Buffer
  peerId: new Buffer('01234567890123456789'), // hex string or Buffer
  announce: [], // list of tracker server urls
  // zswarm: swarm optional zeronet swarm (will be created if empty)
  port: 6881 // torrent client port, (in browser, optional)
}

var optionalOpts = {
  getAnnounceOpts: function () {
    // Provide a callback that will be called whenever announce() is called
    // internally (on timer), or by the user
    return {
      uploaded: 0,
      downloaded: 0,
      left: 0,
      customParam: 'blah' // custom parameters supported
    }
  }
  // RTCPeerConnection config object (only used in browser)
  rtcConfig: {},
  // User-Agent header for http requests
  userAgent: '',
  // Custom webrtc impl, useful in node to specify [wrtc](https://npmjs.com/package/wrtc)
  wrtc: {},
}

var client = new Client(requiredOpts)

client.on('error', function (err) {
  // fatal client error!
  console.log(err.message)
})

client.on('warning', function (err) {
  // a tracker was unavailable or sent bad data to the client. you can probably ignore it
  console.log(err.message)
})

// start getting peers from the tracker
client.start()

client.on('update', function (data) {
  console.log('got an announce response from tracker: ' + data.announce)
  console.log('number of seeders in the swarm: ' + data.complete)
  console.log('number of leechers in the swarm: ' + data.incomplete)
})

client.once('peer', function (addr) {
  console.log('found a peer: ' + addr) // 85.10.239.191:48623
})

// announce that download has completed (and you are now a seeder)
client.complete()

// force a tracker announce. will trigger more 'update' events and maybe more 'peer' events
client.update()

// provide parameters to the tracker
client.update({
  uploaded: 0,
  downloaded: 0,
  left: 0,
  customParam: 'blah' // custom parameters supported
})

// stop getting peers from the tracker, gracefully leave the swarm
client.stop()

// ungracefully leave the swarm (without sending final 'stop' message)
client.destroy()

// scrape
client.scrape()

client.on('scrape', function (data) {
  console.log('got a scrape response from tracker: ' + data.announce)
  console.log('number of seeders in the swarm: ' + data.complete)
  console.log('number of leechers in the swarm: ' + data.incomplete)
  console.log('number of total downloads of this torrent: ' + data.downloaded)
})
```

### server

To start a BitTorrent tracker server to track swarms of peers:

```js
var Server = require('zeronet-tracker').Server

var server = new Server({
  udp: true, // enable udp server? [default=true]
  http: true, // enable http server? [default=true]
  ws: true, // enable websocket server? [default=true]
  stats: true, // enable web-based statistics? [default=true]
  filter: function (infoHash, params, cb) {
    // Blacklist/whitelist function for allowing/disallowing torrents. If this option is
    // omitted, all torrents are allowed. It is possible to interface with a database or
    // external system before deciding to allow/deny, because this function is async.

    // It is possible to block by peer id (whitelisting torrent clients) or by secret
    // key (private trackers). Full access to the original HTTP/UDP request parameters
    // are available in `params`.

    // This example only allows one torrent.

    var allowed = (infoHash === 'aaa67059ed6bd08362da625b3ae77f6f4a075aaa')
    if (allowed) {
      // If the callback is passed `null`, the torrent will be allowed.
      cb(null)
    } else {
      // If the callback is passed an `Error` object, the torrent will be disallowed
      // and the error's `message` property will be given as the reason.
      cb(new Error('disallowed torrent'))
    }
  }
})

// Internal http, udp, and websocket servers exposed as public properties.
server.http
server.udp
server.ws

server.on('error', function (err) {
  // fatal server error!
  console.log(err.message)
})

server.on('warning', function (err) {
  // client sent bad data. probably not a problem, just a buggy client.
  console.log(err.message)
})

server.on('listening', function () {
  // fired when all requested servers are listening
  console.log('listening on http port:' + server.http.address().port)
  console.log('listening on udp port:' + server.udp.address().port)
})

// start tracker server listening! Use 0 to listen on a random free port.
server.listen(port, hostname, onlistening)

// listen for individual tracker messages from peers:

server.on('start', function (addr) {
  console.log('got start message from ' + addr)
})

server.on('complete', function (addr) {})
server.on('update', function (addr) {})
server.on('stop', function (addr) {})

// get info hashes for all torrents in the tracker server
Object.keys(server.torrents)

// get the number of seeders for a particular torrent
server.torrents[infoHash].complete

// get the number of leechers for a particular torrent
server.torrents[infoHash].incomplete

// get the peers who are in a particular torrent swarm
server.torrents[infoHash].peers
```

The http server will handle requests for the following paths: `/announce`, `/scrape`. Requests for other paths will not be handled.

## multi scrape

Scraping multiple torrent info is possible with a static `Client.scrape` method:

```js
var Client = require('zeronet-tracker')
Client.scrape({ announce: announceUrl, infoHash: [ infoHash1, infoHash2 ]}, function (err, results) {
  results[infoHash1].announce
  results[infoHash1].infoHash
  results[infoHash1].complete
  results[infoHash1].incomplete
  results[infoHash1].downloaded

  // ...
})
````


