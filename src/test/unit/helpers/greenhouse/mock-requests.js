const nock = require('nock')
const { Base64 } = require('js-base64')

const VALID_HARVEST_KEY = 'VALID_HARVEST_KEY'
const INVALID_HARVEST_KEY = 'INVALID_HARVEST_KEY'
const BAD_PERMISSIONS_HARVEST_KEY = 'BAD_PERMISSIONS_HARVEST_KEY'
const VALID_PARTNER_KEY = 'VALID_PARTNER_KEY'
const INVALID_PARTNER_KEY = 'INVALID_PARTNER_KEY'
const VALID_USER = 'VALID_USER'
const INVALID_USER = 'INVALID_USER'

function mockGreenhouseAPIRequests (props = {}) {
  const {
    validHarvestKey = VALID_HARVEST_KEY,
    badPermissionsHarvestKey = BAD_PERMISSIONS_HARVEST_KEY,
    invalidHarvestKey = INVALID_HARVEST_KEY
  } = props
  // Valid HarvestAPI requests
  nock('https://harvest.greenhouse.io', {
    reqheaders: {
      'Authorization': `Basic ${Base64.encode(`${validHarvestKey}:`)}`
    }
  })
    .persist()
    .get('/v1/jobs')
    .query(() => true)
    .reply(200, [])

  nock('https://harvest.greenhouse.io', {
    reqheaders: {
      'Authorization': `Basic ${Base64.encode(`${validHarvestKey}:`)}`
    }
  })
    .persist()
    .get('/v1/job_posts')
    .query(() => true)
    .reply(200)

  // Invalid Harvest API key requests
  nock('https://harvest.greenhouse.io', {
    reqheaders: {
      'Authorization': `Basic ${Base64.encode(`${invalidHarvestKey}:`)}`
    }
  })
    .persist()
    .get('/v1/jobs')
    .query(() => true)
    .reply(200)
  nock('https://harvest.greenhouse.io', {
    reqheaders: {
      'Authorization': `Basic ${Base64.encode(`${invalidHarvestKey}:`)}`
    }
  })
    .get('/v1/job_posts')
    .query(() => true)
    .reply(401, {
      message: 'Invalid Basic Auth credentials'
    })

  // Bad permissions Harvest API key requests
  nock('https://harvest.greenhouse.io', {
    reqheaders: {
      'Authorization': `Basic ${Base64.encode(`${badPermissionsHarvestKey}:`)}`
    }
  })
    .persist()
    .get('/v1/jobs')
    .query(() => true)
    .reply(200)
  nock('https://harvest.greenhouse.io', {
    reqheaders: {
      'Authorization': `Basic ${Base64.encode(`${badPermissionsHarvestKey}:`)}`
    }
  })
    .persist()
    .get('/v1/job_posts')
    .query(() => true)
    .reply(200)

  // Valid Partner API key request
  nock('https://api.greenhouse.io')
    .persist()
    .get('/v1/partner/current_user')
    .query(() => true)
    .reply(200)

  // Generic Harvest API requests
  nock('https://harvest.greenhouse.io')
    .persist()
    .get('/v1/job_posts')
    .query(() => true)
    .reply(200, [])
  nock('https://harvest.greenhouse.io')
    .persist()
    .get('/v1/jobs')
    .query(() => true)
    .reply(200, [])
}

module.exports = {
  mockGreenhouseAPIRequests,
  // constants
  VALID_HARVEST_KEY,
  INVALID_HARVEST_KEY,
  BAD_PERMISSIONS_HARVEST_KEY,
  VALID_PARTNER_KEY,
  INVALID_PARTNER_KEY,
  VALID_USER,
  INVALID_USER
}
