const omit = require('lodash/omit')
const { logger } = require('@nudj/library')
const enrichCompanyByName = require('./enrich-company-by-name')

const enrichOrFetchCachedCompanyByName = async (companyName, context, options) => {
  if (process.env.CLEARBIT_ENABLED !== 'true') return null
  try {
    const enrichedCompany = await context.noSQL.readOne({
      type: 'enrichedCompanies',
      filters: { name: companyName }
    })
    if (enrichedCompany) return enrichedCompany

    const companyData = await enrichCompanyByName(companyName, options)
    return companyData && context.noSQL.create({
      type: 'enrichedCompanies',
      data: {
        ...omit(companyData, ['id']), // omit Clearbit ID
        clearbitId: companyData.id,
        name: companyName
      }
    })
  } catch (error) {
    logger('error', 'Enrichment error', error)
    return null
  }
}

module.exports = enrichOrFetchCachedCompanyByName
