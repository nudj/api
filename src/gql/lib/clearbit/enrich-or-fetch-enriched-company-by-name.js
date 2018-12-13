const omit = require('lodash/omit')
const { logger } = require('@nudj/library')
const enrichCompanyByName = require('./enrich-company-by-name')

const enrichOrFetchEnrichedCompanyByName = async (company, context, options) => {
  if (process.env.CLEARBIT_ENABLED !== 'true') return null
  try {
    const enrichedCompany = await context.sql.readOne({
      type: 'enrichedCompanies',
      id: company.id
    })
    if (enrichedCompany) return enrichedCompany

    const companyData = await enrichCompanyByName(company.name, options)

    let data
    if (companyData) {
      data = {
        ...omit(companyData, ['id']), // omit Clearbit ID
        _key: company.id,
        clearbitId: companyData.id,
        name: company.name
      }
    } else {
      // Store company to record attempted enrichment - nothing returned
      data = {
        _key: company.id,
        name: company.name
      }
    }

    return context.sql.create({
      type: 'enrichedCompanies',
      data
    })
  } catch (error) {
    logger('error', 'Enrichment error', error)
    return null
  }
}

module.exports = enrichOrFetchEnrichedCompanyByName
