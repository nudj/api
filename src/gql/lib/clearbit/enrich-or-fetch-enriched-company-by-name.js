const omit = require('lodash/omit')
const { logger } = require('@nudj/library')
const enrichCompanyByName = require('./enrich-company-by-name')

const enrichOrFetchEnrichedCompanyByName = async (company, context, options) => {
  if (process.env.CLEARBIT_ENABLED !== 'true') return null
  try {
    const enrichedCompany = await context.noSQL.readOne({
      type: 'enrichedCompanies',
      id: company.id
    })
    if (enrichedCompany) return enrichedCompany

    const companyData = await enrichCompanyByName(company.name, options)
    return companyData && context.noSQL.create({
      type: 'enrichedCompanies',
      data: {
        ...omit(companyData, ['id']), // omit Clearbit ID
        _key: company.id,
        clearbitId: companyData.id,
        name: company.name
      }
    })
  } catch (error) {
    logger('error', 'Enrichment error', error)
    return null
  }
}

module.exports = enrichOrFetchEnrichedCompanyByName
