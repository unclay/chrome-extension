'use strict'
require('./check-versions')()

const config = require('../config')
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = JSON.parse(config.dev.env.NODE_ENV)
}

const opn = require('opn')
const path = require('path')
const express = require('express')
const webpack = require('webpack')
const superagent = require('superagent')
const proxyMiddleware = require('http-proxy-middleware')
const webpackConfig = (process.env.NODE_ENV === 'testing' || process.env.NODE_ENV === 'production')
  ? require('./webpack.prod.conf')
  : require('./webpack.dev.conf')

// default port where dev server listens for incoming traffic
const port = process.env.PORT || config.dev.port
// automatically open browser, if not set will be false
const autoOpenBrowser = !!config.dev.autoOpenBrowser
// Define HTTP proxies to your custom API backend
// https://github.com/chimurai/http-proxy-middleware
const proxyTable = config.dev.proxyTable

const app = express()
const compiler = webpack(webpackConfig)

const devMiddleware = require('webpack-dev-middleware')(compiler, {
  publicPath: webpackConfig.output.publicPath,
  quiet: true
})

const hotMiddleware = require('webpack-hot-middleware')(compiler, {
  log: false,
  heartbeat: 2000
})
// force page reload when html-webpack-plugin template changes
// currently disabled until this is resolved:
// https://github.com/jantimon/html-webpack-plugin/issues/680
// compiler.plugin('compilation', function (compilation) {
//   compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
//     hotMiddleware.publish({ action: 'reload' })
//     cb()
//   })
// })

// enable hot-reload and state-preserving
// compilation error display
app.use(hotMiddleware)

// proxy api requests
Object.keys(proxyTable).forEach(function (context) {
  let options = proxyTable[context]
  if (typeof options === 'string') {
    options = { target: options }
  }
  app.use(proxyMiddleware(options.filter || context, options))
})
app.use('/aj/data/pc/overview_fans', function (req, res) {
  res.send({
    "code": 100000,
    "data": {
    "userInfo": {
    "uid": 1858805882,
    "followers_count": 559,
    "setTime": 1509531760521
    },
    "followers_incr_count": 2,
    "followers_decr_count": 0,
    "incr_rate": "100.0",
    "decr_rate": 0,
    "list_data": [
    {
    "day_key": "2017-10-25",
    "followers_incr": "0",
    "followers_decr": "0"
    },
    {
    "day_key": "2017-10-26",
    "followers_incr": "1",
    "followers_decr": "0"
    },
    {
    "day_key": "2017-10-27",
    "followers_incr": "0",
    "followers_decr": "0"
    },
    {
    "day_key": "2017-10-28",
    "followers_incr": "0",
    "followers_decr": "0"
    },
    {
    "day_key": "2017-10-29",
    "followers_incr": "0",
    "followers_decr": "0"
    },
    {
    "day_key": "2017-10-30",
    "followers_incr": "1",
    "followers_decr": "0"
    },
    {
    "day_key": "2017-10-31",
    "followers_incr": "0",
    "followers_decr": "0"
    }
    ],
    "list_data_pre": [
    {
    "day_key": "2017-10-18",
    "followers_incr": "0",
    "followers_decr": "0"
    },
    {
    "day_key": "2017-10-19",
    "followers_incr": "0",
    "followers_decr": "0"
    },
    {
    "day_key": "2017-10-20",
    "followers_incr": "0",
    "followers_decr": "0"
    },
    {
    "day_key": "2017-10-21",
    "followers_incr": "0",
    "followers_decr": "0"
    },
    {
    "day_key": "2017-10-22",
    "followers_incr": "0",
    "followers_decr": "0"
    },
    {
    "day_key": "2017-10-23",
    "followers_incr": "1",
    "followers_decr": "0"
    },
    {
    "day_key": "2017-10-24",
    "followers_incr": "0",
    "followers_decr": "0"
    }
    ]
    },
    "msg": "操作成功"
    })
})

app.use('/aj/*', async function (req, res) {
    const result = await superagent.get(`http://dss.sc.weibo.com/aj/${req.params[0]}`).query(req.query).set({
        'Cookie': 'SUB=_2A250_7eADeRhGedG7loZ8CvEwz6IHXVXjK5IrDV8PUNbmtBeLU77kW80Gkj4xycnfa7IBm6jHIK8GodQYQ..; ',
    }).send();
    res.json(result.body);
})
// handle fallback for HTML5 history API
app.use(require('connect-history-api-fallback')())

// serve webpack bundle output
app.use(devMiddleware)

// serve pure static assets
const staticPath = path.posix.join(config.dev.assetsPublicPath, config.dev.assetsSubDirectory)
app.use(staticPath, express.static('./static'))

const uri = 'http://localhost:' + port

var _resolve
var _reject
var readyPromise = new Promise((resolve, reject) => {
  _resolve = resolve
  _reject = reject
})

var server
var portfinder = require('portfinder')
portfinder.basePort = port

console.log('> Starting dev server...')
devMiddleware.waitUntilValid(() => {
  portfinder.getPort((err, port) => {
    if (err) {
      _reject(err)
    }
    process.env.PORT = port
    var uri = 'http://localhost:' + port
    console.log('> Listening at ' + uri + '\n')
    // when env is testing, don't need open it
    if (autoOpenBrowser && process.env.NODE_ENV !== 'testing') {
      opn(uri)
    }
    server = app.listen(port)
    _resolve()
  })
})

module.exports = {
  ready: readyPromise,
  close: () => {
    server.close()
  }
}
