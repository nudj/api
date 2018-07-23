const omitBy = require('lodash/omitBy')
const isUndefined = require('lodash/isUndefined')
const makeUniqueSlug = require('./make-unique-slug')
const { enrichOrFetchEnrichedCompanyByName } = require('../clearbit')

const createCompany = async (context, companyData) => {
  const {
    name,
    location,
    description,
    onboarded = false,
    client = false
  } = companyData

  const slug = await makeUniqueSlug({
    type: 'companies',
    data: companyData,
    context
  })

  const company = await context.store.create({
    type: 'companies',
    filters: { name },
    data: omitBy({
      name,
      slug,
      location,
      description,
      client,
      onboarded
    }, isUndefined)
  })
  enrichOrFetchEnrichedCompanyByName(company, context)

  return company
}

module.exports = createCompany
