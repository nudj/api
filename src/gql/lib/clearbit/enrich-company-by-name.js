const fetchDomainForCompany = require('./fetch-domain-for-company')
const enrichCompanyByDomain = require('./enrich-company-by-domain')

async function enrichCompanyByName (companyName, options) {
  if (process.env.CLEARBIT_ENABLED !== 'true') return null
  const domain = await fetchDomainForCompany(companyName, options)
  if (!domain) return null

  return enrichCompanyByDomain(domain, options)
}

module.exports = enrichCompanyByName
