const { logger } = require('@nudj/library')
const enrichCompanyByDomain = require('./enrich-company-by-domain')

// this is being put on indefinite hiatus after the move to sql as we do not have an immediate need for it
const enrichOrFetchEnrichedCompanyByDomain = async (domain, context, options) => {
  try {
    const enrichedCompany = await context.nosql.readOne({
      type: 'enrichedCompanies',
      filters: { domain }
    })

    if (enrichedCompany) {
      const company = await context.store.readOne({
        type: 'companies',
        filters: { name: enrichedCompany.name }
      })

      return {
        company,
        enrichedCompany
      }
    }

    const companyData = await enrichCompanyByDomain(domain, options)

    return {
      company: null,
      enrichedCompany: companyData
    }
  } catch (error) {
    logger('error', 'Enrichment error', error)
    return { company: null, enrichedCompany: null }
  }
}

module.exports = enrichOrFetchEnrichedCompanyByDomain
