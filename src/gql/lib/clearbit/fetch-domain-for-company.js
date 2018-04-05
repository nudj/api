const { NameToDomain } = require('./api')

async function fetchDomainForCompany (
  name,
  options = { stream: true }
) {
  try {
    const { stream } = options
    const { domain } = await NameToDomain.find({ name, stream })
    return domain
  } catch (error) {
    if (error.message === 'Resource lookup queued') {
      throw new Error(`Resource lookup queued for ${name}`)
    }
    if (error.message !== 'Resource not found') throw error
    return null
  }
}

module.exports = fetchDomainForCompany
