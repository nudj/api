const axios = require('axios')
const { Base64 } = require('js-base64')
const verifyGreenhouseIntegration = require('./verification')
const syncWithGreenhouse = require('./sync')
const postCandidateToGreenhouse = require('./post-candidate')

function encodeKeys ({ partnerKey, harvestKey }) {
  // Greenhouse API keys are required to be suffixed with a colon and then base64 encoded
  return {
    partnerAPIKey: Base64.encode(`${partnerKey}:`),
    harvestAPIKey: Base64.encode(`${harvestKey}:`)
  }
}

function setupHarvestMethods (authKey) {
  const baseURL = 'https://harvest.greenhouse.io/v1/'

  async function get (type, params = {}) {
    const request = await axios.get(`${baseURL}${type}`, {
      params,
      headers: {
        'Authorization': `Basic ${authKey}`
      }
    })

    return request.data
  }

  return { get }
}

function setupPartnerMethods (authKey, authorisedUser) {
  const baseURL = 'https://api.greenhouse.io/v1/partner/'
  const headers = {
    'Authorization': `Basic ${authKey}`,
    'On-Behalf-Of': authorisedUser
  }

  async function get (type, params = {}) {
    const request = await axios.get(`${baseURL}${type}`, {
      params,
      headers
    })

    return request.data
  }

  async function post (type, data = {}) {
    const request = await axios({
      url: `${baseURL}${type}`,
      method: 'post',
      data,
      headers
    })

    return request.data
  }

  return { get, post }
}

function setupGreenhouseHelper ({ partnerKey, harvestKey, user }) {
  const { partnerAPIKey, harvestAPIKey } = encodeKeys({ partnerKey, harvestKey })

  const harvest = setupHarvestMethods(harvestAPIKey)
  const partner = setupPartnerMethods(partnerAPIKey, user)

  return {
    harvest,
    partner,
    verify: verifyGreenhouseIntegration({ harvest, partner }),
    sync: syncWithGreenhouse({ harvest }),
    postCandidate: postCandidateToGreenhouse({ partner })
  }
}

module.exports = setupGreenhouseHelper
