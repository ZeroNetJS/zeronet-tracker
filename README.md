# zeronet-tracker [![travis][travis-image]][travis-url] [![npm][npm-image]][npm-url] [![downloads][downloads-image]][downloads-url] [![javascript style guide][standard-image]][standard-url] [![Greenkeeper badge][greenkeeper-image]][greenkeeper-url]

[travis-image]: https://img.shields.io/travis/ZeroNetJS/zeronet-tracker/master.svg
[travis-url]: https://travis-ci.org/ZeroNetJS/zeronet-tracker
[npm-image]: https://img.shields.io/npm/v/zeronet-tracker.svg
[npm-url]: https://npmjs.org/package/zeronet-tracker
[downloads-image]: https://img.shields.io/npm/dm/zeronet-tracker.svg
[downloads-url]: https://npmjs.org/package/zeronet-tracker
[standard-image]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[standard-url]: https://standardjs.com
[greenkeeper-image]: https://badges.greenkeeper.io/zeronetjs/zeronet-tracker.svg
[greenkeeper-url]: https://greenkeeper.io/

#### Simple, robust, ZeroNet tracker (client & server) implementation

##### Basically I've slaped both the functionalities of a regular Bittorrent Tracker and a ZeroNet Tracker into one server and made it easily usable

![tracker](https://raw.githubusercontent.com/ZeroNetJS/zeronet-tracker/master/img.png)

Node.js implementation of a ZeroNet Tracker (which is a [BitTorrent tracker](https://wiki.theory.org/BitTorrentSpecification#Tracker_HTTP.2FHTTPS_Protocol) that has support for the [ZeroProtocol](https://zeronet.readthedocs.io/en/latest/help_zeronet/network_protocol/) and .onion addresses)

A **ZeroNet tracker** is a web service which responds to requests from ZeroNet
clients. The requests include metrics from clients that help the tracker keep overall
statistics about the torrent. The response includes a peer list that helps the client
participate in the torrent swarm.

This module is used by [ZeroNetJS](https://zeronetjs.github.io).

## features

- Includes client & server implementations
- Supports all mainstream tracker types:
  - HTTP trackers
  - UDP trackers ([BEP 15](http://www.bittorrent.org/beps/bep_0015.html))
  - WebTorrent trackers ([BEP forthcoming](http://webtorrent.io))
  - Zero trackers ([No spec, just code](https://github.com/HelloZeroNet/ZeroNet/blob/master/plugins/disabled-Bootstrapper/BootstrapperPlugin.py))
- Supports ipv4 & ipv6 & onion
- Supports tracker "scrape" extension
- Robust and well-tested
  - Comprehensive test suite (runs entirely offline, so it's reliable)
- Tracker statistics available via web interface at `/stats` or JSON data at `/stats.json`

Also see [zeronet-swarm](https://www.npmjs.com/package/zeronet-swarm).

### Tracker stats

![Screenshot](trackerStats.png)

## install

```
npm install zeronet-tracker
```

## command line

Install `zeronet-tracker` globally:

```sh
$ npm install -g zeronet-tracker
```

Easily start a tracker server:

```sh
$ zeronet-tracker
http server listening on 8000
udp server listening on 8000
ws server listening on 8000
```

Lots of options:

```sh
$ zeronet-tracker --help
  zeronet-tracker - Start a bittorrent tracker server

  Usage:
    zeronet-tracker [OPTIONS]

  If no --http, --udp, or --ws option is supplied, all tracker types will be started.

  Options:
    -p, --port [number]  change the port [default: 8000]
        --trust-proxy    trust 'x-forwarded-for' header from reverse proxy
        --interval       client announce interval (ms) [default: 600000]
        --http           enable http server
        --udp            enable udp server
        --ws             enable websocket server
        --zero           enable zeronet server
    -q, --quiet          only show error output
    -s, --silent         show no output
    -v, --version        print the current version
```

## [api](./api.md)

## license

MIT. Copyright (c) [Feross Aboukhadijeh](https://feross.org), [WebTorrent, LLC](https://webtorrent.io) and [Maciej Krüger](https://mkg20001.github.io).

