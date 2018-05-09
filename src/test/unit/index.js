/* eslint-env mocha */
require('envkey')
const chai = require('chai')
const nock = require('nock')
const dirtyChai = require('dirty-chai')
const { logger } = require('@nudj/library')
chai.use(dirtyChai)

nock.disableNetConnect() // Disable all external requests for testing

const ignoredDomains = [
  'https://api.intercom.io'
]

nock.emitter.on('no match', req => {
  const url = req.url || req.uri || {}
  const requestDomain = `${url.protocol || req.protocol}//${url.host || req.host}`

  if (ignoredDomains.includes(requestDomain)) {
    logger('info', `Nock: Ignored '${req.method}' request on ${req.hostname}`)
  } else {
    const protocol = url.protocol || req.protocol
    const host = url.host || req.host
    const path = url.pathname || url.path || req.path

    logger('info', 'Nock: No match for request:', {
      hostname: req.hostname,
      method: req.method,
      href: req.href || `${protocol}//${host}${path}`,
      protocol: protocol,
      host: host,
      path: path,
      port: url.port || req.port,
      hash: url.hash || req.hash,
      query: url.query || req.query,
      body: req.body
    })
  }
})
