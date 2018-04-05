const { Company } = require('./api')

async function enrichCompanyByDomain (
  domain,
  options = { stream: true }
) {
  try {
    const { stream } = options
    return Company.find({ domain, stream })
  } catch (error) {
    if (error.message === 'Resource lookup queued') {
      throw new Error(`Resource lookup queued for ${domain}`)
    }
    if (error.message !== 'Resource not found') throw error
    return null
  }
}

module.exports = enrichCompanyByDomain
