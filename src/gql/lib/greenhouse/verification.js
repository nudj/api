const get = require('lodash/get')

function verifyGreenhouseIntegration ({ harvest, partner }) {
  return async () => {
    try {
      await Promise.all([
        // Permissions we need for the Harvest API
        harvest.get('jobs'),
        harvest.get('job_posts'),

        // The Partner API has all-or-nothing permissions
        partner.get('current_user')
      ])
    } catch (err) {
      const message = get(err, 'response.data.message') || get(err, 'response.data.errors[0].message')
      const code = get(err, 'response.status')
      const url = get(err, 'response.config.url')
      const endpoint = url && url.split('/').reverse()[0]
      const field = url.includes('harvest.greenhouse') ? 'harvestKey' : 'partnerKey'

      const error = new Error('Verification failed')
      error.fields = [{
        field,
        code,
        message,
        endpoint
      }]

      throw error
    }
  }
}

module.exports = verifyGreenhouseIntegration
