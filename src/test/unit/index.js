/* eslint-env mocha */
require('envkey')
const chai = require('chai')
const nock = require('nock')
const dirtyChai = require('dirty-chai')
const { logger } = require('@nudj/library')
chai.use(dirtyChai)

nock.disableNetConnect() // Disable all external requests for testing

nock.emitter.on('no match', req => {
  const url = req.url || req.uri || {}

  logger('info', 'Nock: No match for request:', {
    hostname: req.hostname,
    method: req.method,
    href: req.href || `${protocol}//${host}${path}`,
    protocol: url.protocol || req.protocol,
    host: url.host || req.host,
    path: url.pathname || url.path || req.path,
    port: url.port || req.port,
    hash: url.hash || req.hash,
    query: url.query || req.query,
    body: req.body
  })
})
